"""Analyse and suggest improvements for Sami's LinkedIn profile."""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)

OPTIMIZER_SYSTEM_PROMPT = """\
You are a LinkedIn profile optimisation expert.  You are reviewing the profile \
of Sami Mohammed Assiri, a Field Services Engineer at METCO (Smiths Detection) \
who works on airport security screening systems.

Background:
- Previously at Samsung Engineering & Advanced Technology (Samsung E&A).
- President of SPE Alasala University Chapter.
- 10,000+ followers on LinkedIn.
- Based in Saudi Arabia; bilingual (Arabic & English).
- LinkedIn: https://www.linkedin.com/in/sami-assiri-a300622b2/

Your task is to analyse the current profile data provided and suggest concrete, \
actionable improvements.  Focus on:
1. **Headline** -- make it keyword-rich, compelling, and position Sami as an \
   authority in aviation security engineering.
2. **Summary / About section** -- craft a narrative that tells Sami's story, \
   highlights achievements, and includes a clear value proposition.
3. **Skills & Endorsements** -- recommend high-impact skills to add or reorder.
4. **Experience bullets** -- suggest power verbs and quantifiable achievements.
5. **Keywords** -- identify SEO-friendly keywords that recruiters and peers search for.

Return your answer as structured JSON with keys: headline, summary, skills, \
experience_tips, keywords, general_tips.  Each value should be a string or \
list of strings.
"""


def _extract_profile_data(linkedin_api) -> dict:
    """Fetch the authenticated user's profile from the LinkedIn API.

    Returns a simplified dict with the fields we care about.
    """
    try:
        profile = linkedin_api.get_profile(
            public_id="sami-assiri-a300622b2"
        )
    except Exception as exc:
        logger.error("Failed to fetch LinkedIn profile: %s", exc)
        return {}

    return {
        "first_name": profile.get("firstName", ""),
        "last_name": profile.get("lastName", ""),
        "headline": profile.get("headline", ""),
        "summary": profile.get("summary", ""),
        "industry": profile.get("industryName", ""),
        "location": profile.get("locationName", ""),
        "skills": [
            s.get("name", "")
            for s in profile.get("skills", [])
        ],
        "experience": [
            {
                "title": exp.get("title", ""),
                "company": exp.get("companyName", ""),
                "description": exp.get("description", ""),
            }
            for exp in profile.get("experience", [])
        ],
        "education": [
            {
                "school": edu.get("schoolName", ""),
                "degree": edu.get("degreeName", ""),
                "field": edu.get("fieldOfStudy", ""),
            }
            for edu in profile.get("education", [])
        ],
        "follower_count": profile.get("followerCount", "10000+"),
    }


async def optimize_profile(
    llm_client,
    brand_profile: dict,
    linkedin_api,
) -> dict:
    """Analyse Sami's LinkedIn profile and return optimisation suggestions.

    Parameters
    ----------
    llm_client:
        LLM client with ``async generate()``.
    brand_profile:
        Parsed ``brand_profile.yaml`` dict.
    linkedin_api:
        Authenticated ``linkedin_api.Linkedin`` instance.

    Returns
    -------
    dict
        Structured suggestions with keys: headline, summary, skills,
        experience_tips, keywords, general_tips.
    """
    current = _extract_profile_data(linkedin_api)

    if not current:
        logger.warning(
            "Could not fetch profile data; generating generic suggestions."
        )
        current = {
            "headline": brand_profile.get("headline", ""),
            "summary": brand_profile.get("summary", ""),
            "skills": brand_profile.get("skills", []),
        }

    user_prompt = (
        "Here is the current LinkedIn profile data:\n"
        f"{_format_profile(current)}\n\n"
        "Analyse this profile and provide specific improvement suggestions. "
        "Return ONLY valid JSON -- no markdown fences, no preamble."
    )

    response = await llm_client.generate(
        prompt=user_prompt,
        system_prompt=OPTIMIZER_SYSTEM_PROMPT,
        temperature=0.6,
        max_tokens=2000,
    )

    # Try to parse JSON; fall back to raw text
    import json

    try:
        suggestions = json.loads(response.text.strip())
    except json.JSONDecodeError:
        logger.warning("LLM did not return valid JSON; returning raw text.")
        suggestions = {
            "raw_suggestions": response.text.strip(),
            "headline": "",
            "summary": "",
            "skills": [],
            "experience_tips": [],
            "keywords": [],
            "general_tips": [],
        }

    logger.info("Profile optimisation complete (provider=%s)", response.provider)
    return suggestions


def _format_profile(data: dict) -> str:
    """Pretty-format profile data for the LLM prompt."""
    lines = [
        f"Name: {data.get('first_name', '')} {data.get('last_name', '')}",
        f"Headline: {data.get('headline', 'N/A')}",
        f"Industry: {data.get('industry', 'N/A')}",
        f"Location: {data.get('location', 'N/A')}",
        f"Followers: {data.get('follower_count', 'N/A')}",
        f"\nSummary:\n{data.get('summary', 'N/A')}",
        f"\nSkills: {', '.join(data.get('skills', [])) or 'N/A'}",
    ]

    experience = data.get("experience", [])
    if experience:
        lines.append("\nExperience:")
        for exp in experience[:5]:
            lines.append(
                f"  - {exp.get('title', '')} at {exp.get('company', '')}"
            )
            desc = exp.get("description", "")
            if desc:
                lines.append(f"    {desc[:300]}")

    education = data.get("education", [])
    if education:
        lines.append("\nEducation:")
        for edu in education[:3]:
            lines.append(
                f"  - {edu.get('degree', '')} in {edu.get('field', '')} "
                f"from {edu.get('school', '')}"
            )

    return "\n".join(lines)
