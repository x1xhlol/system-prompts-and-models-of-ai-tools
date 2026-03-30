"""Social media agent -- posts to Twitter/X and repurposes content across platforms."""

from __future__ import annotations

import logging
import time
from typing import Any

from sqlalchemy.orm import Session

from agents.base_agent import BaseAgent
from agents.social_media.content_repurposer import (
    repurpose_linkedin_to_twitter,
)
from agents.social_media.twitter import (
    create_thread,
    post_tweet,
)

logger = logging.getLogger(__name__)

# In-memory rate limiter.
_RATE_LIMIT_WINDOW: dict[str, float] = {}
RATE_LIMIT_SECONDS: dict[str, int] = {
    "post_twitter": 3600,        # 1 hour between tweets
    "repurpose_content": 7200,   # 2 hours between repurpose runs
}


class SocialMediaAgent(BaseAgent):
    """Autonomous social-media agent for Sami Mohammed Assiri's personal brand.

    Currently supports Twitter/X with plans to expand to other platforms.
    """

    agent_name: str = "social_media"

    def __init__(
        self,
        config: Any,
        llm_client: Any,
        db_session: Session,
    ) -> None:
        super().__init__(config, llm_client, db_session)

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
        - ``post_twitter``       -- create and post a tweet
        - ``repurpose_content``  -- adapt LinkedIn posts for Twitter
        """
        dispatch = {
            "post_twitter": self._post_twitter,
            "repurpose_content": self._repurpose_content,
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
                    f"[Social Media Agent] Task '{task}' failed: {exc}"
                )
                return {"status": "error", "message": str(exc)}

    # ------------------------------------------------------------------
    # post_twitter
    # ------------------------------------------------------------------

    async def _post_twitter(
        self,
        *,
        content: str | None = None,
        pillar: str | None = None,
    ) -> dict:
        """Generate (if needed) and post a tweet.

        Parameters
        ----------
        content:
            Explicit tweet text.  If not provided, the LLM generates one
            based on the brand profile and content strategy.
        pillar:
            Optional content pillar to guide generation (e.g.
            ``"airport_security"``, ``"engineering_tips"``).
        """
        if content is None:
            content = await self._generate_tweet(pillar=pillar)

        api_keys = self._get_twitter_keys()
        result = post_tweet(api_keys, content)

        logger.info("Posted tweet: %s", content[:80])
        return {"tweet": content, "api_response": result}

    async def _generate_tweet(self, *, pillar: str | None = None) -> str:
        """Use the LLM to generate a tweet aligned with the brand."""
        brand_profile = self.get_brand_profile()
        content_strategy = self.get_content_strategy()

        pillar_hint = ""
        if pillar:
            pillars = content_strategy.get("content_pillars", {})
            pillar_data = pillars.get(pillar, {})
            if pillar_data:
                pillar_hint = (
                    f"\nFocus on this content pillar: {pillar}\n"
                    f"Description: {pillar_data.get('description', '')}\n"
                    f"Topics: {', '.join(pillar_data.get('topics', []))}"
                )

        name = brand_profile.get("name", "Sami Mohammed Assiri")
        title = brand_profile.get("title", "Field Services Engineer")
        company = brand_profile.get("company", "METCO (Smiths Detection)")

        messages = [
            {
                "role": "system",
                "content": (
                    f"You are a Twitter/X content creator for {name}, "
                    f"{title} at {company} in Riyadh, Saudi Arabia. "
                    "Create engaging, professional tweets about airport security, "
                    "engineering, and technology. Keep tweets under 280 characters. "
                    "Use 1-3 relevant hashtags. Be authentic and insightful."
                    f"{pillar_hint}"
                ),
            },
            {
                "role": "user",
                "content": "Write a single engaging tweet for my professional audience.",
            },
        ]

        response_text = await self._call_llm(messages)
        # Strip any surrounding quotes the LLM might add
        return response_text.strip().strip('"').strip("'")

    # ------------------------------------------------------------------
    # repurpose_content
    # ------------------------------------------------------------------

    async def _repurpose_content(
        self,
        *,
        linkedin_post: str | None = None,
        post_as_thread: bool = True,
    ) -> dict:
        """Take a LinkedIn post and adapt it for Twitter.

        Parameters
        ----------
        linkedin_post:
            The full text of the LinkedIn post.  Must be provided.
        post_as_thread:
            If ``True`` and the repurposed content has multiple tweets,
            post them as a thread.
        """
        if not linkedin_post:
            return {"error": "No linkedin_post content provided."}

        tweets = await repurpose_linkedin_to_twitter(
            llm_client=self.llm,
            linkedin_post=linkedin_post,
        )

        if not tweets:
            return {"error": "Repurposing produced no tweets."}

        api_keys = self._get_twitter_keys()

        if len(tweets) == 1 or not post_as_thread:
            result = post_tweet(api_keys, tweets[0])
            return {"tweets": tweets, "posted": 1, "api_response": result}
        else:
            results = create_thread(api_keys, tweets)
            return {"tweets": tweets, "posted": len(tweets), "api_responses": results}

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _get_twitter_keys(self) -> dict[str, str]:
        """Extract Twitter API credentials from config."""
        return {
            "api_key": self.config.twitter_api_key,
            "api_secret": self.config.twitter_api_secret,
            "access_token": self.config.twitter_access_token,
            "access_secret": self.config.twitter_access_secret,
            "bearer_token": self.config.twitter_bearer_token,
        }

    async def _call_llm(self, messages: list[dict[str, str]]) -> str:
        """Invoke the LLM client, handling different API shapes."""
        import asyncio
        import inspect

        # OpenAI / Groq compatible
        if hasattr(self.llm, "chat") and hasattr(self.llm.chat, "completions"):
            func = self.llm.chat.completions.create
            if inspect.iscoroutinefunction(func):
                resp = await func(messages=messages, max_tokens=300, temperature=0.8)
            else:
                loop = asyncio.get_event_loop()
                resp = await loop.run_in_executor(
                    None,
                    lambda: func(messages=messages, max_tokens=300, temperature=0.8),
                )
            return resp.choices[0].message.content

        # Ollama-style
        if hasattr(self.llm, "chat"):
            func = self.llm.chat
            if inspect.iscoroutinefunction(func):
                resp = await func(messages=messages)
            else:
                loop = asyncio.get_event_loop()
                resp = await loop.run_in_executor(
                    None, lambda: func(messages=messages)
                )
            if isinstance(resp, dict):
                return resp.get("message", {}).get("content", "")
            return str(resp)

        # Generic callable
        if callable(self.llm):
            if inspect.iscoroutinefunction(self.llm):
                resp = await self.llm(messages=messages)
            else:
                loop = asyncio.get_event_loop()
                resp = await loop.run_in_executor(
                    None, lambda: self.llm(messages=messages)
                )
            return str(resp)

        raise TypeError(f"Unsupported LLM client type: {type(self.llm)}")
