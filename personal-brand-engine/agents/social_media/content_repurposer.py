"""Repurpose long-form content (e.g. LinkedIn posts) into Twitter-friendly formats."""

from __future__ import annotations

import asyncio
import inspect
import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

# Maximum characters per tweet.
_TWEET_LIMIT = 280


async def repurpose_linkedin_to_twitter(
    llm_client: Any,
    linkedin_post: str,
) -> list[str]:
    """Convert a LinkedIn post into a Twitter thread.

    The LLM extracts key insights and reformats the content as a concise
    tweet thread with relevant hashtags.

    Parameters
    ----------
    llm_client:
        Any LLM client compatible with chat-style APIs.
    linkedin_post:
        The full text of the LinkedIn post.

    Returns
    -------
    list[str]
        A list of tweet strings ready to post as a thread.
        Returns a single-element list if the content fits one tweet.
    """
    if not linkedin_post or not linkedin_post.strip():
        return []

    messages = [
        {
            "role": "system",
            "content": (
                "You are a social media content strategist for Sami Mohammed Assiri, "
                "a Field Services Engineer at METCO (Smiths Detection) in Riyadh. "
                "Your job is to repurpose LinkedIn posts into Twitter/X threads.\n\n"
                "Rules:\n"
                "1. Each tweet MUST be under 280 characters.\n"
                "2. Keep the core message and key insights.\n"
                "3. Use a conversational, engaging tone.\n"
                "4. Add 1-3 relevant hashtags to the last tweet only.\n"
                "5. If the content fits in one tweet, return just one.\n"
                "6. For threads, number them (1/N format) at the start.\n"
                "7. Remove LinkedIn-specific formatting (bullet emojis, etc.).\n"
                "8. Each tweet should stand on its own while contributing to the thread.\n\n"
                "Return ONLY the tweets, one per line, separated by ---"
            ),
        },
        {
            "role": "user",
            "content": (
                f"Repurpose this LinkedIn post into a Twitter thread:\n\n"
                f"{linkedin_post}"
            ),
        },
    ]

    try:
        raw_response = await _call_llm(llm_client, messages)
    except Exception as exc:
        logger.error("LLM call failed during repurposing: %s", exc)
        # Fallback: try a simple extraction
        return _fallback_repurpose(linkedin_post)

    tweets = _parse_thread_response(raw_response)

    # Validate and truncate
    validated: list[str] = []
    for tweet in tweets:
        tweet = tweet.strip()
        if not tweet:
            continue
        if len(tweet) > _TWEET_LIMIT:
            tweet = tweet[: _TWEET_LIMIT - 3] + "..."
        validated.append(tweet)

    if not validated:
        return _fallback_repurpose(linkedin_post)

    return validated


def _parse_thread_response(raw: str) -> list[str]:
    """Parse the LLM response into individual tweet strings.

    Supports multiple separators:
    - ``---`` (our requested format)
    - Numbered lines (``1/N``, ``1.``, etc.)
    - Double newlines
    """
    raw = raw.strip()

    # Try --- separator first
    if "---" in raw:
        parts = [p.strip() for p in raw.split("---") if p.strip()]
        if parts:
            return parts

    # Try numbered format (e.g., "1/3 ...\n\n2/3 ...")
    numbered = re.split(r"\n\s*\d+[/.]\d*\s*", "\n" + raw)
    numbered = [p.strip() for p in numbered if p.strip()]
    if len(numbered) > 1:
        return numbered

    # Try double newline
    paragraphs = [p.strip() for p in raw.split("\n\n") if p.strip()]
    if len(paragraphs) > 1:
        return paragraphs

    # Single tweet
    return [raw]


def _fallback_repurpose(linkedin_post: str) -> list[str]:
    """Simple non-LLM fallback that extracts the first sentence."""
    # Take the first meaningful sentence
    sentences = re.split(r"[.!?]\s+", linkedin_post.strip())
    if sentences:
        first = sentences[0].strip()
        if len(first) > _TWEET_LIMIT - 30:
            first = first[: _TWEET_LIMIT - 33] + "..."
        return [f"{first} #Engineering #AirportSecurity"]
    return []


async def _call_llm(
    llm_client: Any,
    messages: list[dict[str, str]],
) -> str:
    """Invoke the LLM, handling sync/async and different interfaces."""
    # OpenAI / Groq compatible
    if hasattr(llm_client, "chat") and hasattr(llm_client.chat, "completions"):
        func = llm_client.chat.completions.create
        if inspect.iscoroutinefunction(func):
            resp = await func(messages=messages, max_tokens=600, temperature=0.7)
        else:
            loop = asyncio.get_event_loop()
            resp = await loop.run_in_executor(
                None,
                lambda: func(messages=messages, max_tokens=600, temperature=0.7),
            )
        return resp.choices[0].message.content

    # Ollama-style
    if hasattr(llm_client, "chat"):
        func = llm_client.chat
        if inspect.iscoroutinefunction(func):
            resp = await func(messages=messages)
        else:
            loop = asyncio.get_event_loop()
            resp = await loop.run_in_executor(None, lambda: func(messages=messages))
        if isinstance(resp, dict):
            return resp.get("message", {}).get("content", "")
        return str(resp)

    # Generic callable
    if callable(llm_client):
        if inspect.iscoroutinefunction(llm_client):
            resp = await llm_client(messages=messages)
        else:
            loop = asyncio.get_event_loop()
            resp = await loop.run_in_executor(
                None, lambda: llm_client(messages=messages)
            )
        return str(resp)

    raise TypeError(f"Unsupported LLM client type: {type(llm_client)}")
