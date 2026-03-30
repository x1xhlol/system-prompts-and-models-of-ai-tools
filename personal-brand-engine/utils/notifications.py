"""Notification helpers -- Telegram with logging fallback."""

from __future__ import annotations

import logging
from typing import Any

import httpx

from utils.logger import get_logger

logger = get_logger(__name__)

_TELEGRAM_API = "https://api.telegram.org"


async def send_telegram(bot_token: str, chat_id: str, message: str) -> bool:
    """Send a message via the Telegram Bot API.

    Returns ``True`` on success, ``False`` on failure (logged, never raises).
    """
    url = f"{_TELEGRAM_API}/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            logger.info("telegram_sent", chat_id=chat_id, length=len(message))
            return True
    except httpx.HTTPStatusError as exc:
        logger.error(
            "telegram_http_error",
            status=exc.response.status_code,
            body=exc.response.text[:300],
        )
    except httpx.RequestError as exc:
        logger.error("telegram_request_error", error=str(exc))

    return False


async def send_notification(message: str, settings: Any) -> None:
    """Send a notification to the project owner.

    Attempts Telegram delivery first.  If Telegram credentials are missing
    or the request fails, the message is written to the log instead.

    Parameters
    ----------
    message:
        The notification text (may contain HTML for Telegram).
    settings:
        An object (typically :class:`Settings`) with ``telegram_bot_token``
        and ``telegram_chat_id`` attributes.
    """
    bot_token = getattr(settings, "telegram_bot_token", "") or ""
    chat_id = getattr(settings, "telegram_chat_id", "") or ""

    if bot_token and chat_id:
        sent = await send_telegram(bot_token, chat_id, message)
        if sent:
            return

    # Fallback: log the notification so it is not lost.
    logger.warning("notification_fallback", message=message)
