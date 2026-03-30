"""CV content enhancer -- uses LLM to polish bullet points and optimize for ATS."""

from __future__ import annotations

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# System prompt for the CV-enhancement LLM call
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """\
You are an expert CV/resume writer specializing in engineering and technical roles.
Your task is to enhance the provided professional profile for maximum impact.

Rules:
1. Start every bullet point with a strong action verb (Engineered, Spearheaded, Optimized, etc.)
2. Quantify achievements wherever possible (%, $, counts, time saved)
3. Include relevant ATS keywords for: airport security, field services engineering,
   mechanical engineering, Smiths Detection, X-ray screening, Python, data analytics
4. Keep descriptions concise -- max 2 lines per bullet
5. Maintain factual accuracy -- do NOT invent numbers or achievements
6. Preserve the original meaning; only improve phrasing and keyword density
7. Ensure the professional summary is compelling and tailored for field services /
   airport security engineering roles

Return a JSON object with these keys:
- "summary_en": enhanced English professional summary (3-4 sentences)
- "summary_ar": enhanced Arabic professional summary (3-4 sentences)
- "current_role_bullets": list of enhanced bullet strings for the current role
- "previous_roles": list of objects, each with "company", "title", "bullets" (list of strings)
- "leadership": list of objects, each with "role", "organization", "bullets"
- "skills_keywords": list of top 20 ATS keywords extracted from the profile
"""


async def enhance_cv_content(llm_client: Any, brand_profile: dict) -> dict:
    """Call the LLM to enhance CV content and return an enriched profile dict.

    Parameters
    ----------
    llm_client:
        An :class:`LLMClient` (or compatible) instance.
    brand_profile:
        Parsed ``brand_profile.yaml`` dict.

    Returns
    -------
    dict
        The original *brand_profile* merged with enhanced descriptions stored
        under the ``"enhanced"`` key.
    """
    # Build the user prompt with the raw profile data
    personal = brand_profile.get("personal", {})
    employment = brand_profile.get("employment", {})
    leadership = brand_profile.get("leadership", [])
    skills = brand_profile.get("skills", {})
    certifications = brand_profile.get("certifications", [])
    awards = brand_profile.get("awards", [])

    user_prompt = f"""\
Enhance the following professional profile for a CV/resume.

=== PERSONAL ===
Name: {personal.get('name_en', '')}
Title: {personal.get('title_en', '')}
Bio (EN): {personal.get('bio_en', '')}
Bio (AR): {personal.get('bio_ar', '')}

=== CURRENT ROLE ===
Company: {employment.get('current', {}).get('company', '')}
Title: {employment.get('current', {}).get('title', '')}
Location: {employment.get('current', {}).get('location', '')}
Description:
{employment.get('current', {}).get('description_en', '')}

=== PREVIOUS ROLES ===
{_format_previous_roles(employment.get('previous', []))}

=== LEADERSHIP ===
{_format_leadership(leadership)}

=== SKILLS ===
{json.dumps(skills, indent=2, ensure_ascii=False)}

=== CERTIFICATIONS ===
{chr(10).join('- ' + c for c in certifications)}

=== AWARDS ===
{chr(10).join('- ' + a for a in awards)}

Return ONLY valid JSON matching the schema described in the system prompt.
"""

    response = await llm_client.generate(
        prompt=user_prompt,
        system_prompt=_SYSTEM_PROMPT,
        temperature=0.4,
        max_tokens=3000,
    )

    # Parse the LLM response
    enhanced = _parse_llm_response(response.text)

    # Merge enhanced data back into profile
    enriched_profile = {**brand_profile, "enhanced": enhanced}
    return enriched_profile


def _format_previous_roles(roles: list[dict]) -> str:
    """Format previous roles for the LLM prompt."""
    lines: list[str] = []
    for role in roles:
        lines.append(f"Company: {role.get('company', '')}")
        lines.append(f"Title: {role.get('title', '')}")
        lines.append(f"Period: {role.get('period', '')}")
        for h in role.get("highlights", []):
            lines.append(f"  - {h}")
        lines.append("")
    return "\n".join(lines)


def _format_leadership(entries: list[dict]) -> str:
    """Format leadership entries for the LLM prompt."""
    lines: list[str] = []
    for entry in entries:
        lines.append(f"Role: {entry.get('role', '')}")
        lines.append(f"Organization: {entry.get('organization', '')}")
        lines.append(f"Period: {entry.get('period', '')}")
        for h in entry.get("highlights", []):
            lines.append(f"  - {h}")
        lines.append("")
    return "\n".join(lines)


def _parse_llm_response(text: str) -> dict:
    """Extract JSON from the LLM response, handling markdown fences."""
    cleaned = text.strip()

    # Strip markdown code fences if present
    if cleaned.startswith("```"):
        # Remove opening fence (with optional language tag)
        first_newline = cleaned.index("\n")
        cleaned = cleaned[first_newline + 1 :]
        # Remove closing fence
        if cleaned.endswith("```"):
            cleaned = cleaned[: -len("```")].rstrip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("Failed to parse LLM JSON response; returning raw text")
        return {
            "raw_response": text,
            "summary_en": "",
            "summary_ar": "",
            "current_role_bullets": [],
            "previous_roles": [],
            "leadership": [],
            "skills_keywords": [],
        }
