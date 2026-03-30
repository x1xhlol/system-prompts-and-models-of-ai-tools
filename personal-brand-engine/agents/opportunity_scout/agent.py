"""Opportunity Scout Agent -- monitors the internet for career opportunities,
industry events, and relevant news for Sami Assiri.

Supported tasks (passed to ``run(task)``):

- ``scan_opportunities`` -- run all scanners and score results
- ``scan_linkedin_jobs`` -- search LinkedIn for relevant job postings
- ``scan_industry_news`` -- monitor aviation / security news and GACA
- ``daily_digest`` -- compile found opportunities and send notifications
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from agents.base_agent import BaseAgent
from agents.opportunity_scout.notifier import (
    send_daily_digest,
    send_email_notification,
    send_whatsapp_notification,
)
from agents.opportunity_scout.scanners import (
    scan_gaca_announcements,
    scan_google_jobs,
    scan_linkedin_jobs_api,
    scan_news,
    scan_smiths_detection_careers,
)
from agents.opportunity_scout.scorer import score_opportunity
from config.settings import get_settings
from storage.models import Opportunity
from utils.logger import get_logger

logger = get_logger(__name__)

# Minimum relevance score to trigger a notification
_NOTIFY_THRESHOLD = 0.45


class OpportunityScoutAgent(BaseAgent):
    """Autonomous agent that scans the internet for opportunities relevant
    to Sami Assiri's career profile and sends notifications."""

    agent_name: str = "opportunity_scout"

    # ------------------------------------------------------------------
    # Task dispatcher
    # ------------------------------------------------------------------

    async def run(self, task: str, **kwargs: Any) -> dict:
        """Dispatch to the appropriate sub-task handler.

        Parameters
        ----------
        task:
            One of ``scan_opportunities``, ``scan_linkedin_jobs``,
            ``scan_industry_news``, or ``daily_digest``.

        Returns
        -------
        dict
            Result summary with keys like ``count``, ``opportunities``,
            ``notifications_sent``, etc.
        """
        dispatch = {
            "scan_opportunities": self._scan_opportunities,
            "scan_linkedin_jobs": self._scan_linkedin_jobs,
            "scan_industry_news": self._scan_industry_news,
            "daily_digest": self._daily_digest,
        }

        handler = dispatch.get(task)
        if handler is None:
            self.log_action(
                f"unknown_task:{task}",
                details=f"Valid tasks: {', '.join(dispatch)}",
                status="failed",
            )
            return {"error": f"Unknown task: {task}", "valid_tasks": list(dispatch)}

        with self.timer() as t:
            result = await handler(**kwargs)

        self.log_action(task, details=str(result.get("count", 0)), duration=t.elapsed)
        return result

    # ------------------------------------------------------------------
    # scan_opportunities -- full scan across all sources
    # ------------------------------------------------------------------

    async def _scan_opportunities(self, **kwargs: Any) -> dict:
        """Run all scanners, score results, store and notify."""
        brand_profile = self.get_brand_profile()
        linkedin_api = kwargs.get("linkedin_api")

        # Run all scanners
        raw_opportunities: list[dict] = []

        google_results = await self._safe_scan("google_jobs", scan_google_jobs)
        raw_opportunities.extend(google_results)

        linkedin_results = await self._safe_scan(
            "linkedin_jobs",
            scan_linkedin_jobs_api,
            linkedin_api=linkedin_api,
        )
        raw_opportunities.extend(linkedin_results)

        news_results = await self._safe_scan("industry_news", scan_news)
        raw_opportunities.extend(news_results)

        smiths_results = await self._safe_scan(
            "smiths_detection", scan_smiths_detection_careers
        )
        raw_opportunities.extend(smiths_results)

        gaca_results = await self._safe_scan(
            "gaca_announcements", scan_gaca_announcements
        )
        raw_opportunities.extend(gaca_results)

        logger.info("scan_raw_total", count=len(raw_opportunities))

        # Deduplicate across sources by URL then title
        unique = self._deduplicate(raw_opportunities)

        # Score each opportunity
        scored: list[dict] = []
        for opp in unique:
            if not self._is_already_tracked(opp):
                opp["relevance_score"] = await score_opportunity(
                    self.llm, opp, brand_profile
                )
                scored.append(opp)

        # Store in database
        stored = self._store_opportunities(scored)

        # Notify on high-relevance opportunities
        notified_count = await self._notify_high_relevance(scored)

        return {
            "count": len(scored),
            "stored": stored,
            "notified": notified_count,
            "sources": {
                "google_jobs": len(google_results),
                "linkedin": len(linkedin_results),
                "news": len(news_results),
                "smiths_detection": len(smiths_results),
                "gaca": len(gaca_results),
            },
        }

    # ------------------------------------------------------------------
    # scan_linkedin_jobs -- LinkedIn-focused scan
    # ------------------------------------------------------------------

    async def _scan_linkedin_jobs(self, **kwargs: Any) -> dict:
        """Search LinkedIn for relevant job postings."""
        brand_profile = self.get_brand_profile()
        linkedin_api = kwargs.get("linkedin_api")

        keywords = [
            "Smiths Detection",
            "airport security engineer",
            "field services engineer Saudi",
            "METCO engineer",
            "Rapiscan field engineer",
            "L3Harris security Saudi",
            "aviation security engineer",
            "mechanical engineer airport",
        ]

        results = await self._safe_scan(
            "linkedin_jobs",
            scan_linkedin_jobs_api,
            linkedin_api=linkedin_api,
            keywords=keywords,
        )

        scored: list[dict] = []
        for opp in results:
            if not self._is_already_tracked(opp):
                opp["relevance_score"] = await score_opportunity(
                    self.llm, opp, brand_profile
                )
                scored.append(opp)

        stored = self._store_opportunities(scored)
        notified_count = await self._notify_high_relevance(scored)

        return {
            "count": len(scored),
            "stored": stored,
            "notified": notified_count,
            "source": "linkedin",
        }

    # ------------------------------------------------------------------
    # scan_industry_news -- news and GACA monitoring
    # ------------------------------------------------------------------

    async def _scan_industry_news(self, **kwargs: Any) -> dict:
        """Monitor aviation security news and GACA announcements."""
        brand_profile = self.get_brand_profile()

        news_results = await self._safe_scan("industry_news", scan_news)
        smiths_results = await self._safe_scan(
            "smiths_detection", scan_smiths_detection_careers
        )
        gaca_results = await self._safe_scan(
            "gaca_announcements", scan_gaca_announcements
        )

        all_news = news_results + smiths_results + gaca_results
        unique = self._deduplicate(all_news)

        scored: list[dict] = []
        for opp in unique:
            if not self._is_already_tracked(opp):
                opp["relevance_score"] = await score_opportunity(
                    self.llm, opp, brand_profile
                )
                scored.append(opp)

        stored = self._store_opportunities(scored)
        notified_count = await self._notify_high_relevance(scored)

        return {
            "count": len(scored),
            "stored": stored,
            "notified": notified_count,
            "sources": {
                "news": len(news_results),
                "smiths_detection": len(smiths_results),
                "gaca": len(gaca_results),
            },
        }

    # ------------------------------------------------------------------
    # daily_digest -- compile and send
    # ------------------------------------------------------------------

    async def _daily_digest(self, **kwargs: Any) -> dict:
        """Compile all recent opportunities into a digest and send it."""
        # First run a fresh scan
        scan_result = await self._scan_opportunities(**kwargs)

        # Fetch all opportunities with status 'new' (not yet digested)
        new_opps = (
            self.db.query(Opportunity)
            .filter(Opportunity.status.in_(["new", "notified"]))
            .order_by(Opportunity.relevance_score.desc())
            .all()
        )

        opp_dicts = [
            {
                "title": o.title,
                "company": o.company or "",
                "url": o.url or "",
                "description": (o.description or "")[:300],
                "source": o.source,
                "relevance_score": o.relevance_score,
            }
            for o in new_opps
        ]

        settings = get_settings()
        digest_results = await send_daily_digest(settings, opp_dicts)

        # Mark opportunities as notified
        for o in new_opps:
            o.status = "notified"
            o.notified_at = datetime.utcnow()
        self.db.commit()

        return {
            "scan": scan_result,
            "digest_count": len(opp_dicts),
            "channels": digest_results,
        }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    async def _safe_scan(
        self, name: str, scanner_fn: Any, **kwargs: Any
    ) -> list[dict]:
        """Run a scanner function with error handling."""
        try:
            results = await scanner_fn(**kwargs)
            logger.info(f"scanner_{name}_complete", count=len(results))
            return results
        except Exception as exc:  # noqa: BLE001
            logger.error(f"scanner_{name}_failed", error=str(exc))
            self.log_action(
                f"scan_{name}",
                details=str(exc),
                status="failed",
            )
            return []

    def _deduplicate(self, opportunities: list[dict]) -> list[dict]:
        """Remove duplicate opportunities by URL, falling back to title."""
        seen: set[str] = set()
        unique: list[dict] = []
        for opp in opportunities:
            key = opp.get("url") or opp.get("title", "")
            if key and key not in seen:
                seen.add(key)
                unique.append(opp)
        return unique

    def _is_already_tracked(self, opp: dict) -> bool:
        """Check if an opportunity with the same URL or title already exists."""
        url = opp.get("url")
        if url:
            existing = (
                self.db.query(Opportunity)
                .filter(Opportunity.url == url)
                .first()
            )
            if existing:
                return True

        title = opp.get("title")
        company = opp.get("company")
        if title and company:
            existing = (
                self.db.query(Opportunity)
                .filter(
                    Opportunity.title == title,
                    Opportunity.company == company,
                )
                .first()
            )
            if existing:
                return True

        return False

    def _store_opportunities(self, opportunities: list[dict]) -> int:
        """Persist scored opportunities to the database."""
        count = 0
        for opp in opportunities:
            try:
                record = Opportunity(
                    source=opp.get("source", "unknown"),
                    title=opp.get("title", "Untitled"),
                    company=opp.get("company"),
                    url=opp.get("url"),
                    description=opp.get("description"),
                    relevance_score=opp.get("relevance_score"),
                    status="new",
                )
                self.db.add(record)
                count += 1
            except Exception as exc:  # noqa: BLE001
                logger.error(
                    "store_opportunity_error",
                    title=opp.get("title"),
                    error=str(exc),
                )
        self.db.flush()
        return count

    async def _notify_high_relevance(self, opportunities: list[dict]) -> int:
        """Send immediate notifications for high-relevance opportunities."""
        settings = get_settings()
        notified = 0

        for opp in opportunities:
            score = opp.get("relevance_score", 0) or 0
            if score < _NOTIFY_THRESHOLD:
                continue

            # Try WhatsApp first, then email, then fallback to base notify
            whatsapp_sent = await send_whatsapp_notification(settings, opp)
            email_sent = await send_email_notification(settings, opp)

            if not whatsapp_sent and not email_sent:
                # Fallback to Telegram / log via base class
                msg = (
                    f"🔔 Opportunity [{int(score * 100)}%]: "
                    f"{opp.get('title', 'N/A')} at {opp.get('company', 'N/A')}\n"
                    f"{opp.get('url', '')}"
                )
                await self.notify_owner(msg)

            notified += 1

        return notified
