"""
Pipeline Worker Tasks — Celery background tasks for the autonomous pipeline.
"""

import asyncio
import logging
from celery import shared_task
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=120)
def run_pipeline_for_lead(self, tenant_id: str, lead_data: dict):
    """
    Process a new lead through the full autonomous pipeline in the background.
    This is the async version of pipeline.process_new_lead.
    """
    from app.database import async_session
    from app.services.agents.autonomous_pipeline import AutonomousPipeline

    async def run():
        async with async_session() as db:
            pipeline = AutonomousPipeline(db)
            result = await pipeline.process_new_lead(tenant_id, lead_data)
            await db.commit()
            return result

    try:
        logger.info(f"🚀 Pipeline task started for lead {lead_data.get('lead_id')} (tenant: {tenant_id})")
        result = asyncio.run(run())
        logger.info(f"✅ Pipeline completed: stage={result.get('final_stage')}, tokens={result.get('total_tokens_used')}")
        return result
    except Exception as exc:
        logger.error(f"❌ Pipeline failed for lead {lead_data.get('lead_id')}: {exc}")
        self.retry(exc=exc)


@shared_task(bind=True, max_retries=3)
def advance_pipeline_stage(self, tenant_id: str, lead_id: str, current_stage: str,
                            trigger: str, context: dict = None):
    """Advance a lead to the next pipeline stage in the background."""
    from app.database import async_session
    from app.services.agents.autonomous_pipeline import AutonomousPipeline

    async def run():
        async with async_session() as db:
            pipeline = AutonomousPipeline(db)
            result = await pipeline.advance_stage(tenant_id, lead_id, current_stage, trigger, context)
            await db.commit()
            return result

    try:
        logger.info(f"📈 Stage advance: {current_stage} → (trigger: {trigger}) for lead {lead_id}")
        result = asyncio.run(run())
        logger.info(f"✅ Stage advanced to: {result.get('new_stage')}")
        return result
    except Exception as exc:
        logger.error(f"❌ Stage advance failed: {exc}")
        self.retry(exc=exc)


@shared_task(bind=True, max_retries=2)
def dispatch_agent_actions(self, actions: list, tenant_id: str):
    """Dispatch agent-generated actions to external services."""
    from app.database import async_session
    from app.services.agents.action_dispatcher import ActionDispatcher

    async def run():
        async with async_session() as db:
            dispatcher = ActionDispatcher(db)
            results = await dispatcher.dispatch(actions, tenant_id)
            await db.commit()
            return results

    try:
        logger.info(f"📤 Dispatching {len(actions)} actions for tenant {tenant_id}")
        results = asyncio.run(run())
        success = sum(1 for r in results if r.get("status") == "success")
        logger.info(f"✅ Dispatched: {success}/{len(actions)} successful")
        return results
    except Exception as exc:
        logger.error(f"❌ Action dispatch failed: {exc}")
        self.retry(exc=exc)


@shared_task(bind=True, max_retries=1)
def run_daily_pipeline_sweep(self, tenant_id: str):
    """
    Daily sweep: find stale leads and advance or nurture them.
    Runs as a scheduled task (every 24h).
    """
    from app.database import async_session
    from app.services.agents.autonomous_pipeline import AutonomousPipeline

    async def run():
        async with async_session() as db:
            pipeline = AutonomousPipeline(db)
            # TODO: Query stale leads from DB and advance them
            summary = pipeline.get_pipeline_summary()
            return {
                "status": "sweep_completed",
                "pipeline_summary": summary,
            }

    try:
        logger.info(f"🧹 Daily pipeline sweep for tenant {tenant_id}")
        result = asyncio.run(run())
        return result
    except Exception as exc:
        logger.error(f"❌ Daily sweep failed: {exc}")
        return {"status": "error", "detail": str(exc)}
