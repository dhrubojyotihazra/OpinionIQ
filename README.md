# OpinionIQ

OpinionIQ is an enterprise-grade AI sentiment analysis web application that allows users to upload customer feedback datasets (CSVs) and instantly receive intelligent insights, interactive visualizations, and an overarching executive summary.

It features a decoupled architecture with a modern, glassmorphism React frontend and a powerful Python Flask backend powered by Hugging Face and Google's Gemini models.

![OpinionIQ Logo](frontend/public/logo.png)

## Features

- **Intelligent CSV Uploads**: Drag-and-drop file upload interface. The backend automatically detects the correct 'feedback text' columns using Gemini 2.5 Flash, regardless of how the CSV is structured.
- **Sentiment Dashboard**:
  - Interactive **Plotly Pie Charts** showing Sentiment Distribution (Positive vs. Negative).
  - **Bar Charts** displaying the top most frequently used keywords in the feedback.
  - An AI-generated **Executive Summary** providing qualitative analysis of the dataset's overarching themes.
- **Dual-Agent Chat Interface**:
  - **Data Query Mode**: Ask quantitative questions about your dataset (e.g., "What is the exact percentage of positive reviews?"). The AI reads the data schema and provides analytical answers.
  - **Report Query Mode**: Ask qualitative questions (e.g., "Draft an apology email based on the negative feedback themes"). The AI uses the dataset context to generate professional reports and content.

## Tech Stack

### Frontend
- **Framework**: React via Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Classnames, Tailwind-Merge
- **Animations**: Framer Motion
- **3D Graphics**: Spline (`@splinetool/react-spline`)
- **Icons**: Lucide React
- **Charting**: React Plotly.js
- **Routing**: React Router DOM

### Backend
- **Framework**: Python Flask
- **Data Processing**: Pandas
- **NLP / Sentiment Analysis**: Hugging Face Transformers (`distilbert-base-uncased-finetuned-sst-2-english`)
- **LLM / Generative AI**: Google Generative AI (`gemini-2.5-flash`)

---

## How to Run the Project Locally

To run OpinionIQ, you will need to start two separate development servers: one for the Python Backend, and one for the React Frontend.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Python](https://www.python.org/downloads/) (v3.10+ recommended)

### 1. Setting up the Backend (Flask)

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd OpinionIQ/backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows PowerShell**: 
     ```bash
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows Command Prompt**: 
     ```bash
     .\venv\Scripts\activate.bat
     ```
   - **Mac/Linux**: 
     ```bash
     source venv/bin/activate
     ```
4. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
5. **API Keys**: Ensure your API keys are configured inside `app.py`. The application requires a Valid `GEMINI_API_KEY` and an `HF_TOKEN` (Hugging Face token) to function.
6. Start the Flask server:
   ```bash
   python app.py
   ```
   *The backend will boot up and run on `http://127.0.0.1:5000`.*

### 2. Setting up the Frontend (Vite/React)

1. Open a **new, separate terminal tab/window** and navigate to the `frontend` directory:
   ```bash
   cd OpinionIQ/frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev -- --host
   ```
   *The frontend will boot up and run on `http://localhost:5173`.*

### 3. Using the App
Once both servers are running:
1. Open your browser and navigate to `http://localhost:5173/`.
2. Drag and drop a CSV file containing user feedback or reviews into the prompt.
3. Wait for the AI to parse, analyze, and generate the dashboard and charts!
4. Navigate to the "Chat" tab to interact directly with your dataset.
