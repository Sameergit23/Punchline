"""Punchline API: turns a described moment into three captioned memes."""

import logging
import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.security import safe_join

import imgflip
import writer


def load_env(path: Path) -> None:
    """Read KEY=VALUE lines from .env without overriding real environment variables."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("'\""))


load_env(Path(__file__).parent / ".env")

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
log = logging.getLogger("punchline")

LANGUAGES = {"hinglish", "hindi", "english"}
MAX_SITUATION = 200
MAX_CAPTION = 120
MAX_AVOID = 12
# The built site. In production it's served from here, next to the API.
SITE = Path(__file__).resolve().parent.parent / "frontend" / "dist"

app = Flask(__name__, static_folder=None)
app.json.ensure_ascii = False
# Behind a host's load balancer every request comes from the proxy, so trust its
# X-Forwarded-For to rate-limit per visitor. Set TRUSTED_PROXIES=1 there, 0 locally.
if hops := int(os.environ.get("TRUSTED_PROXIES", "0")):
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=hops, x_proto=hops)
CORS(app, resources={r"/api/*": {"origins": os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")}})
limiter = Limiter(get_remote_address, app=app, storage_uri="memory://")
pool = ThreadPoolExecutor(max_workers=6)


def error(message: str, status: int):
    return jsonify({"error": message}), status


@app.errorhandler(429)
def too_many(_exc):
    return error("Easy there! That's 10 memes a minute. Give it a moment and try again.", 429)


@app.errorhandler(404)
def not_found(_exc):
    return error("Not found.", 404)


@app.errorhandler(500)
def server_error(_exc):
    return error("Something broke on our side. Try again?", 500)


def read_language(body: dict) -> str | None:
    language = str(body.get("language") or "hinglish").lower()
    return language if language in LANGUAGES else None


@app.get("/api/health")
def health():
    try:
        count = len(imgflip.get_templates())
    except Exception:  # noqa: BLE001  health should report, not raise
        count = 0
    return jsonify({"ok": count > 0, "templates": count})


@app.post("/api/meme")
@limiter.limit("10 per minute")
def make_meme():
    body = request.get_json(silent=True) or {}
    situation = str(body.get("situation") or "").strip()
    language = read_language(body)
    if not situation:
        return error("Tell us what happened first.", 400)
    if len(situation) > MAX_SITUATION:
        return error(f"Keep it under {MAX_SITUATION} characters.", 400)
    if language is None:
        return error("Pick Hinglish, Hindi or English.", 400)
    # Optional: template IDs the user just saw, so the next memes look different.
    avoid = body.get("avoid") if isinstance(body.get("avoid"), list) else []
    avoid = {str(a) for a in avoid[:MAX_AVOID]}
    adult = body.get("adult") is True  # 18+ mode, confirmed by the user in the page

    try:
        templates = imgflip.templates_for_prompt(avoid)
    except Exception:  # noqa: BLE001
        log.exception("Couldn't load templates")
        return error("Couldn't load meme templates. Try again in a bit.", 503)

    try:
        takes = writer.write_takes(situation, language, templates, adult)
    except writer.Refusal as exc:
        return error(str(exc), 422)
    except writer.WriterError as exc:
        return error(str(exc), 502)

    try:
        images = list(pool.map(lambda t: imgflip.caption_image(t["template_id"], t["captions"], language), takes))
    except imgflip.ImgflipError as exc:
        return error(str(exc), 502)

    return jsonify({"takes": [take | image for take, image in zip(takes, images)]})


@app.post("/api/caption")
def recaption():
    body = request.get_json(silent=True) or {}
    template_id = str(body.get("template_id") or "")
    captions = body.get("captions")
    language = read_language(body)
    if language is None:
        return error("Pick Hinglish, Hindi or English.", 400)

    try:
        template = imgflip.template_map().get(template_id)
    except Exception:  # noqa: BLE001
        log.exception("Couldn't load templates")
        return error("Couldn't load meme templates. Try again in a bit.", 503)
    if template is None:
        return error("That template isn't one we know.", 400)
    if (
        not isinstance(captions, list)
        or len(captions) != template["box_count"]
        or not all(isinstance(c, str) for c in captions)
    ):
        return error(f"This template needs exactly {template['box_count']} captions.", 400)
    captions = [c.strip()[:MAX_CAPTION] for c in captions]
    if not any(captions):
        return error("Write at least one caption.", 400)

    try:
        return jsonify(imgflip.caption_image(template_id, captions, language))
    except imgflip.ImgflipError as exc:
        return error(str(exc), 502)


@app.get("/")
@app.get("/<path:path>")
def site(path: str = "index.html"):
    if path.startswith("api/") or not SITE.is_dir():
        return error("Not found.", 404)
    file = safe_join(str(SITE), path)
    if file and os.path.isfile(file):
        # Vite fingerprints everything in assets/, so those can be cached for good.
        return send_from_directory(SITE, path, max_age=31536000 if path.startswith("assets/") else 0)
    return send_from_directory(SITE, "index.html", max_age=0)


try:
    imgflip.load_templates()
except Exception as exc:  # noqa: BLE001  the first request will retry
    log.warning("Couldn't load templates at startup (%s); will retry on first request", exc)

missing = [k for k in ("OPENAI_API_KEY", "IMGFLIP_USERNAME", "IMGFLIP_PASSWORD") if not os.environ.get(k)]
if missing:
    log.warning("Missing settings: %s. /api/meme won't work until they're set and the API restarts.", ", ".join(missing))


if __name__ == "__main__":
    app.run(port=int(os.environ.get("PORT", 5000)), debug=os.environ.get("FLASK_DEBUG") == "1")
