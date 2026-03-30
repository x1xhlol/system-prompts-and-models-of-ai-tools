"""Calendar planner -- generates a 7-day content plan aligned with brand strategy."""

from __future__ import annotations

import json
import logging
from datetime import date, datetime, timedelta, timezone
from typing import Any

logger = logging.getLogger(__name__)

# Days of the week when content is posted (0=Mon ... 6=Sun)
# From schedule.yaml: Sun/Tue/Thu -- ISO weekday: Sun=7, Tue=2, Thu=4
# Python date.isoweekday(): Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=7
_POSTING_DAYS_ISO = {7, 2, 4}  # Sunday, Tuesday, Thursday

_SYSTEM_PROMPT = """\
You are a LinkedIn content strategist for a Field Services Engineer specializing
in Smiths Detection airport security equipment, based in Riyadh, Saudi Arabia.

Create a 7-day content calendar. Posts are scheduled for Sunday, Tuesday, and Thursday.
The other days are for engagement-only (likes, comments, networking).

For each posting day, provide:
- "date": ISO date string (YYYY-MM-DD)
- "pillar": one of the content pillars from the strategy
- "topic": specific topic / angle for the post
- "platform": "linkedin" (primary) or "twitter"
- "suggested_hook": the opening line / hook for the post (1-2 sentences)
- "hashtags": list of 3-5 relevant hashtags
- "content_type": "text", "carousel", "poll", "video_script", or "article"

For non-posting days, include an engagement-only entry:
- "date": ISO date string
- "pillar": "engagement"
- "topic": "Network engagement & community interaction"
- "platform": "linkedin"
- "suggested_hook": ""
- "hashtags": []
- "content_type": "engagement"

Ensure variety across pillars and content types throughout the week.
Return ONLY a valid JSON array of 7 objects (one per day).
"""


async def generate_weekly_calendar(
    llm_client: Any,
    brand_profile: dict,
    content_strategy: dict,
    trends: list[dict] | None = None,
) -> list[dict]:
    """Generate a 7-day content plan starting from the next Sunday.

    Parameters
    ----------
    llm_client:
        An :class:`LLMClient` instance.
    brand_profile:
        Parsed ``brand_profile.yaml``.
    content_strategy:
        Parsed ``content_strategy.yaml``.
    trends:
        Optional list of trending topics from :func:`analyze_trends`.

    Returns
    -------
    list[dict]
        Seven entries, one per day, each with ``date``, ``pillar``, ``topic``,
        ``platform``, ``suggested_hook``, and metadata.
    """
    # Calculate the start of next week (next Sunday)
    today = date.today()
    days_until_sunday = (7 - today.isoweekday()) % 7
    if days_until_sunday == 0:
        days_until_sunday = 7  # If today is Sunday, plan for next week
    week_start = today + timedelta(days=days_until_sunday)

    week_dates = [week_start + timedelta(days=i) for i in range(7)]

    # Build the pillar descriptions for the prompt
    pillars = content_strategy.get("content_pillars", [])
    pillar_text = "\n".join(
        f"- {p['id']}: {p.get('name_en', '')} -- {p.get('description', '')}"
        for p in pillars
    )

    # Format trends
    trends_text = ""
    if trends:
        trends_text = "Trending topics to consider:\n" + "\n".join(
            f"- {t.get('topic', '')} (relevance: {t.get('relevance', 'medium')}, pillar: {t.get('pillar', '')})"
            for t in trends[:8]
        )

    personal = brand_profile.get("personal", {})
    user_prompt = f"""\
Generate a 7-day content calendar for the week of {week_start.isoformat()} to {week_dates[-1].isoformat()}.

Professional context:
- Name: {personal.get('name_en', '')}
- Role: {personal.get('title_en', '')}
- Company: {brand_profile.get('employment', {}).get('current', {}).get('company', '')}
- Location: {personal.get('location_en', '')}

Content pillars:
{pillar_text}

Posting schedule: Sunday, Tuesday, Thursday
Engagement-only days: Monday, Wednesday, Saturday, Friday

Tone: {content_strategy.get('tone', {}).get('style', 'professional_approachable')}
Primary language: Arabic (with English for technical/international content)

{trends_text}

Week dates:
{chr(10).join(f'- {d.isoformat()} ({d.strftime("%A")})' for d in week_dates)}

Return ONLY a valid JSON array of 7 objects.
"""

    response = await llm_client.generate(
        prompt=user_prompt,
        system_prompt=_SYSTEM_PROMPT,
        temperature=0.6,
        max_tokens=2500,
    )

    calendar = _parse_calendar_response(response.text, week_dates)
    logger.info("Weekly calendar generated: %d entries", len(calendar))
    return calendar


def _parse_calendar_response(
    text: str,
    week_dates: list[date],
) -> list[dict]:
    """Parse the LLM response into a calendar list, with fallback generation."""
    cleaned = text.strip()

    # Strip markdown code fences
    if cleaned.startswith("```"):
        first_newline = cleaned.index("\n")
        cleaned = cleaned[first_newline + 1 :]
        if cleaned.endswith("```"):
            cleaned = cleaned[: -len("```")].rstrip()

    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, list):
            entries = parsed
        elif isinstance(parsed, dict) and "calendar" in parsed:
            entries = parsed["calendar"]
        else:
            entries = [parsed]
    except json.JSONDecodeError:
        logger.warning("Failed to parse calendar JSON; generating fallback")
        return _generate_fallback_calendar(week_dates)

    # Validate and normalize entries
    normalized: list[dict] = []
    for entry in entries:
        normalized.append(
            {
                "date": entry.get("date", ""),
                "pillar": entry.get("pillar", "engagement"),
                "topic": entry.get("topic", ""),
                "platform": entry.get("platform", "linkedin"),
                "suggested_hook": entry.get("suggested_hook", ""),
                "hashtags": entry.get("hashtags", []),
                "content_type": entry.get("content_type", "text"),
            }
        )

    # Ensure we have exactly 7 entries (pad with engagement days if needed)
    while len(normalized) < 7:
        idx = len(normalized)
        if idx < len(week_dates):
            d = week_dates[idx]
        else:
            d = week_dates[-1] + timedelta(days=idx - len(week_dates) + 1)
        normalized.append(
            {
                "date": d.isoformat(),
                "pillar": "engagement",
                "topic": "Network engagement & community interaction",
                "platform": "linkedin",
                "suggested_hook": "",
                "hashtags": [],
                "content_type": "engagement",
            }
        )

    return normalized[:7]


def _generate_fallback_calendar(week_dates: list[date]) -> list[dict]:
    """Generate a basic fallback calendar when LLM parsing fails."""
    _fallback_pillars = [
        "tech_insights",
        "engagement",
        "field_life",
        "engagement",
        "industry_news",
        "engagement",
        "engagement",
    ]
    _fallback_topics = [
        "Weekly airport security technology insight",
        "Network engagement & community interaction",
        "A day in the life of a Field Services Engineer",
        "Network engagement & community interaction",
        "Industry news commentary and analysis",
        "Network engagement & community interaction",
        "Network engagement & community interaction",
    ]

    entries: list[dict] = []
    for i, d in enumerate(week_dates[:7]):
        is_posting_day = d.isoweekday() in _POSTING_DAYS_ISO
        entries.append(
            {
                "date": d.isoformat(),
                "pillar": _fallback_pillars[i] if is_posting_day else "engagement",
                "topic": _fallback_topics[i] if is_posting_day else "Network engagement & community interaction",
                "platform": "linkedin",
                "suggested_hook": "",
                "hashtags": [],
                "content_type": "text" if is_posting_day else "engagement",
            }
        )
    return entries
