"""The meme writer: asks OpenAI for three takes and checks them."""

import json
import logging
import os
import re
from pathlib import Path

from openai import APIConnectionError, InternalServerError, OpenAI, OpenAIError, RateLimitError

from imgflip import DEVANAGARI

log = logging.getLogger(__name__)

PROMPTS = Path(__file__).parent / "prompts"
SYSTEM_PROMPT = (PROMPTS / "meme_system.txt").read_text(encoding="utf-8")
# Opt-in 18+ mode: same job, adult humour allowed, still nothing explicit.
ADULT_PROMPT = (PROMPTS / "meme_system_adult.txt").read_text(encoding="utf-8")
DEFAULT_MODEL = "gpt-4.1-mini"
TAKES = 3

_client: OpenAI | None = None


class WriterError(Exception):
    """The model couldn't produce usable takes. The message is safe to show."""


class Refusal(Exception):
    """The model declined the situation and returned {"error": ...}."""


def _openai() -> OpenAI:
    global _client
    if _client is None:
        if not os.environ.get("OPENAI_API_KEY"):
            raise WriterError("The meme writer isn't set up on the server yet.")
        # Retries happen in _complete, so a slow model can't stack SDK retries on top.
        _client = OpenAI(timeout=25, max_retries=0)
    return _client


# Worth another try: overloaded, rate-limited, timed out or unreachable.
TRANSIENT = (RateLimitError, InternalServerError, APIConnectionError)


def _complete(messages: list[dict]):
    """One JSON completion, with a second try on OPENAI_FALLBACK_MODEL if set (free
    tiers are often overloaded), otherwise on the same model."""
    model = os.environ.get("OPENAI_MODEL") or DEFAULT_MODEL
    models = [model, os.environ.get("OPENAI_FALLBACK_MODEL") or model]
    for i, name in enumerate(models):
        try:
            return _openai().chat.completions.create(
                model=name,
                messages=messages,
                response_format={"type": "json_object"},
            )
        except TRANSIENT as exc:
            if i == len(models) - 1:
                raise
            log.warning("%s failed (%s); trying %s", name, type(exc).__name__, models[i + 1])


def _problems(data: object, templates: dict[str, dict]) -> list[str]:
    """Everything wrong with a reply, as lines the model can act on."""
    if not isinstance(data, dict):
        return ["The reply must be a JSON object."]
    takes = data.get("takes")
    if not isinstance(takes, list) or len(takes) != TAKES:
        count = len(takes) if isinstance(takes, list) else 0
        return [f'"takes" must be a list of exactly {TAKES} items; you returned {count}.']

    problems = []
    for n, take in enumerate(takes, start=1):
        if not isinstance(take, dict):
            problems.append(f"Take {n} must be an object with template_id and captions.")
            continue
        template = templates.get(str(take.get("template_id")))
        if template is None:
            problems.append(f"Take {n}: template_id {take.get('template_id')!r} is not in the templates list.")
            continue
        captions = take.get("captions")
        want = template["box_count"]
        if not isinstance(captions, list) or len(captions) != want:
            got = len(captions) if isinstance(captions, list) else 0
            problems.append(
                f"Take {n}: {template['name']!r} has box_count {want}, so captions needs "
                f"exactly {want} items; you gave {got}."
            )
        elif not all(isinstance(c, str) and c.strip() for c in captions):
            problems.append(f"Take {n}: every caption must be a non-empty string.")
    return problems


# Common Roman-script Hindi words. A Hinglish take with none of them is really English.
HINGLISH_WORDS = frozenset(
    """hai hain ho hoga hogi tha thi nahi nahin kya kyu kyun kaise kab kaha kahan bhai yaar
    toh bhi aur ka ki ke ko se mein mai mujhe mera meri mere tera teri apna apni kar karo
    karna karunga karenge raha rahi rahe gaya gayi gaye wala wali wale abhi sab kuch bas
    chal chalo dekh dekho bol bolo ek baad pehle phir fir jab tab agar lekin matlab accha
    arre ye yeh woh wo""".split()
)


def _language_problems(takes: list[dict], language: str) -> list[str]:
    """Takes written in the wrong language, which weaker models sometimes slip into."""
    problems = []
    for n, take in enumerate(takes, start=1):
        text = " ".join(take["captions"])
        if language == "hindi" and not DEVANAGARI.search(text):
            problems.append(f"Take {n} must be in Hindi written in Devanagari, not Roman script.")
        elif language == "hinglish" and not HINGLISH_WORDS & set(re.findall(r"[a-z]+", text.lower())):
            problems.append(f"Take {n} is English; write it in Hinglish (Hindi in Roman script, like WhatsApp).")
    return problems


def write_takes(situation: str, language: str, templates: list[dict], adult: bool = False) -> list[dict]:
    """Return [{template_id, template_name, captions}] x 3, retrying once on a bad reply."""
    by_id = {t["id"]: t for t in templates}
    user = json.dumps(
        {"situation": situation, "language": language, "templates": templates},
        ensure_ascii=False,
    )
    messages = [
        {"role": "system", "content": ADULT_PROMPT if adult else SYSTEM_PROMPT},
        {"role": "user", "content": user},
    ]

    for attempt in (1, 2):
        try:
            resp = _complete(messages)
        except OpenAIError as exc:
            log.warning("OpenAI call failed: %s", exc)
            raise WriterError("The meme writer is taking a chai break. Try again in a moment.") from exc

        content = resp.choices[0].message.content or ""
        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            data, problems = None, ["The reply was not valid JSON."]
        else:
            if isinstance(data, dict) and isinstance(data.get("error"), str) and not data.get("takes"):
                raise Refusal(data["error"])
            problems = _problems(data, by_id)

        # A wrong language earns one retry but never fails the request.
        if not problems and attempt == 1:
            problems = _language_problems(data["takes"], language)

        if not problems:
            return [
                {
                    "template_id": str(take["template_id"]),
                    "template_name": by_id[str(take["template_id"])]["name"],
                    "captions": [c.strip() for c in take["captions"]],
                }
                for take in data["takes"]
            ]

        log.info("Attempt %d rejected: %s", attempt, "; ".join(problems))
        messages += [
            {"role": "assistant", "content": content},
            {
                "role": "user",
                "content": "That reply had problems:\n- "
                + "\n- ".join(problems)
                + "\nFix them and return the full JSON again.",
            },
        ]

    raise WriterError("Couldn't land the joke this time. Try again, or add a detail or two.")
