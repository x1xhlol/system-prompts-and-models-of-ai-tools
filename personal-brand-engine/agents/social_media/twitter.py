"""Twitter/X API integration using tweepy v2."""

from __future__ import annotations

import logging
from typing import Any

import tweepy

logger = logging.getLogger(__name__)


def _get_client(api_keys: dict[str, str]) -> tweepy.Client:
    """Create an authenticated tweepy v2 Client.

    Parameters
    ----------
    api_keys:
        Dictionary with keys: ``api_key``, ``api_secret``,
        ``access_token``, ``access_secret``, and optionally ``bearer_token``.

    Returns
    -------
    tweepy.Client
        An authenticated Twitter API v2 client.

    Raises
    ------
    ValueError
        If required credentials are missing.
    """
    required = ("api_key", "api_secret", "access_token", "access_secret")
    missing = [k for k in required if not api_keys.get(k)]
    if missing:
        raise ValueError(
            f"Missing Twitter API credentials: {', '.join(missing)}. "
            "Set them in the .env file."
        )

    return tweepy.Client(
        consumer_key=api_keys["api_key"],
        consumer_secret=api_keys["api_secret"],
        access_token=api_keys["access_token"],
        access_token_secret=api_keys["access_secret"],
        bearer_token=api_keys.get("bearer_token") or None,
        wait_on_rate_limit=True,
    )


def post_tweet(api_keys: dict[str, str], content: str) -> dict[str, Any]:
    """Post a single tweet.

    Parameters
    ----------
    api_keys:
        Twitter API credentials dictionary.
    content:
        The tweet text (max 280 characters).

    Returns
    -------
    dict
        Contains ``tweet_id`` and ``text`` on success, or ``error`` on failure.
    """
    if not content or not content.strip():
        return {"error": "Tweet content is empty."}

    if len(content) > 280:
        logger.warning(
            "Tweet exceeds 280 chars (%d). Truncating.", len(content)
        )
        content = content[:277] + "..."

    client = _get_client(api_keys)

    try:
        response = client.create_tweet(text=content)
        tweet_id = response.data["id"]
        logger.info("Tweet posted successfully (id=%s)", tweet_id)
        return {"tweet_id": tweet_id, "text": content}
    except tweepy.TweepyException as exc:
        logger.error("Failed to post tweet: %s", exc)
        return {"error": str(exc)}


def create_thread(
    api_keys: dict[str, str],
    contents: list[str],
) -> list[dict[str, Any]]:
    """Post a thread (sequence of reply tweets).

    Parameters
    ----------
    api_keys:
        Twitter API credentials dictionary.
    contents:
        List of tweet texts, in order.  The first is the root tweet;
        each subsequent tweet is posted as a reply to the previous one.

    Returns
    -------
    list[dict]
        One result dict per tweet containing ``tweet_id`` and ``text``,
        or ``error`` if that tweet failed.
    """
    if not contents:
        return [{"error": "No thread content provided."}]

    client = _get_client(api_keys)
    results: list[dict[str, Any]] = []
    previous_id: str | None = None

    for idx, text in enumerate(contents):
        if not text or not text.strip():
            results.append({"error": f"Tweet {idx + 1} is empty, skipped."})
            continue

        if len(text) > 280:
            logger.warning(
                "Thread tweet %d exceeds 280 chars (%d). Truncating.",
                idx + 1,
                len(text),
            )
            text = text[:277] + "..."

        try:
            kwargs: dict[str, Any] = {"text": text}
            if previous_id is not None:
                kwargs["in_reply_to_tweet_id"] = previous_id

            response = client.create_tweet(**kwargs)
            tweet_id = response.data["id"]
            previous_id = tweet_id

            logger.info(
                "Thread tweet %d/%d posted (id=%s)",
                idx + 1,
                len(contents),
                tweet_id,
            )
            results.append({"tweet_id": tweet_id, "text": text})

        except tweepy.TweepyException as exc:
            logger.error("Failed to post thread tweet %d: %s", idx + 1, exc)
            results.append({"error": str(exc), "text": text})
            # Stop the thread if a tweet in the middle fails -- subsequent
            # replies would be orphaned.
            break

    return results
