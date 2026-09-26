"""Render one Hindi meme per candidate font so you can check which one shows real glyphs.

    python scripts/test_hindi_font.py

Open each printed URL. If the text shows as empty boxes, that font doesn't work on
Imgflip; put a working one in backend/.env as IMGFLIP_DEVANAGARI_FONT.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import os  # noqa: E402

import app  # noqa: E402,F401  (loads backend/.env)
import imgflip  # noqa: E402

DRAKE = "181913649"
CAPTIONS = ["जब WiFi का पासवर्ड पूछो", "और सब ऐसे देखें जैसे किडनी माँग ली हो"]
FONTS = sys.argv[1:] or ["Noto Sans Devanagari", "Teko", "Hind", "Mukta"]

for font in FONTS:
    os.environ["IMGFLIP_DEVANAGARI_FONT"] = font
    try:
        result = imgflip.caption_image(DRAKE, CAPTIONS, "hindi")
        print(f"{font:24} {result['image_url']}")
    except imgflip.ImgflipError as exc:
        print(f"{font:24} failed: {exc}")
