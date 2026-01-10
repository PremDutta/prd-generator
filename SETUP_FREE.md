# Spec-to-PRD Agent - FREE Setup Guide

## Quick Start (5 minutes)

### Step 1: Get FREE Google Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with "AIza...")

### Step 2: Install Dependencies

```bash
pip install google-generativeai streamlit pydantic
```

Or if you have the requirements file:
```bash
pip install -r requirements_free.txt
```

### Step 3: Run the App

```bash
streamlit run spec_to_prd_free.py
```

### Step 4: Use the App

1. Open http://localhost:8501 in your browser
2. Paste your Gemini API key in the sidebar
3. Enter your rough product specs
4. Click "Parse Input" → "Generate PRD" → "Check Completeness"
5. Download your PRD!

---

## Troubleshooting

### "google-generativeai not installed"
Run: `pip install google-generativeai`

### "Invalid API key"
- Make sure you copied the full key
- Try creating a new key at https://aistudio.google.com/app/apikey

### "Quota exceeded"
- Free tier allows 60 requests/minute
- Wait a minute and try again

---

## Free Tier Limits (Very Generous!)

- 60 requests per minute
- 1,500 requests per day
- 1.5 million tokens per day

This is MORE than enough for personal use!

---

## Files You Need

1. `spec_to_prd_free.py` - The main app
2. `requirements_free.txt` - Dependencies (optional, can install manually)

That's it! Just 1 Python file.
