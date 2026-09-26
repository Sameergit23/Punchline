# Punchline

AI meme generator for Hindi and Hinglish memes. Describe the moment, get three takes, tweak the captions, copy the link.

- `frontend/`: React + Vite + TypeScript + Tailwind CSS v4 (tokens in `src/index.css` under `@theme`), Lucide icons
- `backend/`: Flask API that asks OpenAI for captions and renders them with Imgflip. Keys stay on the server.

## Setup

```bash
# API
cd backend
python -m venv .venv
.venv/Scripts/activate        # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then fill in the keys
python app.py                 # http://localhost:5000

# Site (second terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173, proxies /api to the API
```

`backend/.env`:

| Key | What |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI key |
| `OPENAI_MODEL` | Any chat model that supports JSON output, e.g. `gpt-4.1-mini` |
| `OPENAI_BASE_URL` | Optional. Any OpenAI-compatible API. For Google Gemini's free tier use `https://generativelanguage.googleapis.com/v1beta/openai/` with a key from aistudio.google.com and a model like `gemini-3.8-flash` |
| `OPENAI_FALLBACK_MODEL` | Optional. Tried when the main model is overloaded, rate-limited or slow (503, 429, 25s timeout), e.g. `gemini-3.5-flash-lite` |
| `IMGFLIP_USERNAME`, `IMGFLIP_PASSWORD` | A free imgflip.com account |
| `IMGFLIP_DEVANAGARI_FONT` | Optional. Google Font used for Hindi captions (default `Noto Sans Devanagari`) |
| `PORT` | Optional. API port (default 5000) |

**Port 5000 taken?** (Intel Graphics Command Center and macOS AirPlay both use it.) Set `PORT=5001` in `backend/.env` and `API_URL=http://localhost:5001` in `frontend/.env.local`.

## API

- `POST /api/meme` `{situation, language, avoid?, adult?}` → `{takes: [{template_id, template_name, captions, image_url, page_url}]}`. 10 per minute per IP. `language` is `hinglish`, `hindi` or `english`. `avoid` lists template IDs the user just saw, so new memes use different ones. `adult: true` is 18+ mode. Returns 422 with the writer's message when it declines a topic, and passes Imgflip's `error_message` through on failure.
- `POST /api/caption` `{template_id, captions, language}` → `{image_url, page_url}`
- `GET /api/health` → `{ok, templates}`

The writer's instructions live in `backend/prompts/meme_system.txt`. 18+ mode (an opt-in switch with an age confirmation on the page) uses `backend/prompts/meme_system_adult.txt` instead: double meanings, dating, hangovers and mild gaalis are allowed; explicit sex, minors, real people, slurs and jokes about religion, caste, region, gender or bodies are still refused.

### Hindi on Imgflip

Imgflip renders Hindi fine with Google Fonts (tested: Noto Sans Devanagari, Teko, Hind, Mukta), but it draws glyphs without Indic shaping. The API stores the short-i matra before its consonant so words like किडनी come out right (`visual_order` in `backend/imgflip.py`). Conjuncts still show an explicit halant (पासवर्‌ड), which stays readable. `python scripts/test_hindi_font.py` renders a sample per font if you want to recheck.

## Deploy (Render, free)

The `Dockerfile` builds the site with Node, then runs the API with waitress; the API also serves the built site, so everything lives on one URL. `render.yaml` describes the service.

1. Push this repo to GitHub.
2. On render.com: **New → Blueprint**, pick the repo. Render reads `render.yaml`.
3. Fill in the three secrets it asks for: `OPENAI_API_KEY` (your Gemini key), `IMGFLIP_USERNAME`, `IMGFLIP_PASSWORD`. Then deploy.

The free plan sleeps after 15 minutes without visitors; the next visit takes about a minute to wake it. The same image runs anywhere that runs Docker and sets `PORT` (Railway, Fly.io, Cloud Run). Behind a load balancer keep `TRUSTED_PROXIES=1` so the rate limit counts each visitor separately.

To try the production setup locally: `npm run build` in `frontend/`, then `waitress-serve --port=8000 app:app` in `backend/` and open http://localhost:8000.

## Adding templates and examples

- **Desi templates** live in `backend/desi_templates.py`: the template ID from imgflip.com (the number in its URL), a name, `box_count`, and `use_when` so the writer knows when it fits. Templates with their catchphrase already on the image use `box_count: 1`.
- **Examples** on the page come from `frontend/src/data/examples.ts`. Each `render` is a take the app generated for that prompt; without one, the page draws a coloured stand-in.
