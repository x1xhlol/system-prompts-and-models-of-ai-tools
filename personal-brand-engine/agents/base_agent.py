"""Abstract base class shared by all autonomous agents."""

from __future__ import annotations

import time
from abc import ABC, abstractmethod
from typing import Any

from sqlalchemy.orm import Session

from config.settings import (
    get_brand_profile,
    get_content_strategy,
    get_settings,
)
from storage.models import AgentLog
from utils.logger import get_logger
from utils.notifications import send_notification

logger = get_logger(__name__)


class BaseAgent(ABC):
    """Base class that every agent must inherit from.

    Parameters
    ----------
    config:
        Application :class:`Settings` instance (or a plain dict).
    llm_client:
        Any LLM client object the subclass needs (Ollama, Groq, OpenAI, ...).
    db_session:
        An active SQLAlchemy :class:`Session`.
    """

    agent_name: str = "base"

    def __init__(
        self,
        config: Any,
        llm_client: Any,
        db_session: Session,
    ) -> None:
        self.config = config
        self.llm = llm_client
        self.db = db_session

    # ------------------------------------------------------------------
    # Abstract interface
    # ------------------------------------------------------------------

    @abstractmethod
    async def run(self, task: str, **kwargs: Any) -> dict:
        """Execute the agent's primary task and return a result dict.

        Every concrete agent must implement this method.
        """
        ...

    # ------------------------------------------------------------------
    # Shared helpers
    # ------------------------------------------------------------------

    def log_action(
        self,
        action: str,
        details: str | None = None,
        *,
        status: str = "success",
        duration: float | None = None,
    ) -> AgentLog:
        """Persist an :class:`AgentLog` row and emit a structured log line."""
        entry = AgentLog(
            agent_name=self.agent_name,
            task=action,
            status=status,
            details=details,
            duration_seconds=duration,
        )
        self.db.add(entry)
        self.db.flush()

        log_fn = logger.info if status == "success" else logger.error
        log_fn(
            "agent_action",
            agent=self.agent_name,
            action=action,
            status=status,
            duration_seconds=duration,
        )
        return entry

    async def notify_owner(self, message: str) -> None:
        """Send a notification to the project owner.

        Tries Telegram first (if credentials are configured), otherwise
        falls back to logging the message.
        """
        settings = get_settings()
        await send_notification(message, settings)

    @staticmethod
    def get_brand_profile() -> dict:
        """Return the parsed ``brand_profile.yaml`` configuration."""
        return get_brand_profile()

    @staticmethod
    def get_content_strategy() -> dict:
        """Return the parsed ``content_strategy.yaml`` configuration."""
        return get_content_strategy()

    # ------------------------------------------------------------------
    # Timing context helper
    # ------------------------------------------------------------------

    class _Timer:
        """Minimal wall-clock timer used as a context manager."""

        def __enter__(self) -> "BaseAgent._Timer":
            self.start = time.perf_counter()
            return self

        def __exit__(self, *exc: object) -> None:
            self.elapsed = time.perf_counter() - self.start

    def timer(self) -> _Timer:
        """Return a context-manager that measures elapsed seconds.

        Usage::

            with self.timer() as t:
                await do_work()
            self.log_action("work", duration=t.elapsed)
        """
        return self._Timer()
