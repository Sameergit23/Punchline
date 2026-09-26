"""Imgflip: template catalogue and caption rendering."""

import logging
import os
import random
import re

import requests

from desi_templates import DESI_TEMPLATES

log = logging.getLogger(__name__)

GET_MEMES_URL = "https://api.imgflip.com/get_memes"
CAPTION_URL = "https://api.imgflip.com/caption_image"
TIMEOUT = 20

# Impact (Imgflip's default) has no Devanagari glyphs, so Hindi memes need a
# Google Font that does. Override with IMGFLIP_DEVANAGARI_FONT if it renders as boxes.
DEFAULT_DEVANAGARI_FONT = "Noto Sans Devanagari"
DEVANAGARI = re.compile(f"[{chr(0x0900)}-{chr(0x097F)}]")  # Unicode Devanagari block

# Imgflip draws glyphs in stored order with no Indic shaping, so the short-i matra
# lands after its consonant ("किडनी" shows as "कडिनी"). Storing it before the
# consonant makes it render right. If Imgflip ever starts shaping text this would
# misplace it; scripts/test_hindi_font.py shows which way it currently renders.
I_MATRA = chr(0x093F)
CONSONANT_BEFORE_I = re.compile(
    f"([{chr(0x0915)}-{chr(0x0939)}{chr(0x0958)}-{chr(0x095F)}]{chr(0x093C)}?){I_MATRA}"
)


def visual_order(text: str) -> str:
    return CONSONANT_BEFORE_I.sub(lambda m: I_MATRA + m.group(1), text)


_http = requests.Session()
_templates: list[dict] = []


class ImgflipError(Exception):
    """Imgflip said no. The message is safe to show to the user."""


def load_templates() -> list[dict]:
    """Fetch Imgflip's popular templates and merge the desi ones in front."""
    global _templates
    resp = _http.get(GET_MEMES_URL, timeout=TIMEOUT)
    resp.raise_for_status()
    body = resp.json()
    if not body.get("success"):
        raise ImgflipError(body.get("error_message") or "Couldn't load meme templates.")

    desi = [
        {
            "id": str(t["id"]),
            "name": t["name"],
            "box_count": int(t["box_count"]),
            "use_when": t["use_when"],
        }
        for t in DESI_TEMPLATES
        if t["id"] != "FILL_ME"
    ]
    seen = {t["id"] for t in desi}
    popular = [
        {"id": str(m["id"]), "name": m["name"], "box_count": int(m["box_count"])}
        for m in body["data"]["memes"]
        if str(m["id"]) not in seen
    ]
    _templates = desi + popular
    log.info("Loaded %d templates (%d desi)", len(_templates), len(desi))
    return _templates


def get_templates() -> list[dict]:
    """Templates loaded at startup; retries the fetch if startup couldn't reach Imgflip."""
    return _templates or load_templates()


def template_map() -> dict[str, dict]:
    return {t["id"]: t for t in get_templates()}


MIN_CHOICES = 30


def templates_for_prompt(avoid: set[str]) -> list[dict]:
    """The list the writer picks from. Models favour famous and early entries, so
    shuffle it (desi still first) and drop recently used templates for variety."""
    templates = get_templates()
    fresh = [t for t in templates if t["id"] not in avoid]
    if len(fresh) >= MIN_CHOICES:
        templates = fresh
    desi = [t for t in templates if "use_when" in t]
    popular = [t for t in templates if "use_when" not in t]
    random.shuffle(desi)
    random.shuffle(popular)
    return desi + popular


def needs_devanagari(captions: list[str], language: str) -> bool:
    return language == "hindi" or any(DEVANAGARI.search(c) for c in captions)


def caption_image(template_id: str, captions: list[str], language: str) -> dict:
    """Render one meme. Returns {image_url, page_url}; raises ImgflipError on failure."""
    username = os.environ.get("IMGFLIP_USERNAME", "")
    password = os.environ.get("IMGFLIP_PASSWORD", "")
    if not username or not password:
        raise ImgflipError("Imgflip isn't set up on the server yet.")

    devanagari = needs_devanagari(captions, language)
    form = {"template_id": template_id, "username": username, "password": password}
    for i, text in enumerate(captions):
        # Imgflip skips its usual uppercasing when boxes[] is used, so do it here.
        # Hindi keeps its casing: Devanagari has none, and "WiFi" reads better as is.
        if language != "hindi":
            text = text.upper()
        if devanagari:
            text = visual_order(text)
        form[f"boxes[{i}][text]"] = text
    if devanagari:
        form["font"] = os.environ.get("IMGFLIP_DEVANAGARI_FONT") or DEFAULT_DEVANAGARI_FONT

    try:
        resp = _http.post(CAPTION_URL, data=form, timeout=TIMEOUT)
        body = resp.json()
    except (requests.RequestException, ValueError) as exc:
        log.warning("Imgflip caption_image failed: %s", exc)
        raise ImgflipError("Couldn't reach Imgflip. Try again in a bit.") from exc

    if not body.get("success"):
        raise ImgflipError(body.get("error_message") or "Imgflip couldn't make that meme.")
    return {"image_url": body["data"]["url"], "page_url": body["data"]["page_url"]}
