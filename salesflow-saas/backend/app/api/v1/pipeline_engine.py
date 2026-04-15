"""
Pipeline API Endpoints — Autonomous Sales Pipeline
====================================================
RESTful API for the autonomous pipeline engine.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter(prefix="/pipeline", tags=["Autonomous Pipeline"])


# ── Schemas ─────────────────────────────────────────────

class ProcessLeadRequest(BaseModel):
    lead_id: str
    full_name: str = ""
    phone: str = ""
    email: str = ""
    company_name: str = ""
    sector: str = ""
    city: str = ""
    source: str = "web"
    notes: str = ""


class AdvanceStageRequest(BaseModel):
    lead_id: str
    current_stage: str
    trigger: str
    context: dict = {}


# ── Pipeline Endpoints ──────────────────────────────────

@router.post("/process-lead")
async def process_lead_through_pipeline(
    data: ProcessLeadRequest,
    tenant_id: str = Query(..., description="Tenant UUID"),
    db: AsyncSession = Depends(get_db),
):
    """
    🚀 Process a new lead through the full autonomous pipeline.
    
    This is the main entry point for the autonomous sales machine.
    The pipeline will:
    1. Qualify the lead (score 0-100)
    2. Route to appropriate agents (hot → closer, warm → outreach)
    3. Attempt to book a meeting (if qualified)
    4. Prepare meeting materials (if booked)
    
    Returns the full pipeline execution result with stage history.
    """
    from app.services.agents.autonomous_pipeline import AutonomousPipeline

    pipeline = AutonomousPipeline(db)
    result = await pipeline.process_new_lead(
        tenant_id=tenant_id,
        lead_data={
            "lead_id": data.lead_id,
            "full_name": data.full_name,
            "contact_phone": data.phone,
            "contact_email": data.email,
            "company_name": data.company_name,
            "sector": data.sector,
            "city": data.city,
            "source": data.source,
            "notes": data.notes,
        }
    )
    await db.commit()
    return result


@router.post("/advance-stage")
async def advance_pipeline_stage(
    data: AdvanceStageRequest,
    tenant_id: str = Query(..., description="Tenant UUID"),
    db: AsyncSession = Depends(get_db),
):
    """
    Manually advance a lead to the next pipeline stage.
    
    Triggers:
    - `meeting_booked`: Lead scheduled a meeting
    - `meeting_completed`: Meeting took place
    - `meeting_cancelled`: Meeting was cancelled
    - `ready_to_close`: Client ready to sign
    - `deal_signed`: Deal is closed won
    - `deal_rejected`: Deal is closed lost
    - `positive_response`: Client responded positively
    - `objection`: Client raised an objection
    - `no_response_7d`: No response after 7 days
    - `lost_interest`: Client lost interest
    """
    from app.services.agents.autonomous_pipeline import AutonomousPipeline

    pipeline = AutonomousPipeline(db)
    result = await pipeline.advance_stage(
        tenant_id=tenant_id,
        lead_id=data.lead_id,
        current_stage=data.current_stage,
        trigger=data.trigger,
        context=data.context,
    )
    await db.commit()
    return result


@router.get("/stages")
async def get_pipeline_stages():
    """List all pipeline stages with their configurations."""
    from app.services.agents.autonomous_pipeline import AutonomousPipeline, PipelineStage
    from app.database import async_session

    async with async_session() as db:
        pipeline = AutonomousPipeline(db)
        return {
            "stages": pipeline.get_pipeline_stages(),
            "summary": pipeline.get_pipeline_summary(),
        }


@router.get("/agents")
async def get_pipeline_agents():
    """List all AI agents registered in the system."""
    from app.services.agents.router import AgentRouter

    router_instance = AgentRouter()
    return {
        "agents": router_instance.list_all_agents(),
        "total": router_instance.get_agent_count(),
    }


@router.get("/events")
async def get_pipeline_events():
    """List all events with their agent mappings and execution modes."""
    from app.services.agents.router import AgentRouter

    router_instance = AgentRouter()
    return {
        "events": router_instance.list_all_events(),
        "total": len(router_instance.list_all_events()),
    }


@router.post("/execute-event")
async def execute_event(
    event_type: str = Query(..., description="Event type to trigger"),
    tenant_id: str = Query(..., description="Tenant UUID"),
    lead_id: str = Query(None, description="Lead UUID"),
    db: AsyncSession = Depends(get_db),
):
    """
    Execute all agents registered for a specific event.
    
    Common events:
    - `whatsapp_inbound`: Process incoming WhatsApp message
    - `lead_created`: New lead entered the system
    - `deal_proposal_requested`: Generate a proposal
    - `management_report`: Generate management summary
    """
    from app.services.agents.executor import AgentExecutor

    executor = AgentExecutor(db)
    results = await executor.execute_event(
        event_type=event_type,
        input_data={"event_type": event_type},
        tenant_id=tenant_id,
        lead_id=lead_id,
    )
    await db.commit()

    return {
        "event_type": event_type,
        "agents_executed": len(results),
        "results": [r.to_dict() for r in results],
    }


@router.post("/run-agent/{agent_type}")
async def run_single_agent(
    agent_type: str,
    tenant_id: str = Query(...),
    lead_id: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Run a single AI agent directly.
    
    Available agents: closer_agent, lead_qualification, arabic_whatsapp,
    outreach_writer, meeting_booking, proposal_drafter, sector_strategist,
    compliance_reviewer, fraud_reviewer, management_summary, etc.
    """
    from app.services.agents.executor import AgentExecutor

    executor = AgentExecutor(db)
    result = await executor.execute(
        agent_type=agent_type,
        input_data={"agent_type": agent_type, "direct_invocation": True},
        tenant_id=tenant_id,
        lead_id=lead_id,
    )
    await db.commit()

    return result.to_dict()
