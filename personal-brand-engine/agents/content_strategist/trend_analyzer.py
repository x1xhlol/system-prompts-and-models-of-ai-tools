"""Trend analyzer -- RSS feeds + LLM to identify relevant trending topics."""

from __future__ import annotations

import json
import logging
from typing import Any
from xml.etree import ElementTree

import httpx

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# RSS feeds relevant to Sami's brand pillars
# ---------------------------------------------------------------------------

_RSS_FEEDS: list[dict[str, str]] = [
    {
        "name": "Aviation Security International",
        "url": "https://www.asi-mag.com/feed/",
        "category": "aviation_security",
    },
    {
        "name": "Airport Technology",
        "url": "https://www.airport-technology.com/feed/",
        "category": "airport_tech",
    },
    {
        "name": "Security Today",
        "url": "https://securitytoday.com/rss-feeds/news.aspx",
        "category": "security_industry",
    },
    {
        "name": "GACA News (Saudi)",
        "url": "https://gaca.gov.sa/web/en/rss",
        "category": "gaca",
    },
    {
        "name": "ICAO Newsroom",
        "url": "https://www.icao.int/Newsroom/Pages/RSS.aspx",
        "category": "icao",
    },
]

# System prompt for the trend-analysis LLM call
_SYSTEM_PROMPT = """\
You are a content strategist for a Field Services Engineer specializing in airport
security equipment (Smiths Detection). Analyze the provided news headlines and identify
trending topics that are relevant for LinkedIn content creation.

For each trend, return a JSON array of objects with:
- "topic": concise topic title
- "relevance": "high" | "medium" | "low"
- "pillar": one of "tech_insights", "field_life", "professional_growth", "industry_news"
- "angle": a brief suggestion for how to turn this into engaging LinkedIn content
- "source": the feed or keyword that surfaced it

Return ONLY a valid JSON array. Limit to the top 10 most relevant trends.
"""


async def analyze_trends(
    llm_client: Any,
    keywords: list[str],
    brand_profile: dict,
) -> list[dict]:
    """Scan RSS feeds and use the LLM to identify relevant trending topics.

    Parameters
    ----------
    llm_client:
        An :class:`LLMClient` instance.
    keywords:
        Search terms aligned with the brand pillars.
    brand_profile:
        Parsed ``brand_profile.yaml`` dict.

    Returns
    -------
    list[dict]
        Each dict contains ``topic``, ``relevance``, ``pillar``, ``angle``, ``source``.
    """
    # Step 1: Fetch RSS headlines
    headlines = await _fetch_rss_headlines()

    # Step 2: Build LLM prompt
    personal = brand_profile.get("personal", {})
    user_prompt = f"""\
Professional context:
- Name: {personal.get('name_en', '')}
- Role: {personal.get('title_en', '')}
- Specialization: Smiths Detection airport security equipment (HI-SCAN, IONSCAN 600, CTX)
- Keywords of interest: {', '.join(keywords)}

Recent industry headlines:
{_format_headlines(headlines)}

Identify the top trending topics relevant to this professional's LinkedIn brand.
Return ONLY a valid JSON array.
"""

    response = await llm_client.generate(
        prompt=user_prompt,
        system_prompt=_SYSTEM_PROMPT,
        temperature=0.5,
        max_tokens=2000,
    )

    trends = _parse_trends_response(response.text)
    logger.info("Identified %d trends from %d headlines", len(trends), len(headlines))
    return trends


# ---------------------------------------------------------------------------
# RSS fetching
# ---------------------------------------------------------------------------


async def _fetch_rss_headlines(timeout: float = 15.0) -> list[dict]:
    """Fetch headlines from all configured RSS feeds.

    Returns a list of dicts with ``title``, ``link``, ``source``, ``published``.
    Feeds that fail to load are silently skipped.
    """
    headlines: list[dict] = []

    async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
        for feed in _RSS_FEEDS:
            try:
                resp = await client.get(feed["url"])
                resp.raise_for_status()
                items = _parse_rss_xml(resp.text, source=feed["name"])
                headlines.extend(items)
                logger.debug("Fetched %d items from %s", len(items), feed["name"])
            except Exception as exc:
                logger.warning("RSS fetch failed for %s: %s", feed["name"], exc)

    return headlines


def _parse_rss_xml(xml_text: str, source: str) -> list[dict]:
    """Parse RSS/Atom XML and extract headline items."""
    items: list[dict] = []
    try:
        root = ElementTree.fromstring(xml_text)
    except ElementTree.ParseError:
        logger.warning("Failed to parse XML from %s", source)
        return items

    # Standard RSS 2.0
    for item in root.iter("item"):
        title_el = item.find("title")
        link_el = item.find("link")
        pub_el = item.find("pubDate")
        if title_el is not None and title_el.text:
            items.append(
                {
                    "title": title_el.text.strip(),
                    "link": link_el.text.strip() if link_el is not None and link_el.text else "",
                    "source": source,
                    "published": pub_el.text.strip() if pub_el is not None and pub_el.text else "",
                }
            )

    # Atom feeds (namespace-aware)
    atom_ns = "{http://www.w3.org/2005/Atom}"
    for entry in root.iter(f"{atom_ns}entry"):
        title_el = entry.find(f"{atom_ns}title")
        link_el = entry.find(f"{atom_ns}link")
        pub_el = entry.find(f"{atom_ns}published") or entry.find(f"{atom_ns}updated")
        if title_el is not None and title_el.text:
            link_href = ""
            if link_el is not None:
                link_href = link_el.get("href", link_el.text or "")
            items.append(
                {
                    "title": title_el.text.strip(),
                    "link": link_href.strip() if link_href else "",
                    "source": source,
                    "published": pub_el.text.strip() if pub_el is not None and pub_el.text else "",
                }
            )

    return items[:20]  # Cap per feed to keep prompt manageable


# ---------------------------------------------------------------------------
# Formatting & parsing
# ---------------------------------------------------------------------------


def _format_headlines(headlines: list[dict]) -> str:
    """Format headlines into a numbered list for the LLM prompt."""
    if not headlines:
        return "(No headlines fetched -- generate trends based on domain knowledge.)"
    lines: list[str] = []
    for i, h in enumerate(headlines[:50], start=1):  # Cap at 50 total
        lines.append(f"{i}. [{h['source']}] {h['title']}")
    return "\n".join(lines)


def _parse_trends_response(text: str) -> list[dict]:
    """Extract a JSON array of trends from the LLM response."""
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
            return parsed
        # Some models wrap in an object
        if isinstance(parsed, dict) and "trends" in parsed:
            return parsed["trends"]
        return [parsed]
    except json.JSONDecodeError:
        logger.warning("Failed to parse trend analysis JSON; returning empty list")
        return []
