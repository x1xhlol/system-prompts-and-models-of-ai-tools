"""LinkedIn agent -- creates posts, engages the network, and optimises the profile."""

from __future__ import annotations

import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Any

from linkedin_api import Linkedin
from sqlalchemy.orm import Session

from agents.base_agent import BaseAgent
from agents.linkedin.content_generator import generate_post
from agents.linkedin.engagement import engage_with_feed
from agents.linkedin.profile_optimizer import optimize_profile
from storage.models import Post

logger = logging.getLogger(__name__)

# Simple in-memory rate-limiter: maps action -> last-execution timestamp.
_RATE_LIMIT_WINDOW: dict[str, float] = {}

# Minimum seconds between repeated invocations of the same action.
RATE_LIMIT_SECONDS: dict[str, int] = {
    "post_content": 3600,       # 1 hour between posts
    "engage_network": 1800,     # 30 min between engagement rounds
    "optimize_profile": 86400,  # once per day
}


class LinkedInAgent(BaseAgent):
    """Autonomous LinkedIn agent for Sami Mohammed Assiri's personal brand."""

    agent_name: str = "linkedin"

    def __init__(
        self,
        config: Any,
        llm_client: Any,
        db_session: Session,
    ) -> None:
        super().__init__(config, llm_client, db_session)
        self._api: Linkedin | None = None

    # ------------------------------------------------------------------
    # LinkedIn API (lazy init)
    # ------------------------------------------------------------------

    def _get_api(self) -> Linkedin:
        """Return an authenticated ``linkedin_api.Linkedin`` instance.

        The credentials come from the application settings.  The client is
        created once and reused for the lifetime of this agent instance.
        """
        if self._api is None:
            email = self.config.linkedin_email
            password = self.config.linkedin_password
            if not email or not password:
                raise RuntimeError(
                    "LinkedIn credentials are not configured. "
                    "Set LINKEDIN_EMAIL and LINKEDIN_PASSWORD in .env."
                )
            try:
                self._api = Linkedin(email, password)
                logger.info("LinkedIn API authenticated for %s", email)
            except Exception as exc:
                logger.error("LinkedIn authentication failed: %s", exc)
                raise
        return self._api

    # ------------------------------------------------------------------
    # Rate limiting
    # ------------------------------------------------------------------

    @staticmethod
    def _is_rate_limited(action: str) -> bool:
        last = _RATE_LIMIT_WINDOW.get(action)
        if last is None:
            return False
        window = RATE_LIMIT_SECONDS.get(action, 0)
        return (time.time() - last) < window

    @staticmethod
    def _mark_executed(action: str) -> None:
        _RATE_LIMIT_WINDOW[action] = time.time()

    # ------------------------------------------------------------------
    # Task dispatcher
    # ------------------------------------------------------------------

    async def run(self, task: str, **kwargs: Any) -> dict:
        """Dispatch *task* to the appropriate handler.

        Supported tasks:
        - ``post_content``      -- generate and publish a LinkedIn post
        - ``engage_network``    -- like / comment on connections' recent posts
        - ``optimize_profile``  -- return profile improvement suggestions
        """
        dispatch = {
            "post_content": self.post_content,
            "engage_network": self.engage_network,
            "optimize_profile": self.optimize_profile,
        }

        handler = dispatch.get(task)
        if handler is None:
            self.log_action(task, details=f"Unknown task: {task}", status="failed")
            return {"status": "error", "message": f"Unknown task: {task}"}

        if self._is_rate_limited(task):
            msg = f"Rate-limited: {task} was run too recently."
            logger.warning(msg)
            self.log_action(task, details=msg, status="skipped")
            return {"status": "skipped", "message": msg}

        with self.timer() as t:
            try:
                result = await handler(**kwargs)
                self._mark_executed(task)
                self.log_action(task, details=str(result), duration=t.elapsed)
                return {"status": "success", "result": result}
            except Exception as exc:
                logger.exception("Task %s failed", task)
                self.log_action(
                    task,
                    details=str(exc),
                    status="failed",
                    duration=t.elapsed,
                )
                await self.notify_owner(
                    f"[LinkedIn Agent] Task '{task}' failed: {exc}"
                )
                return {"status": "error", "message": str(exc)}

    # ------------------------------------------------------------------
    # post_content
    # ------------------------------------------------------------------

    async def post_content(self, *, pillar: str | None = None) -> dict:
        """Generate a LinkedIn post via LLM and publish it."""
        brand_profile = self.get_brand_profile()
        content_strategy = self.get_content_strategy()

        # Generate the post text
        post_text = await generate_post(
            self.llm,
            brand_profile,
            content_strategy,
            pillar=pillar,
        )

        # Persist as draft first
        post_row = Post(
            platform="linkedin",
            content=post_text,
            status="draft",
        )
        self.db.add(post_row)
        self.db.flush()

        # Publish via LinkedIn API
        api = self._get_api()
        try:
            api.post(post_text)
            post_row.status = "published"
            post_row.published_at = datetime.now(timezone.utc)
            self.db.commit()
            logger.info("Published LinkedIn post id=%s", post_row.id)
        except Exception as exc:
            post_row.status = "failed"
            self.db.commit()
            raise RuntimeError(f"Failed to publish post: {exc}") from exc

        return {
            "post_id": post_row.id,
            "content_preview": post_text[:120],
            "published": True,
        }

    # ------------------------------------------------------------------
    # engage_network
    # ------------------------------------------------------------------

    async def engage_network(
        self,
        *,
        max_likes: int = 15,
        max_comments: int = 5,
    ) -> dict:
        """Like and comment on recent posts from connections."""
        api = self._get_api()
        brand_profile = self.get_brand_profile()

        result = await engage_with_feed(
            linkedin_api=api,
            llm_client=self.llm,
            brand_profile=brand_profile,
            max_likes=max_likes,
            max_comments=max_comments,
        )
        return result

    # ------------------------------------------------------------------
    # optimize_profile
    # ------------------------------------------------------------------

    async def optimize_profile(self) -> dict:
        """Return a dict of profile optimisation suggestions."""
        api = self._get_api()
        brand_profile = self.get_brand_profile()

        suggestions = await optimize_profile(
            llm_client=self.llm,
            brand_profile=brand_profile,
            linkedin_api=api,
        )
        return suggestions
