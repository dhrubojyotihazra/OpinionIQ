import os
import io
import json
import re
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from transformers import pipeline
from collections import Counter
# from pandasai import SmartDataframe
# from pandasai.llm.google import GoogleGemini

# ==========================================
# ADD YOUR API KEYS HERE
# ==========================================
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"
HF_TOKEN = "YOUR_HF_TOKEN_HERE"
os.environ["GEMINI_API_KEY"] = GEMINI_API_KEY
os.environ["HF_TOKEN"] = HF_TOKEN
# ==========================================

app = Flask(__name__)
CORS(app)

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# Global variable to store dataframe since no database
global_df = None

# Initialize Hugging Face pipeline
sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english", token=HF_TOKEN)

@app.route('/upload', methods=['POST'])
def upload_csv():
    global global_df
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        # Save as stringio to read
        raw_text = file.stream.read().decode("UTF8")
        
        # Pre-process: if lines are wrapped in extra outer quotes, strip them
        cleaned_lines = []
        for line in raw_text.splitlines():
            s_line = line.strip()
            if s_line.startswith('"') and s_line.endswith('"') and len(s_line) > 1:
                s_line = s_line[1:-1]
            if s_line: # ignore empty lines
                cleaned_lines.append(s_line)
        cleaned_text = '\n'.join(cleaned_lines)
            
        stream = io.StringIO(cleaned_text, newline=None)
        # Use python engine to automatically detect separator (fixes CSVs that use unexpected delimiters)
        df = pd.read_csv(stream, sep=None, engine='python')
        
        # Read the first 5 rows to identify columns
        head_json = df.head(5).to_json(orient='records')
        
        prompt = f"""
        Given the following 5 rows of a dataset:
        {head_json}
        Identify the column that contains the 'feedback text' and the column that contains the 'rating' (if any).
        Return ONLY a raw JSON object (no markdown formatting, no '```json') with keys 'text_column' and 'rating_column'. If no rating column is found, set its value to null.
        """
        
        # Use Gemini to find the columns
        response = model.generate_content(prompt)
        text_resp = response.text.strip()
        print(f"--- GEMINI RAW RESPONSE ---\n{text_resp}\n---------------------------")
        
        # Clean up markdown if still present
        if text_resp.startswith("```json"):
            text_resp = text_resp[7:]
        if text_resp.endswith("```"):
            text_resp = text_resp[:-3]
            
        text_resp = text_resp.strip()
        
        col_info = json.loads(text_resp)
        print("GEMINI PARSED JSON:", col_info)
        text_col = col_info.get('text_column')
        
        # Try to find the exact column, handling potential whitespace issues
        original_cols = list(df.columns)
        matched_col = None
        
        if text_col:
            for c in original_cols:
                if c.strip() == text_col.strip():
                    matched_col = c
                    break
        
        if matched_col:
            df = df.rename(columns={matched_col: 'target_text'})
            print(f"Renamed column '{matched_col}' to 'target_text'.")
        else:
            print(f"ERROR: Could not find column '{text_col}' in {original_cols}")
            return jsonify({'error': f'Could not find the identified feedback column "{text_col}" in the dataset {original_cols}.'}), 400
            
        global_df = df
        return jsonify({'message': 'File uploaded successfully', 'columns': list(global_df.columns), 'rows': len(global_df)}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    global global_df
    if global_df is None:
        return jsonify({'error': 'No dataset uploaded yet.'}), 400
        
    try:
        df = global_df.copy()
        if 'target_text' not in df.columns:
            return jsonify({'error': 'target_text column not found. Please upload a valid CSV.'}), 400
            
        # Max 300 rows
        analysis_df = df.head(300)
        # Drop rows where target_text is NaN
        analysis_df = analysis_df.dropna(subset=['target_text'])
        texts = analysis_df['target_text'].astype(str).tolist()
        
        results = sentiment_analyzer(texts)
        analysis_df['sentiment'] = [res['label'] for res in results]
        analysis_df['sentiment_score'] = [res['score'] for res in results]
        
        # Calculate stats for Plotly
        sentiment_counts = analysis_df['sentiment'].value_counts().to_dict()
        
        # Simple word frequency excluding basic stop words
        stop_words = {'the', 'and', 'to', 'a', 'of', 'in', 'is', 'it', 'for', 'that', 'on', 'with', 'as', 'was', 'this', 'but', 'are', 'not', 'have', 'be', 'at', 'or', 'they', 'so'}
        words = ' '.join(texts).lower().split()
        words = [re.sub(r'[^a-z]+', '', w) for w in words if len(w) > 3]
        words = [w for w in words if w and w not in stop_words]
        top_words = dict(Counter(words).most_common(10))
        
        plotly_data = {
            'sentiment_pie': {
                'labels': list(sentiment_counts.keys()),
                'values': list(sentiment_counts.values())
            },
            'top_words_bar': {
                'x': list(top_words.keys()),
                'y': list(top_words.values())
            }
        }
        
        # Generate summary using the stats
        stats_summary = f"Analyzed {len(texts)} feedback entries. Sentiment breakdown: {sentiment_counts}. Top words used: {list(top_words.keys())}."
        summary_prompt = f"Based on these sentiment analysis statistics: {stats_summary}. Generate a 2-paragraph Executive Summary of the customer sentiment."
        
        summary_response = model.generate_content(summary_prompt)
        executive_summary = summary_response.text
        
        return jsonify({
            'summary': executive_summary,
            'charts': plotly_data
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/chat/data', methods=['POST'])
def chat_data():
    global global_df
    if global_df is None:
        return jsonify({'error': 'No dataset available.'}), 400
    
    data = request.json
    query = data.get('message', '')
    
    if not query:
        return jsonify({'error': 'Empty query'}), 400
        
    try:
        # Instead of pandasai, we pass the dataframe schema and some sample data to Gemini
        # so it can answer the data query based on context.
        df_head = global_df.head(50).to_string()
        df_columns = ", ".join(global_df.columns.tolist())
        df_shape = f"{global_df.shape[0]} rows and {global_df.shape[1]} columns"
        
        prompt = f"""
        You are an expert Data Analyst and PandasAI alternative.
        I have a dataset with {df_shape}.
        The columns are: {df_columns}
        
        Here is a sample of the data (up to 50 rows):
        {df_head}
        
        The user asked the following quantitative data query: "{query}"
        
        Please provide a direct, analytical answer to their query based ONLY on the data sample provided above. Do not expose code, just give the final answer.
        """
        response = model.generate_content(prompt)
             
        return jsonify({'response': response.text}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat/report', methods=['POST'])
def chat_report():
    data = request.json
    query = data.get('message', '')
    context = data.get('context', '') # Optional context like the executive summary
    
    if not query:
        return jsonify({'error': 'Empty query'}), 400
        
    try:
        # Use available summary stats if global_df is present as basic context
        stats_context = ""
        if global_df is not None:
            stats_context = f"The dataset has {global_df.shape[0]} total feedback rows. It contains columns: {', '.join(global_df.columns.tolist())}."
            if 'sentiment' in global_df.columns:
                counts = global_df['sentiment'].value_counts().to_dict()
                stats_context += f" Sentiment breakdown: {counts}."
                
        prompt = f"""
        You are an expert business executive analyst. 
        Context about the dataset: {stats_context}
        Custom Context (if any): {context}
        
        User Question: {query}
        
        Please provide a highly professional, report-style answer. Format nicely with markdown if appropriate.
        """
        response = model.generate_content(prompt)
        
        return jsonify({'response': response.text}), 200
    except Exception as e:
         return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
