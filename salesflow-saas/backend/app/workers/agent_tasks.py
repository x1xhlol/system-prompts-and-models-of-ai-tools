"""
AI Agent Async Tasks — Celery
Executes agents asynchronously in the background.
"""

import asyncio
import logging
from celery import shared_task
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)

def execute_agent_sync(agent_type: str, input_data: dict, tenant_id: str = None, 
                       lead_id: str = None, conversation_id: str = None):
    """Synchronous wrapper for async true agent executor."""
    from app.database import async_session
    from app.services.agents.executor import AgentExecutor
    import json
    
    async def run():
        async with async_session() as db:
            executor = AgentExecutor(db)
            result = await executor.execute(
                agent_type=agent_type,
                input_data=input_data,
                tenant_id=tenant_id,
                lead_id=lead_id,
                conversation_id=conversation_id
            )
            # Ensure DB updates are committed
            await db.commit()
            return result.to_dict()
            
    return asyncio.run(run())


def execute_event_sync(event_type: str, input_data: dict, tenant_id: str = None, 
                       lead_id: str = None, conversation_id: str = None):
    """Synchronous wrapper for async event executor."""
    from app.database import async_session
    from app.services.agents.executor import AgentExecutor
    
    async def run():
        async with async_session() as db:
            executor = AgentExecutor(db)
            results = await executor.execute_event(
                event_type=event_type,
                input_data=input_data,
                tenant_id=tenant_id,
                lead_id=lead_id,
                conversation_id=conversation_id
            )
            await db.commit()
            return [r.to_dict() for r in results]
            
    return asyncio.run(run())


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def run_ai_agent(self, agent_type: str, input_data: dict, tenant_id: str = None, 
                 lead_id: str = None, conversation_id: str = None):
    """Run a specific AI agent in the background."""
    try:
        logger.info(f"Starting agent {agent_type} for tenant {tenant_id}")
        return execute_agent_sync(agent_type, input_data, tenant_id, lead_id, conversation_id)
    except Exception as exc:
        logger.error(f"Agent {agent_type} failed: {exc}")
        self.retry(exc=exc)


@shared_task(bind=True, max_retries=3)
def process_agent_event(self, event_type: str, input_data: dict, tenant_id: str = None, 
                        lead_id: str = None, conversation_id: str = None):
    """Process an event by triggering the appropriate AI agent chain."""
    try:
        logger.info(f"Processing agent event {event_type} for tenant {tenant_id}")
        return execute_event_sync(event_type, input_data, tenant_id, lead_id, conversation_id)
    except Exception as exc:
        logger.error(f"Event {event_type} failed: {exc}")
        self.retry(exc=exc)
