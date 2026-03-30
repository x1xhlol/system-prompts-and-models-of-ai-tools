"""Engage with the LinkedIn feed -- like and comment on relevant posts."""

from __future__ import annotations

import logging
import random
from pathlib import Path

import yaml

logger = logging.getLogger(__name__)

_TEMPLATES_DIR = Path(__file__).resolve().parent / "prompts"

# Topics Sami cares about (used for relevance filtering)
TARGET_KEYWORDS = [
    "airport security",
    "aviation",
    "smiths detection",
    "metco",
    "x-ray",
    "screening",
    "baggage",
    "checkpoint",
    "ct scanner",
    "trace detection",
    "eds",
    "engineering",
    "field service",
    "epc",
    "gaca",
    "icao",
    "saudi arabia",
    "spe",
    "petroleum",
    "oil and gas",
    "أمن المطارات",
    "هندسة",
    "الطيران",
]

COMMENT_SYSTEM_PROMPT = """\
You are writing a LinkedIn comment on behalf of Sami Mohammed Assiri, a Field \
Services Engineer at METCO (Smiths Detection) specialising in airport security \
technology.

Guidelines:
- Be genuine and insightful -- add real value, not generic praise.
- Reference a specific point from the post when possible.
- Keep it between 1 and 3 sentences.
- Maintain a professional yet warm tone.
- Do NOT be sycophantic ("Great post!", "Love this!", "Amazing insight!").
- If the post is in Arabic, comment in Arabic.  Otherwise, use English.
- Never self-promote or include links.
"""


def _load_comment_templates() -> dict:
    """Load comment_templates.yaml."""
    path = _TEMPLATES_DIR / "comment_templates.yaml"
    if not path.exists():
        return {}
    with open(path, "r", encoding="utf-8") as fh:
        return yaml.safe_load(fh) or {}


def _is_relevant(post_text: str) -> bool:
    """Rough keyword check to decide if a post is worth engaging with."""
    lower = post_text.lower()
    return any(kw in lower for kw in TARGET_KEYWORDS)


def _extract_post_text(post: dict) -> str:
    """Safely pull the textual content from a linkedin-api post dict."""
    try:
        commentary = (
            post.get("commentary", "")
            or post.get("specificContent", {})
            .get("com.linkedin.ugc.ShareContent", {})
            .get("shareCommentary", {})
            .get("text", "")
        )
        return commentary or ""
    except (AttributeError, TypeError):
        return ""


def _extract_post_urn(post: dict) -> str | None:
    """Extract the post URN (entity ID) from a feed post dict."""
    return post.get("dashEntityUrn") or post.get("entityUrn") or post.get("urn")


async def _generate_comment(llm_client, post_text: str, brand_profile: dict) -> str:
    """Use the LLM to craft a thoughtful comment for the given post."""
    templates = _load_comment_templates()

    # Provide a few example styles to guide the LLM
    example_block = ""
    categories = list(templates.values()) if templates else []
    if categories:
        flat = [t for cat in categories for t in (cat if isinstance(cat, list) else [])]
        if flat:
            samples = random.sample(flat, min(2, len(flat)))
            example_block = (
                "\nExample comment styles (do NOT copy verbatim):\n"
                + "\n".join(f"- {s}" for s in samples)
                + "\n"
            )

    user_prompt = (
        f"Original LinkedIn post:\n\"\"\"\n{post_text[:1500]}\n\"\"\"\n\n"
        f"{example_block}\n"
        f"Write a comment as Sami. Return ONLY the comment text."
    )

    response = await llm_client.generate(
        prompt=user_prompt,
        system_prompt=COMMENT_SYSTEM_PROMPT,
        temperature=0.75,
        max_tokens=300,
    )
    return response.text.strip().strip('"')


async def engage_with_feed(
    linkedin_api,
    llm_client,
    brand_profile: dict,
    max_likes: int = 15,
    max_comments: int = 5,
) -> dict:
    """Like and comment on recent relevant posts in Sami's LinkedIn feed.

    Parameters
    ----------
    linkedin_api:
        Authenticated ``linkedin_api.Linkedin`` instance.
    llm_client:
        LLM client for generating comments.
    brand_profile:
        Parsed brand profile dict.
    max_likes:
        Maximum number of posts to like in this round.
    max_comments:
        Maximum number of posts to comment on in this round.

    Returns
    -------
    dict
        Summary of actions taken (likes, comments, errors).
    """
    liked = 0
    commented = 0
    errors: list[str] = []

    try:
        feed = linkedin_api.get_feed_posts(limit=50)
    except Exception as exc:
        logger.error("Failed to fetch feed: %s", exc)
        return {"liked": 0, "commented": 0, "errors": [str(exc)]}

    if not feed:
        logger.info("Feed returned no posts.")
        return {"liked": 0, "commented": 0, "errors": []}

    # Shuffle to avoid always engaging with the same people
    random.shuffle(feed)

    for post in feed:
        if liked >= max_likes and commented >= max_comments:
            break

        post_text = _extract_post_text(post)
        post_urn = _extract_post_urn(post)

        if not post_urn:
            continue

        # --- Like ---
        if liked < max_likes:
            try:
                linkedin_api.like(post_urn)
                liked += 1
                logger.debug("Liked post %s", post_urn)
            except Exception as exc:
                errors.append(f"Like failed ({post_urn}): {exc}")
                logger.warning("Failed to like %s: %s", post_urn, exc)

        # --- Comment (only on relevant posts) ---
        if commented < max_comments and post_text and _is_relevant(post_text):
            try:
                comment_text = await _generate_comment(
                    llm_client, post_text, brand_profile
                )
                linkedin_api.comment(post_urn, comment_text)
                commented += 1
                logger.info(
                    "Commented on %s: %s", post_urn, comment_text[:80]
                )
            except Exception as exc:
                errors.append(f"Comment failed ({post_urn}): {exc}")
                logger.warning("Failed to comment on %s: %s", post_urn, exc)

    summary = {
        "liked": liked,
        "commented": commented,
        "errors": errors[:10],  # cap stored errors
    }
    logger.info("Engagement round complete: %s", summary)
    return summary
