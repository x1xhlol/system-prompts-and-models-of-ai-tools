"""LLM-powered email response drafter for Sami Assiri."""

from __future__ import annotations

import re
from pathlib import Path

import yaml

from utils.logger import get_logger

logger = get_logger(__name__)

_TEMPLATES_PATH = Path(__file__).parent / "prompts" / "reply_templates.yaml"


def _load_templates() -> dict:
    """Load reply templates from the YAML file."""
    if not _TEMPLATES_PATH.exists():
        return {}
    with open(_TEMPLATES_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def _detect_language(text: str) -> str:
    """Detect whether the text is primarily Arabic or English.

    Uses a simple heuristic: if the text contains Arabic Unicode characters
    above a threshold, treat it as Arabic.
    """
    if not text:
        return "en"
    arabic_chars = len(re.findall(r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]", text))
    total_alpha = len(re.findall(r"[a-zA-Z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]", text))
    if total_alpha == 0:
        return "en"
    return "ar" if (arabic_chars / total_alpha) > 0.3 else "en"


def _build_system_prompt(brand_profile: dict, language: str, classification: str) -> str:
    """Construct the system prompt for the response drafter."""
    personal = brand_profile.get("personal", {})
    employment = brand_profile.get("employment", {})
    current_job = employment.get("current", {})
    links = brand_profile.get("links", {})

    if language == "ar":
        name = personal.get("name_ar", "سامي محمد العسيري")
        title = current_job.get("title_ar", "مهندس خدمات ميدانية")
        company = current_job.get("company_ar", "ميتكو - خدمات الشرق الأوسط")
        location = current_job.get("location_ar", "مطار الملك خالد الدولي - الرياض")
    else:
        name = personal.get("name_en", "Sami Mohammed Assiri")
        title = current_job.get("title", "Field Services Engineer")
        company = current_job.get("company", "METCO - Middle East Services")
        location = current_job.get("location", "King Khalid International Airport, Riyadh")

    calcom_url = links.get("calcom", "")
    linkedin_url = links.get("linkedin", "")

    templates = _load_templates()
    template_guidance = ""
    if classification in templates:
        tpl = templates[classification]
        lang_key = "ar" if language == "ar" else "en"
        if lang_key in tpl:
            template_guidance = f"\n\nUse this template as a starting guide:\n{tpl[lang_key]}"

    lang_instruction = (
        "Write the reply entirely in Arabic."
        if language == "ar"
        else "Write the reply entirely in English."
    )

    meeting_instruction = ""
    if classification == "urgent" and calcom_url:
        meeting_instruction = (
            f"\nIf the email involves a meeting request, suggest booking via "
            f"the Cal.com link: {calcom_url}"
        )

    return (
        f"You are drafting a professional email reply on behalf of {name}, "
        f"{title} at {company}, based in {location}.\n\n"
        f"LinkedIn: {linkedin_url}\n"
        f"Email: {personal.get('email', 'sami.assiri11@gmail.com')}\n\n"
        f"Guidelines:\n"
        f"- {lang_instruction}\n"
        f"- Maintain a professional, courteous, and confident tone.\n"
        f"- Keep the response concise and actionable.\n"
        f"- When relevant, mention Sami's role at {company} and his engineering background.\n"
        f"- Do NOT fabricate information. If you're unsure, suggest Sami will follow up.\n"
        f"- Sign off with Sami's name and title.{meeting_instruction}"
        f"{template_guidance}"
    )


async def draft_response(
    llm_client,
    email_subject: str,
    email_body: str,
    brand_profile: dict,
    classification: str,
) -> str:
    """Draft a professional email response using the LLM.

    Parameters
    ----------
    llm_client:
        An :class:`LLMClient` instance.
    email_subject:
        Subject line of the incoming email.
    email_body:
        Body text of the incoming email.
    brand_profile:
        Parsed brand profile dictionary.
    classification:
        The email classification (``urgent``, ``reply_needed``, etc.).

    Returns
    -------
    str
        The drafted reply text, ready for review or sending.
    """
    language = _detect_language(email_body)
    system_prompt = _build_system_prompt(brand_profile, language, classification)

    if language == "ar":
        user_prompt = (
            f"الرد على البريد الإلكتروني التالي:\n\n"
            f"الموضوع: {email_subject}\n\n"
            f"المحتوى:\n{email_body[:2500]}\n\n"
            f"اكتب رداً مهنياً مناسباً."
        )
    else:
        user_prompt = (
            f"Draft a reply to the following email:\n\n"
            f"Subject: {email_subject}\n\n"
            f"Body:\n{email_body[:2500]}\n\n"
            f"Write an appropriate professional response."
        )

    try:
        response = await llm_client.generate(
            prompt=user_prompt,
            system_prompt=system_prompt,
            temperature=0.5,
            max_tokens=1500,
        )
        draft = response.text.strip()
        logger.info(
            "email_response_drafted",
            subject=email_subject[:80],
            language=language,
            classification=classification,
            length=len(draft),
        )
        return draft

    except Exception as exc:
        logger.error(
            "email_response_error",
            error=str(exc),
            subject=email_subject[:80],
        )
        # Return a safe fallback so the email isn't left without a draft
        if language == "ar":
            return (
                "شكراً لتواصلك. سأراجع رسالتك وأرد عليك في أقرب وقت ممكن.\n\n"
                "مع أطيب التحيات،\n"
                "سامي محمد العسيري\n"
                "مهندس خدمات ميدانية - ميتكو"
            )
        return (
            "Thank you for reaching out. I will review your message and get back "
            "to you as soon as possible.\n\n"
            "Best regards,\n"
            "Sami Mohammed Assiri\n"
            "Field Services Engineer - METCO"
        )
