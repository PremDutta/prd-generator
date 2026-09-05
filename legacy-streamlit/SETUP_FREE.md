# PRD Generator - Setup Guide

## Quick Start (5 minutes)

### Step 1: Get a FREE Groq API Key

1. Go to: https://console.groq.com/keys
2. Sign in / create an account
3. Click "Create API Key"
4. Copy the key (starts with "gsk_...")

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Run the App

```bash
streamlit run spec_to_prd_app.py
```

### Step 4: Use the App

1. Open http://localhost:8501 in your browser
2. Paste your Groq API key in the sidebar under Settings
   (or set it once for everyone via `.streamlit/secrets.toml` / a `GROQ_API_KEY` env var, see below)
3. Enter a PRD name and your rough notes/requirements
4. Click "Generate PRD"
5. Refine any section with AI feedback, then export or share

---

## Setting the API key without pasting it every time

Create `.streamlit/secrets.toml` (already gitignored) with:

```toml
GROQ_API_KEY = "gsk_your_key_here"
```

or export it as an environment variable before launching:

```bash
export GROQ_API_KEY=gsk_your_key_here
streamlit run spec_to_prd_app.py
```

---

## Troubleshooting

### "groq not installed" / ModuleNotFoundError
Run: `pip install -r requirements.txt`

### "Invalid Groq API key"
- Make sure you copied the full key from console.groq.com/keys
- Try creating a new key if it still fails

### "Groq rate limit reached"
- Free tier has per-minute and per-day request limits — wait a minute and retry,
  or switch models in the sidebar (the smaller model has a higher free-tier limit)

---

## Files You Need

1. `spec_to_prd_app.py` - the main app
2. `requirements.txt` - dependencies
3. `.streamlit/config.toml` - theme (optional, already included)

That's it!
