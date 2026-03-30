"""LLM-powered response generation for WhatsApp conversations."""

from __future__ import annotations

import logging
import re
from pathlib import Path
from typing import Any

import yaml

logger = logging.getLogger(__name__)

_TEMPLATES_PATH = Path(__file__).parent / "prompts" / "whatsapp_templates.yaml"

# Cached templates (loaded once)
_templates: dict | None = None


def _load_templates() -> dict:
    """Load WhatsApp response templates from YAML."""
    global _templates
    if _templates is None:
        if _TEMPLATES_PATH.exists():
            with open(_TEMPLATES_PATH, "r", encoding="utf-8") as f:
                _templates = yaml.safe_load(f) or {}
        else:
            _templates = {}
    return _templates


def _detect_language(text: str) -> str:
    """Heuristic language detection -- returns ``'ar'`` or ``'en'``.

    If the text contains Arabic Unicode characters, assume Arabic.
    Otherwise default to English.
    """
    arabic_pattern = re.compile(r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+")
    arabic_chars = len(arabic_pattern.findall(text))
    latin_chars = len(re.findall(r"[a-zA-Z]+", text))

    if arabic_chars > 0 and arabic_chars >= latin_chars:
        return "ar"
    return "en"


def _build_system_prompt(brand_profile: dict, language: str) -> str:
    """Construct the system prompt that tells the LLM how to behave."""
    templates = _load_templates()

    name = brand_profile.get("name", "Sami Mohammed Assiri")
    title = brand_profile.get("title", "Field Services Engineer")
    company = brand_profile.get("company", "METCO (Smiths Detection)")
    location = brand_profile.get("location", "Riyadh, Saudi Arabia")
    calcom_url = brand_profile.get("calcom_url", "https://cal.com/sami-assiri")
    cv_url = brand_profile.get("cv_url", "")
    linkedin_url = brand_profile.get("linkedin_url", "")
    specialties = brand_profile.get("specialties", [
        "Airport security systems",
        "CT/X-ray screening technology",
        "Field service engineering",
        "System integration and maintenance",
    ])

    specialties_str = ", ".join(specialties) if isinstance(specialties, list) else str(specialties)

    if language == "ar":
        return f"""أنت المساعد المهني الذكي لـ {name}.
أنت تتواصل عبر واتساب نيابة عن سامي وتتصرف كمساعده الشخصي.

معلومات عن سامي:
- الاسم: {name}
- المسمى الوظيفي: {title}
- الشركة: {company}
- الموقع: {location}
- التخصصات: {specialties_str}
- رابط الحجز: {calcom_url}
- السيرة الذاتية: {cv_url}
- لينكدإن: {linkedin_url}

التعليمات:
1. رد دائماً بأسلوب مهني ولطيف باللغة العربية.
2. إذا طلب أحد حجز موعد أو اجتماع، وجّهه إلى رابط الحجز: {calcom_url}
3. إذا سأل أحد عن السيرة الذاتية أو الخبرات، شارك المعلومات المتاحة ورابط السيرة الذاتية إن وُجد.
4. إذا كان السؤال خارج نطاق معرفتك، أخبر المرسل أن سامي سيتواصل معه شخصياً.
5. لا تتظاهر بأنك سامي نفسه -- وضّح أنك مساعده الذكي.
6. كن مختصراً ومفيداً -- رسائل واتساب يجب أن تكون قصيرة.
7. إذا أرسل المستخدم رسالة بالإنجليزية، رد بالإنجليزية.
"""
    else:
        return f"""You are the professional AI assistant for {name}.
You communicate via WhatsApp on behalf of Sami and act as his personal assistant.

About Sami:
- Name: {name}
- Title: {title}
- Company: {company}
- Location: {location}
- Specialties: {specialties_str}
- Booking link: {calcom_url}
- CV: {cv_url}
- LinkedIn: {linkedin_url}

Instructions:
1. Always respond professionally and warmly.
2. If someone requests a meeting or appointment, direct them to the booking link: {calcom_url}
3. If someone asks about Sami's CV or experience, share available information and the CV link if available.
4. If the question is outside your knowledge, let the sender know Sami will follow up personally.
5. Do not pretend to be Sami himself -- clarify you are his AI assistant.
6. Be concise and helpful -- WhatsApp messages should be brief.
7. If the user writes in Arabic, respond in Arabic.
"""


async def generate_response(
    llm_client: Any,
    message: str,
    sender_name: str,
    brand_profile: dict,
    conversation_history: list[dict[str, str]] | None = None,
) -> str:
    """Generate a context-aware response using the LLM.

    Parameters
    ----------
    llm_client:
        Any LLM client that supports a ``chat`` or ``generate`` style call.
    message:
        The incoming message text.
    sender_name:
        Display name of the sender.
    brand_profile:
        Parsed brand profile dictionary.
    conversation_history:
        Optional list of ``{"role": ..., "content": ...}`` dicts.

    Returns
    -------
    str
        The generated response text.
    """
    language = _detect_language(message)
    system_prompt = _build_system_prompt(brand_profile, language)

    # Build the messages list for the LLM
    messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]

    # Include recent conversation history (last 10 turns)
    if conversation_history:
        recent = conversation_history[-10:]
        for turn in recent:
            if turn.get("role") in ("user", "assistant"):
                messages.append(
                    {"role": turn["role"], "content": turn["content"]}
                )
    else:
        messages.append({"role": "user", "content": message})

    # Call the LLM -- support multiple client interfaces
    try:
        response_text = await _call_llm(llm_client, messages)
    except Exception as exc:
        logger.error("LLM call failed: %s", exc)
        raise

    return response_text.strip()


async def _call_llm(
    llm_client: Any,
    messages: list[dict[str, str]],
) -> str:
    """Invoke the LLM client, handling different API shapes.

    Supports:
    - OpenAI-compatible (``chat.completions.create``)
    - Ollama-style (``chat`` method)
    - Groq-style (``chat.completions.create``)
    - Generic callable that accepts messages
    """
    # OpenAI / Groq compatible interface
    if hasattr(llm_client, "chat") and hasattr(llm_client.chat, "completions"):
        response = await _async_or_sync(
            llm_client.chat.completions.create,
            messages=messages,
            max_tokens=500,
            temperature=0.7,
        )
        return response.choices[0].message.content

    # Ollama-style interface
    if hasattr(llm_client, "chat"):
        response = await _async_or_sync(
            llm_client.chat,
            messages=messages,
        )
        if isinstance(response, dict):
            return response.get("message", {}).get("content", "")
        return str(response)

    # Generic callable
    if callable(llm_client):
        response = await _async_or_sync(llm_client, messages=messages)
        if isinstance(response, str):
            return response
        return str(response)

    raise TypeError(f"Unsupported LLM client type: {type(llm_client)}")


async def _async_or_sync(func: Any, **kwargs: Any) -> Any:
    """Call *func* whether it is sync or async."""
    import asyncio
    import inspect

    if inspect.iscoroutinefunction(func):
        return await func(**kwargs)
    else:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, lambda: func(**kwargs))
