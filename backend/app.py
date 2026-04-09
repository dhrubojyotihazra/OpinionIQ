import os
import io
import json
import re
import pandas as pd
import numpy as np
import urllib.request
from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import Counter
from textblob import TextBlob
from dotenv import load_dotenv
load_dotenv()

# ==========================================
# LOAD API KEYS FROM ENVIRONMENT VARIABLES
# ==========================================
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
HF_TOKEN = os.getenv("HF_TOKEN")

if not GROQ_API_KEY or not HF_TOKEN:
    raise ValueError("Missing required environment variables: GROQ_API_KEY and/or HF_TOKEN")

os.environ["GROQ_API_KEY"] = GROQ_API_KEY
os.environ["HF_TOKEN"] = HF_TOKEN
# ==========================================

GROQ_MODEL = "llama-3.1-8b-instant"

app = Flask(__name__)

# Security: Limit file upload size to 50MB
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

# CORS configuration - restrict origins in production
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
CORS(app, origins=allowed_origins)

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Rate limiting to prevent abuse
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# ---------------------------------------------------------------------------
# Standard schema that the LLM maps arbitrary column names onto
# (identical to the notebook definition)
# ---------------------------------------------------------------------------
STANDARD_SCHEMA = {
    "review_text":  "The main textual review/feedback written by the customer (long-form text)",
    "rating":       "Numeric star/score rating given by the customer (e.g. 1-5)",
    "sentiment":    "Pre-labeled sentiment category: positive, negative, or neutral",
    "product_name": "Name or identifier of the product/item being reviewed",
    "review_title": "Short title or headline/summary of the review",
    "customer_id":  "Unique identifier for the customer/user",
    "age":          "Customer age (numeric) or age group/range",
    "category":     "Product category, department, class, or type",
    "date":         "Date or timestamp of the review",
    "helpful_votes":"Count of helpful votes, likes, or upvotes for the review",
}

# ---------------------------------------------------------------------------
# Stopwords for keyword extraction (mirrors wordcloud.STOPWORDS logic)
# ---------------------------------------------------------------------------
STOPWORDS = {
    "the", "and", "to", "a", "of", "in", "is", "it", "for", "that",
    "on", "with", "as", "was", "this", "but", "are", "not", "have",
    "be", "at", "or", "they", "so", "i", "he", "she", "we", "you",
    "an", "if", "by", "do", "my", "me", "its", "up", "all", "had",
    "from", "has", "him", "his", "her", "their", "our", "your",
    "one", "just", "been", "will", "would", "could", "should", "also",
    "than", "then", "there", "very", "can", "more", "did", "no", "about",
    "out", "what", "who", "when", "how", "into", "which", "get", "got"
}

# ---------------------------------------------------------------------------
# Global in-memory store (no DB)
# ---------------------------------------------------------------------------
global_df     = None   # raw uploaded CSV
global_std_df = None   # standardized DataFrame after pipeline
global_mapped_cols = []

# ---------------------------------------------------------------------------
# Groq HTTP wrapper  (reuses the urllib-based approach established earlier)
# ---------------------------------------------------------------------------
class GroqModel:
    def __init__(self, model_name: str):
        self.model_name = model_name

    def chat(self, prompt: str, temperature: float = 0.0, max_tokens: int = 700) -> str:
        url  = "https://api.groq.com/openai/v1/chat/completions"
        data = json.dumps({
            "model":    self.model_name,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens":  max_tokens,
        }).encode("utf-8")

        req = urllib.request.Request(url, data=data, headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type":  "application/json",
            "User-Agent":    (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36 OpinionIQ/1.0"
            )
        })

        try:
            with urllib.request.urlopen(req) as resp:
                raw = resp.read().decode("utf-8")
                result = json.loads(raw)
                return result["choices"][0]["message"]["content"].strip()
        except urllib.error.HTTPError as e:
            raise Exception(f"Groq API Error: {e.read().decode('utf-8')}")


model = GroqModel(GROQ_MODEL)


# ===========================================================================
# PIPELINE FUNCTIONS  (ported 1-to-1 from the notebook)
# ===========================================================================

def load_dataset_from_bytes(content_bytes: bytes) -> pd.DataFrame:
    """Cell 2 – load_dataset: encoding fallback + drop fully-empty rows/cols."""
    try:
        raw_text = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        print("UTF-8 decode failed, retrying with latin-1 …")
        raw_text = content_bytes.decode("latin-1")

    # Pre-process: strip outer quotes that some exporters add per line
    cleaned_lines = []
    for line in raw_text.splitlines():
        s = line.strip()
        if s.startswith('"') and s.endswith('"') and len(s) > 1:
            s = s[1:-1]
        if s:
            cleaned_lines.append(s)
    cleaned_text = "\n".join(cleaned_lines)

    stream = io.StringIO(cleaned_text, newline=None)
    df = pd.read_csv(stream, sep=None, engine="python")

    # Drop fully empty rows / columns
    df.dropna(how="all", inplace=True)
    df.dropna(axis=1, how="all", inplace=True)

    print(f"Loaded: {df.shape[0]:,} rows × {df.shape[1]} columns")
    return df


def build_column_context(df: pd.DataFrame, max_samples: int = 3) -> list:
    """Cell 3 – build_column_context: concise per-column summary for the LLM."""
    col_info = []
    for col in df.columns:
        samples     = df[col].dropna().head(max_samples).tolist()
        samples_str = [str(s)[:80] for s in samples]
        col_info.append({
            "column":  col,
            "dtype":   str(df[col].dtype),
            "samples": samples_str,
        })
    return col_info


def map_columns_with_groq(df: pd.DataFrame) -> dict:
    """
    Cell 3 – map_columns_with_groq:
    Send column info to Groq LLM; parse resulting JSON mapping.
    Returns dict: { original_col_name: standard_name_or_null, ... }
    """
    print("Sending column info to Groq for intelligent mapping …")

    col_context = build_column_context(df)
    schema_desc = "\n".join([f"  - {k}: {v}" for k, v in STANDARD_SCHEMA.items()])

    prompt = (
        "You are a data schema expert. "
        "I have a customer review dataset with the following columns:\n\n"
        f"{json.dumps(col_context, indent=2)}\n\n"
        "Map each column to ONE of these standard schema names (or null if no match):\n"
        f"{schema_desc}\n\n"
        "Rules:\n"
        "- Each standard name can only be assigned ONCE (pick the best match)\n"
        "- If a column doesn't match any standard name, map it to null\n"
        "- Index or unnamed ID columns should map to null unless clearly customer IDs\n"
        "- Return ONLY valid JSON, no explanation, no markdown\n\n"
        'Format:\n{"original_column_name": "standard_name_or_null", ...}'
    )

    raw = model.chat(prompt, temperature=0.0, max_tokens=700)
    print(f"Groq raw mapping response:\n{raw[:500]}\n{'–'*40}")

    # Strip markdown fences if present (notebook Cell 3 does this too)
    raw = re.sub(r"```json|```", "", raw).strip()

    try:
        mapping = json.loads(raw)
    except json.JSONDecodeError:
        # Try to extract the first {...} block
        m = re.search(r"\{.*\}", raw, re.DOTALL)
        if m:
            mapping = json.loads(m.group(0))
        else:
            print("Could not parse Groq mapping response; using empty mapping.")
            mapping = {}

    return mapping


def build_standard_df(df_raw: pd.DataFrame, mapping: dict):
    """
    Cell 4 – build_standard_df:
    Rename + type-coerce columns according to LLM mapping.
    Returns (df_std, mapped_cols_list).
    """
    df = df_raw.copy()

    standardized_data   = {}
    used_standard_names = set()

    for orig_col, std_name in mapping.items():
        if std_name and std_name not in used_standard_names:
            if orig_col in df.columns:
                standardized_data[std_name] = df[orig_col]
                used_standard_names.add(std_name)
            # duplicate std names: keep first occurrence (as in notebook)

    df_std = pd.DataFrame(standardized_data)
    std_cols_present = list(df_std.columns)

    # Type coercions (notebook Cell 4)
    if "rating" in df_std.columns:
        df_std["rating"] = pd.to_numeric(df_std["rating"], errors="coerce")

    if "age" in df_std.columns:
        df_std["age"] = pd.to_numeric(df_std["age"], errors="coerce")

    if "helpful_votes" in df_std.columns:
        df_std["helpful_votes"] = pd.to_numeric(df_std["helpful_votes"], errors="coerce")

    if "date" in df_std.columns:
        df_std["date"] = pd.to_datetime(df_std["date"], errors="coerce",
                                        infer_datetime_format=True)

    if "sentiment" in df_std.columns:
        df_std["sentiment"] = df_std["sentiment"].astype(str).str.strip().str.lower()

    if "review_text" in df_std.columns:
        df_std["review_text"] = df_std["review_text"].astype(str).replace("nan", np.nan)

    return df_std, std_cols_present


# ---------------------------------------------------------------------------
# EDA helpers
# ---------------------------------------------------------------------------

def compute_missing_values(df: pd.DataFrame) -> dict:
    """Cell 5 – missing value percentages per column."""
    result = {}
    for col in df.columns:
        pct = round(df[col].isna().mean() * 100, 1)
        result[col] = pct
    return result


def compute_rating_distribution(df: pd.DataFrame) -> list:
    """
    Cell 6 – count of each star rating.
    Returns list of {rating, count} dicts sorted by rating ascending.
    """
    if "rating" not in df.columns:
        return []

    vc   = df["rating"].dropna().astype(int).value_counts().sort_index()
    data = [{"rating": int(r), "count": int(c)} for r, c in vc.items()]
    return data


def derive_sentiment(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cell 7 – derive_sentiment:
    Priority: pre-labeled 'sentiment' → 'rating' → TextBlob on 'review_text'.
    Adds a 'sentiment_derived' column.
    """
    def normalise(s: str) -> str:
        s = str(s).lower().strip()
        if any(x in s for x in ["pos", "good", "great", "5", "4"]):
            return "positive"
        elif any(x in s for x in ["neg", "bad", "poor", "1", "2"]):
            return "negative"
        elif any(x in s for x in ["neu", "mixed", "3"]):
            return "neutral"
        return s

    def from_rating(r) -> str:
        if pd.isna(r):
            return "unknown"
        if r >= 4:
            return "positive"
        if r == 3:
            return "neutral"
        return "negative"

    def textblob_sentiment(text: str) -> str:
        if pd.isna(text) or str(text).strip() == "":
            return "unknown"
        polarity = TextBlob(str(text)).sentiment.polarity
        if polarity >  0.05:
            return "positive"
        if polarity < -0.05:
            return "negative"
        return "neutral"

    if "sentiment" in df.columns:
        print("Using pre-labeled sentiment column.")
        df["sentiment_derived"] = df["sentiment"].apply(normalise)
    elif "rating" in df.columns:
        print("Deriving sentiment from rating column …")
        df["sentiment_derived"] = df["rating"].apply(from_rating)
    elif "review_text" in df.columns:
        print("Deriving sentiment via TextBlob (may be slow) …")
        df["sentiment_derived"] = df["review_text"].apply(textblob_sentiment)
    else:
        print("Cannot derive sentiment – no suitable column found.")

    return df


def compute_sentiment_distribution(df: pd.DataFrame) -> list:
    """
    Cell 7 output: count of positive/negative/neutral reviews.
    Returns list of {sentiment, count} dicts.
    """
    if "sentiment_derived" not in df.columns:
        return []

    vc   = df["sentiment_derived"].value_counts()
    data = [{"sentiment": str(s), "count": int(c)} for s, c in vc.items()]
    return data


def compute_top_keywords(df: pd.DataFrame, top_n: int = 30) -> dict:
    """
    Cell 8 – WordCloud logic:
    Extract top words for positive vs. negative reviews.
    Returns {"positive": {word: freq, ...}, "negative": {word: freq, ...}}
    """
    result = {"positive": {}, "negative": {}}

    if "review_text" not in df.columns or "sentiment_derived" not in df.columns:
        return result

    for sentiment_label in ["positive", "negative"]:
        subset = df[df["sentiment_derived"] == sentiment_label]["review_text"].dropna().astype(str)
        words  = " ".join(subset).lower().split()
        words  = [re.sub(r"[^a-z]+", "", w) for w in words if len(w) > 3]
        words  = [w for w in words if w and w not in STOPWORDS]
        freq   = dict(Counter(words).most_common(top_n))
        result[sentiment_label] = freq

    return result


# ===========================================================================
# FLASK ROUTES
# ===========================================================================

@app.route("/upload", methods=["POST"])
@limiter.limit("10 per hour")
def upload_csv():
    """
    TASK 1 – Accepts CSV upload, runs the full notebook pipeline
    (load → map_columns → build_standard_df), and stores results globally.
    """
    global global_df, global_std_df, global_mapped_cols

    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    try:
        # Validate file extension
        if not file.filename.endswith('.csv'):
            return jsonify({"error": "Only CSV files are allowed"}), 400

        content_bytes = file.stream.read()

        # Step 1 – load dataset (notebook Cell 2)
        df_raw = load_dataset_from_bytes(content_bytes)

        # Step 2 – map columns via Groq LLM (notebook Cell 3)
        raw_mapping = map_columns_with_groq(df_raw)
        print("Column mapping:", raw_mapping)

        # Step 3 – build standardised DataFrame (notebook Cell 4)
        df_std, mapped_cols = build_standard_df(df_raw, raw_mapping)

        global_df          = df_raw
        global_std_df      = df_std
        global_mapped_cols = mapped_cols

        return jsonify({
            "message":         "File uploaded and processed successfully",
            "total_rows":      len(df_raw),
            "mapped_columns":  mapped_cols,
        }), 200

    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/analyze", methods=["POST"])
def analyze():
    """
    TASK 2 & 3 – Run EDA on the standardised DataFrame and return
    a structured JSON payload for Recharts/Shadcn frontend.
    """
    global global_df, global_std_df, global_mapped_cols

    if global_std_df is None:
        return jsonify({"error": "No dataset uploaded yet. Call /upload first."}), 400

    try:
        df = global_std_df.copy()

        # Step 4 – derive sentiment (notebook Cell 7)
        df = derive_sentiment(df)

        # ---------------------------------------------------------------
        # TASK 2 – translate chart cells into JSON aggregations
        # ---------------------------------------------------------------

        # Cell 5 – missing values
        missing_values = compute_missing_values(df)

        # Cell 6 – rating distribution
        rating_distribution = compute_rating_distribution(df)

        # Cell 7 – sentiment distribution
        sentiment_distribution = compute_sentiment_distribution(df)

        # Cell 8 – top keywords per sentiment
        top_keywords = compute_top_keywords(df, top_n=30)

        # ---------------------------------------------------------------
        # TASK 3 – executive summary via Groq (keep existing logic)
        # ---------------------------------------------------------------
        total_reviews        = len(df)
        sentiment_counts_raw = df.get("sentiment_derived",
                                      pd.Series(dtype=str)).value_counts().to_dict()

        texts_for_summary = []
        if "review_text" in df.columns:
            texts_for_summary = df["review_text"].dropna().astype(str).tolist()

        stop_words   = {"the","and","to","a","of","in","is","it","for","that",
                        "on","with","as","was","this","but","are","not","have",
                        "be","at","or","they","so"}
        all_words    = " ".join(texts_for_summary).lower().split()
        all_words    = [re.sub(r"[^a-z]+", "", w) for w in all_words if len(w) > 3]
        all_words    = [w for w in all_words if w and w not in stop_words]
        top_words_10 = dict(Counter(all_words).most_common(10))

        stats_summary = (
            f"Analyzed {total_reviews:,} total feedback entries. "
            f"Sentiment breakdown: {sentiment_counts_raw}. "
            f"Top words used: {list(top_words_10.keys())}."
        )
        summary_prompt = (
            f"Based on these statistics from a total of {total_reviews:,} analyzed reviews: "
            f"{stats_summary}. "
            "Generate a 2-paragraph Executive Summary of the customer sentiment. "
            f"Explicitly mention the total volume of reviews analyzed ({total_reviews:,}) "
            "to emphasize the scale."
        )
        executive_summary = model.chat(summary_prompt, temperature=0.7, max_tokens=500)

        # ---------------------------------------------------------------
        # TASK 3 – clean JSON response
        # ---------------------------------------------------------------
        return jsonify({
            # Overview
            "total_reviews":          total_reviews,
            "mapped_columns":         global_mapped_cols,

            # EDA aggregations (Tasks 2 + 3)
            "missing_values":         missing_values,
            "rating_distribution":    rating_distribution,
            "sentiment_distribution": sentiment_distribution,
            "top_keywords":           top_keywords,

            # Executive summary
            "summary":                executive_summary,
        }), 200

    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Legacy / supplementary routes (kept from original app.py, updated to use
# the standardised DataFrame)
# ---------------------------------------------------------------------------

@app.route("/chat/data", methods=["POST"])
def chat_data():
    global global_std_df

    if global_std_df is None:
        return jsonify({"error": "No dataset available."}), 400

    data  = request.json or {}
    query = data.get("message", "")
    if not query:
        return jsonify({"error": "Empty query"}), 400

    try:
        df = global_std_df.copy()

        # ── Derive sentiment if not yet present ──
        if "sentiment_derived" not in df.columns:
            df = derive_sentiment(df)

        total_rows = len(df)
        columns    = df.columns.tolist()

        # Sentiment breakdown (full dataset)
        sent_counts = {}
        if "sentiment_derived" in df.columns:
            sent_counts = df["sentiment_derived"].value_counts().to_dict()

        # Rating distribution (full dataset)
        rating_dist = {}
        avg_rating  = None
        if "rating" in df.columns:
            rating_dist = df["rating"].value_counts().sort_index().to_dict()
            avg_rating  = round(float(df["rating"].dropna().mean()), 2)

        # Missing value summary
        missing = {c: round(df[c].isna().mean() * 100, 1) for c in columns}

        # Top keywords positive / negative (top 15 each)
        kw_pos, kw_neg = [], []
        if "review_text" in df.columns and "sentiment_derived" in df.columns:
            for label, bucket in [("positive", kw_pos), ("negative", kw_neg)]:
                texts = df[df["sentiment_derived"] == label]["review_text"].dropna().astype(str)
                words = " ".join(texts).lower().split()
                words = [re.sub(r"[^a-z]+", "", w) for w in words if len(w) > 3]
                words = [w for w in words if w and w not in STOPWORDS]
                bucket.extend([w for w, _ in Counter(words).most_common(15)])

        # Sample rows for reference (just 5 rows for LLM context window)
        sample_str = df.head(5).to_string()

        stats_block = (
            f"DATASET STATS (FULL {total_rows:,}-ROW DATASET):\n"
            f"- Total reviews: {total_rows:,}\n"
            f"- Columns: {', '.join(columns)}\n"
            f"- Sentiment breakdown: {sent_counts}\n"
            f"- Rating distribution (star→count): {rating_dist}\n"
            f"- Average rating: {avg_rating}\n"
            f"- Missing value % per column: {missing}\n"
            f"- Top positive keywords: {kw_pos}\n"
            f"- Top negative keywords: {kw_neg}\n\n"
            f"Sample rows (5 rows for column format reference):\n{sample_str}"
        )

        prompt = (
            f"You are an expert Data Analyst with access to aggregated statistics "
            f"computed from the ENTIRE dataset (not just a sample).\n\n"
            f"{stats_block}\n\n"
            f'User question: "{query}"\n\n'
            f"Answer directly and precisely using the full-dataset statistics above. "
            f"Always reference the actual total number of rows ({total_rows:,}) when relevant. "
            f"Do not say based on the sample - the stats are from the full dataset. "
            f"Do not show code."
        )

        response = model.chat(prompt, temperature=0.3, max_tokens=700)
        return jsonify({"response": response}), 200

    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/chat/report", methods=["POST"])
def chat_report():
    global global_std_df

    data    = request.json or {}
    query   = data.get("message", "")
    context = data.get("context", "")

    if not query:
        return jsonify({"error": "Empty query"}), 400

    try:
        stats_context = "No dataset has been uploaded yet."

        if global_std_df is not None:
            df = global_std_df.copy()

            # Derive sentiment if not yet present
            if "sentiment_derived" not in df.columns:
                df = derive_sentiment(df)

            total_rows = len(df)
            columns    = df.columns.tolist()

            # Sentiment breakdown
            sent_counts = {}
            if "sentiment_derived" in df.columns:
                sent_counts = df["sentiment_derived"].value_counts().to_dict()
                # compute percentages
                sent_pct = {k: round(v / total_rows * 100, 1) for k, v in sent_counts.items()}
            else:
                sent_pct = {}

            # Rating stats
            avg_rating  = None
            rating_dist = {}
            if "rating" in df.columns:
                avg_rating  = round(float(df["rating"].dropna().mean()), 2)
                rating_dist = df["rating"].value_counts().sort_index().to_dict()

            # Top keywords
            kw_pos, kw_neg = [], []
            if "review_text" in df.columns and "sentiment_derived" in df.columns:
                for label, bucket in [("positive", kw_pos), ("negative", kw_neg)]:
                    texts = df[df["sentiment_derived"] == label]["review_text"].dropna().astype(str)
                    words = " ".join(texts).lower().split()
                    words = [re.sub(r"[^a-z]+", "", w) for w in words if len(w) > 3]
                    words = [w for w in words if w and w not in STOPWORDS]
                    bucket.extend([w for w, _ in Counter(words).most_common(20)])

            stats_context = (
                f"FULL DATASET STATISTICS ({total_rows:,} total reviews):\n"
                f"- Columns present: {', '.join(columns)}\n"
                f"- Sentiment counts: {sent_counts}\n"
                f"- Sentiment percentages: {sent_pct}\n"
                f"- Average star rating: {avg_rating}\n"
                f"- Rating distribution (star→count): {rating_dist}\n"
                f"- Top positive keywords: {kw_pos}\n"
                f"- Top negative keywords: {kw_neg}\n"
            )

        prompt = (
            "You are a senior business intelligence analyst writing an executive report.\n"
            "You have access to the following pre-computed statistics from the ENTIRE dataset:\n\n"
            f"{stats_context}\n"
            f"Additional context: {context}\n\n"
            f"User question: {query}\n\n"
            "Write a professional, insight-driven answer. "
            "Always cite actual numbers from the statistics above. "
            "Use markdown formatting (bold headings, bullet lists) where appropriate."
        )
        response = model.chat(prompt, temperature=0.5, max_tokens=700)
        return jsonify({"response": response}), 200

    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    is_production = os.getenv("FLASK_ENV") == "production"
    app.run(debug=not is_production, host="0.0.0.0", port=5000)
