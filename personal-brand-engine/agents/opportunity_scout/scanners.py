"""Scanners -- free-API and RSS-based data sources for opportunity discovery.

Each scanner is an async function that returns ``list[dict]`` where every
dict has keys: title, company, url, description, source.
"""

from __future__ import annotations

import xml.etree.ElementTree as ET
from typing import Any
from urllib.parse import quote_plus

import httpx

from utils.logger import get_logger

logger = get_logger(__name__)

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
}

# Default keyword sets tailored to Sami's profile
DEFAULT_JOB_KEYWORDS: list[str] = [
    "field services engineer airport security",
    "Smiths Detection engineer",
    "METCO field engineer Saudi",
    "airport security equipment engineer",
    "aviation security engineer Riyadh",
    "Rapiscan field engineer",
    "L3Harris security engineer Saudi",
    "mechanical engineer airport Saudi Arabia",
]

DEFAULT_NEWS_KEYWORDS: list[str] = [
    "Smiths Detection",
    "GACA Saudi Arabia aviation",
    "airport security technology Saudi",
    "Riyadh airport expansion",
    "Saudi Arabia aviation security",
    "Nuctech airport",
    "baggage screening technology",
]


# ---------------------------------------------------------------------------
# Google Jobs (via Google custom search-style scraping)
# ---------------------------------------------------------------------------

async def scan_google_jobs(
    keywords: list[str] | None = None,
    location: str = "Saudi Arabia",
) -> list[dict]:
    """Search for jobs via Google's public search results (RSS/HTML).

    Uses the Google News RSS feed with job-related queries.  This does NOT
    require an API key.
    """
    keywords = keywords or DEFAULT_JOB_KEYWORDS
    results: list[dict] = []

    async with httpx.AsyncClient(timeout=20.0, headers=_HEADERS) as client:
        for kw in keywords:
            query = quote_plus(f"{kw} {location} jobs")
            url = f"https://news.google.com/rss/search?q={query}&hl=en-SA&gl=SA&ceid=SA:en"
            try:
                resp = await client.get(url)
                resp.raise_for_status()
                entries = _parse_rss(resp.text, source="google_jobs")
                results.extend(entries)
            except (httpx.HTTPStatusError, httpx.RequestError) as exc:
                logger.warning("google_jobs_error", keyword=kw, error=str(exc))
            except ET.ParseError as exc:
                logger.warning("google_jobs_xml_error", keyword=kw, error=str(exc))

    # Deduplicate by URL
    seen: set[str] = set()
    unique: list[dict] = []
    for r in results:
        key = r.get("url", r.get("title", ""))
        if key not in seen:
            seen.add(key)
            unique.append(r)

    logger.info("google_jobs_scan_complete", count=len(unique))
    return unique


# ---------------------------------------------------------------------------
# LinkedIn (via linkedin-api library)
# ---------------------------------------------------------------------------

async def scan_linkedin_jobs_api(
    linkedin_api: Any | None = None,
    keywords: list[str] | None = None,
) -> list[dict]:
    """Search LinkedIn for relevant jobs using the ``linkedin-api`` library.

    Parameters
    ----------
    linkedin_api:
        An authenticated ``linkedin_api.Linkedin`` instance.  If ``None``,
        returns an empty list (credentials not configured).
    keywords:
        Search terms.  Defaults to Sami-relevant keywords.
    """
    if linkedin_api is None:
        logger.info("linkedin_api_not_configured")
        return []

    keywords = keywords or [
        "field services engineer",
        "airport security engineer",
        "Smiths Detection",
        "METCO",
        "aviation security",
    ]

    results: list[dict] = []
    for kw in keywords:
        try:
            jobs = linkedin_api.search_jobs(
                keywords=kw,
                location_name="Saudi Arabia",
                limit=10,
            )
            for job in jobs:
                title = job.get("title", "")
                company = job.get("companyName", "") or job.get("company", "")
                job_id = job.get("dashEntityUrn", "") or job.get("entityUrn", "")
                url = f"https://www.linkedin.com/jobs/view/{job_id.split(':')[-1]}" if job_id else ""
                results.append({
                    "title": title,
                    "company": company,
                    "url": url,
                    "description": job.get("description", "")[:1000],
                    "source": "linkedin",
                })
        except Exception as exc:  # noqa: BLE001
            logger.warning("linkedin_search_error", keyword=kw, error=str(exc))

    logger.info("linkedin_scan_complete", count=len(results))
    return results


# ---------------------------------------------------------------------------
# News -- RSS feeds for industry news
# ---------------------------------------------------------------------------

_NEWS_RSS_FEEDS: list[str] = [
    # Google News RSS for specific topics
    "https://news.google.com/rss/search?q=Smiths+Detection&hl=en&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=airport+security+technology&hl=en&gl=SA&ceid=SA:en",
    "https://news.google.com/rss/search?q=Saudi+Arabia+aviation+security&hl=en&gl=SA&ceid=SA:en",
    "https://news.google.com/rss/search?q=GACA+Saudi+Arabia&hl=en&gl=SA&ceid=SA:en",
    "https://news.google.com/rss/search?q=Riyadh+airport+expansion&hl=en&gl=SA&ceid=SA:en",
    # Aviation security industry feeds
    "https://news.google.com/rss/search?q=baggage+screening+technology&hl=en&gl=US&ceid=US:en",
]


async def scan_news(
    keywords: list[str] | None = None,
) -> list[dict]:
    """Fetch industry news from RSS feeds and optional keyword searches.

    Parameters
    ----------
    keywords:
        Additional keywords to search via Google News RSS.  The built-in
        feed list always runs regardless.
    """
    keywords = keywords or DEFAULT_NEWS_KEYWORDS
    results: list[dict] = []

    # Build the full list of RSS URLs
    urls = list(_NEWS_RSS_FEEDS)
    for kw in keywords:
        q = quote_plus(kw)
        urls.append(
            f"https://news.google.com/rss/search?q={q}&hl=en&gl=SA&ceid=SA:en"
        )

    async with httpx.AsyncClient(timeout=20.0, headers=_HEADERS) as client:
        for url in urls:
            try:
                resp = await client.get(url)
                resp.raise_for_status()
                entries = _parse_rss(resp.text, source="news")
                results.extend(entries)
            except (httpx.HTTPStatusError, httpx.RequestError) as exc:
                logger.warning("news_rss_error", url=url[:80], error=str(exc))
            except ET.ParseError as exc:
                logger.warning("news_xml_error", url=url[:80], error=str(exc))

    # Deduplicate
    seen: set[str] = set()
    unique: list[dict] = []
    for r in results:
        key = r.get("url", r.get("title", ""))
        if key not in seen:
            seen.add(key)
            unique.append(r)

    logger.info("news_scan_complete", count=len(unique))
    return unique


# ---------------------------------------------------------------------------
# Smiths Detection careers page
# ---------------------------------------------------------------------------

_SMITHS_CAREERS_URL = "https://www.smithsdetection.com/careers"
_SMITHS_JOBS_RSS = (
    "https://news.google.com/rss/search?"
    "q=%22Smiths+Detection%22+careers+OR+jobs+OR+hiring&hl=en&gl=US&ceid=US:en"
)


async def scan_smiths_detection_careers() -> list[dict]:
    """Check Smiths Detection for new job postings.

    Since the Smiths Detection careers page may not expose a public API,
    this scanner searches via Google News RSS for Smiths Detection hiring
    announcements, and also attempts to fetch the careers page for links.
    """
    results: list[dict] = []

    async with httpx.AsyncClient(
        timeout=20.0, headers=_HEADERS, follow_redirects=True
    ) as client:
        # Approach 1: Google News RSS for Smiths Detection job postings
        try:
            resp = await client.get(_SMITHS_JOBS_RSS)
            resp.raise_for_status()
            entries = _parse_rss(resp.text, source="smiths_detection_careers")
            for entry in entries:
                entry["company"] = "Smiths Detection"
            results.extend(entries)
        except (httpx.HTTPStatusError, httpx.RequestError) as exc:
            logger.warning("smiths_rss_error", error=str(exc))
        except ET.ParseError as exc:
            logger.warning("smiths_rss_xml_error", error=str(exc))

        # Approach 2: Try scraping the careers page for job listing links
        try:
            resp = await client.get(_SMITHS_CAREERS_URL)
            resp.raise_for_status()
            # Basic extraction of job-related links from HTML
            _extract_career_links(resp.text, results)
        except (httpx.HTTPStatusError, httpx.RequestError) as exc:
            logger.warning("smiths_careers_page_error", error=str(exc))

    logger.info("smiths_detection_scan_complete", count=len(results))
    return results


def _extract_career_links(html: str, results: list[dict]) -> None:
    """Naively extract job links from the Smiths Detection careers HTML."""
    import re

    # Look for links that look like job postings
    pattern = re.compile(
        r'<a[^>]+href="([^"]*(?:job|career|position|opening)[^"]*)"[^>]*>'
        r"(.*?)</a>",
        re.IGNORECASE | re.DOTALL,
    )
    for match in pattern.finditer(html):
        url = match.group(1)
        title_raw = match.group(2)
        # Strip HTML tags from the title
        title = re.sub(r"<[^>]+>", "", title_raw).strip()
        if title and len(title) > 5:
            results.append({
                "title": title,
                "company": "Smiths Detection",
                "url": url if url.startswith("http") else f"https://www.smithsdetection.com{url}",
                "description": "",
                "source": "smiths_detection_careers",
            })


# ---------------------------------------------------------------------------
# GACA (General Authority of Civil Aviation) announcements
# ---------------------------------------------------------------------------

_GACA_URLS = [
    # Google News RSS for GACA-related announcements
    "https://news.google.com/rss/search?q=GACA+Saudi+Arabia+aviation&hl=en&gl=SA&ceid=SA:en",
    "https://news.google.com/rss/search?q=%22General+Authority+of+Civil+Aviation%22+Saudi&hl=en&gl=SA&ceid=SA:en",
    # Arabic search
    "https://news.google.com/rss/search?q=%D8%A7%D9%84%D8%B7%D9%8A%D8%B1%D8%A7%D9%86+%D8%A7%D9%84%D9%85%D8%AF%D9%86%D9%8A+%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A&hl=ar&gl=SA&ceid=SA:ar",
]


async def scan_gaca_announcements() -> list[dict]:
    """Monitor GACA (Saudi General Authority of Civil Aviation) news.

    Uses Google News RSS to find announcements related to GACA, Saudi
    aviation regulation, and airport security mandates.
    """
    results: list[dict] = []

    async with httpx.AsyncClient(timeout=20.0, headers=_HEADERS) as client:
        for url in _GACA_URLS:
            try:
                resp = await client.get(url)
                resp.raise_for_status()
                entries = _parse_rss(resp.text, source="gaca")
                for entry in entries:
                    if not entry.get("company"):
                        entry["company"] = "GACA / Saudi Aviation"
                results.extend(entries)
            except (httpx.HTTPStatusError, httpx.RequestError) as exc:
                logger.warning("gaca_rss_error", url=url[:80], error=str(exc))
            except ET.ParseError as exc:
                logger.warning("gaca_xml_error", url=url[:80], error=str(exc))

    # Deduplicate
    seen: set[str] = set()
    unique: list[dict] = []
    for r in results:
        key = r.get("url", r.get("title", ""))
        if key not in seen:
            seen.add(key)
            unique.append(r)

    logger.info("gaca_scan_complete", count=len(unique))
    return unique


# ---------------------------------------------------------------------------
# RSS parsing helper
# ---------------------------------------------------------------------------

def _parse_rss(xml_text: str, source: str) -> list[dict]:
    """Parse an RSS 2.0 feed and return a list of opportunity dicts."""
    results: list[dict] = []
    root = ET.fromstring(xml_text)  # noqa: S314

    # RSS 2.0: /rss/channel/item
    for item in root.findall(".//item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        description = (item.findtext("description") or "").strip()
        # Google News often puts the source in <source> tag
        src_tag = item.find("source")
        company = src_tag.text.strip() if src_tag is not None and src_tag.text else ""

        if title:
            results.append({
                "title": title,
                "company": company,
                "url": link,
                "description": description[:1000],
                "source": source,
            })

    return results
