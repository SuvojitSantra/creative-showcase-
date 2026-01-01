# Creative Showcase — Streamlit wrapper

This folder contains a minimal Streamlit app that reuses your project's Supabase backend to display the gallery and support uploads.

Setup

- Add your Supabase credentials to Streamlit secrets (`SUPABASE_URL` and `SUPABASE_ANON_KEY`) or export them as environment variables.
- Install deps and run locally:

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
streamlit run app.py
```

Deployment

- Push this repo to GitHub and use Streamlit Cloud. Add the two secrets in the app settings.

Notes

- The app expects a Supabase table named `artworks` and a storage bucket `showcase-images` (same names used by the Next app).
- If your schema differs, adjust `app.py` accordingly.
