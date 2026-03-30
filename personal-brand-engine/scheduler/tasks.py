"""Task dispatcher - maps agent_name + task_name to actual agent execution."""

from __future__ import annotations

import logging
import time
import traceback

from config.settings import get_settings
from llm.client import get_llm_client
from storage.database import get_db, init_db
from storage.models import AgentLog

logger = logging.getLogger(__name__)

# Agent registry - lazy imports to avoid circular dependencies
AGENT_REGISTRY = {
    "linkedin": "agents.linkedin.LinkedInAgent",
    "email": "agents.email.EmailAgent",
    "social_media": "agents.social_media.SocialMediaAgent",
    "whatsapp": "agents.whatsapp.WhatsAppAgent",
    "cv_optimizer": "agents.cv_optimizer.CVOptimizerAgent",
    "content_strategist": "agents.content_strategist.ContentStrategistAgent",
    "opportunity_scout": "agents.opportunity_scout.OpportunityScoutAgent",
}


def _import_agent(dotted_path: str):
    """Dynamically import an agent class from its dotted path."""
    module_path, class_name = dotted_path.rsplit(".", 1)
    import importlib
    module = importlib.import_module(module_path)
    return getattr(module, class_name)


async def execute_agent_task(agent_name: str, task_name: str):
    """Execute a specific task for a specific agent."""
    logger.info("Executing: %s.%s", agent_name, task_name)
    start_time = time.time()

    init_db()
    db = get_db()

    try:
        agent_path = AGENT_REGISTRY.get(agent_name)
        if not agent_path:
            logger.error("Unknown agent: %s", agent_name)
            return

        agent_class = _import_agent(agent_path)
        settings = get_settings()
        llm_client = get_llm_client()

        agent = agent_class(config=settings, llm_client=llm_client, db_session=db)
        result = await agent.run(task=task_name)

        duration = time.time() - start_time

        log_entry = AgentLog(
            agent_name=agent_name,
            task=task_name,
            status="success",
            details=str(result)[:2000] if result else "OK",
            duration_seconds=round(duration, 2),
        )
        db.add(log_entry)
        db.commit()

        logger.info(
            "Completed: %s.%s in %.2fs", agent_name, task_name, duration
        )
        return result

    except Exception as e:
        duration = time.time() - start_time
        error_detail = f"{type(e).__name__}: {e}\n{traceback.format_exc()}"
        logger.error("Failed: %s.%s - %s", agent_name, task_name, e)

        try:
            log_entry = AgentLog(
                agent_name=agent_name,
                task=task_name,
                status="failed",
                details=error_detail[:2000],
                duration_seconds=round(duration, 2),
            )
            db.add(log_entry)
            db.commit()
        except Exception:
            logger.error("Failed to log error to database")

    finally:
        db.close()
