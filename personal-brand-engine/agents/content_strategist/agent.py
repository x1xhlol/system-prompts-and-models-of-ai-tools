"""Content Strategist agent -- weekly planning, trend analysis, and calendar management."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from agents.base_agent import BaseAgent
from agents.content_strategist.calendar_planner import (
    generate_weekly_calendar,
)
from agents.content_strategist.trend_analyzer import (
    analyze_trends,
)
from storage.models import ContentCalendar

logger = logging.getLogger(__name__)

# Keywords used for trend scanning (aligned with brand pillars)
_DEFAULT_KEYWORDS = [
    "airport security",
    "aviation safety",
    "Smiths Detection",
    "GACA",
    "X-ray screening",
    "trace detection",
    "field services engineering",
    "Saudi aviation",
    "ICAO security",
]


class ContentStrategistAgent(BaseAgent):
    """Autonomous agent that plans Sami's content calendar and tracks trends."""

    agent_name: str = "content_strategist"

    def __init__(
        self,
        config: Any,
        llm_client: Any,
        db_session: Session,
    ) -> None:
        super().__init__(config, llm_client, db_session)

    # ------------------------------------------------------------------
    # Task dispatcher
    # ------------------------------------------------------------------

    async def run(self, task: str, **kwargs: Any) -> dict:
        """Dispatch *task* to the matching handler.

        Supported tasks
        ---------------
        - ``weekly_plan``     -- generate a 7-day content calendar
        - ``trend_analysis``  -- scan for trending topics in aviation security
        """
        dispatch = {
            "weekly_plan": self._weekly_plan,
            "trend_analysis": self._trend_analysis,
        }

        handler = dispatch.get(task)
        if handler is None:
            self.log_action(task, details=f"Unknown task: {task}", status="failed")
            return {"status": "error", "message": f"Unknown task: {task}"}

        with self.timer() as t:
            try:
                result = await handler(**kwargs)
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
                    f"[Content Strategist] Task '{task}' failed: {exc}"
                )
                return {"status": "error", "message": str(exc)}

    # ------------------------------------------------------------------
    # weekly_plan
    # ------------------------------------------------------------------

    async def _weekly_plan(self, **kwargs: Any) -> dict:
        """Generate a week of content and persist to the ContentCalendar table."""
        brand_profile = self.get_brand_profile()
        content_strategy = self.get_content_strategy()

        # Optionally run trend analysis first to inform the plan
        trends = kwargs.get("trends")
        if trends is None:
            trend_result = await analyze_trends(
                self.llm,
                keywords=_DEFAULT_KEYWORDS,
                brand_profile=brand_profile,
            )
            trends = trend_result

        calendar_entries = await generate_weekly_calendar(
            llm_client=self.llm,
            brand_profile=brand_profile,
            content_strategy=content_strategy,
            trends=trends,
        )

        # Persist each entry to the database
        saved_ids: list[int] = []
        for entry in calendar_entries:
            row = ContentCalendar(
                date=datetime.fromisoformat(entry["date"]),
                pillar=entry["pillar"],
                topic=entry["topic"],
                platform=entry["platform"],
                status="planned",
            )
            self.db.add(row)
            self.db.flush()
            saved_ids.append(row.id)

        self.db.commit()
        logger.info("Weekly plan saved: %d entries", len(saved_ids))

        return {
            "entries_created": len(saved_ids),
            "calendar_ids": saved_ids,
            "calendar": calendar_entries,
        }

    # ------------------------------------------------------------------
    # trend_analysis
    # ------------------------------------------------------------------

    async def _trend_analysis(self, **kwargs: Any) -> dict:
        """Analyze current trends relevant to the brand."""
        brand_profile = self.get_brand_profile()
        keywords = kwargs.get("keywords", _DEFAULT_KEYWORDS)

        trends = await analyze_trends(
            self.llm,
            keywords=keywords,
            brand_profile=brand_profile,
        )

        logger.info("Trend analysis complete: %d trends found", len(trends))
        return {
            "trends_found": len(trends),
            "trends": trends,
        }
