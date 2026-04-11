"""
Analytics & AI API Routes — ROI tracking, trust scores, AI orchestration.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db

router = APIRouter()


# ── Analytics ─────────────────────────────────────

@router.get("/analytics/summary")
async def analytics_summary(
    tenant_id: str = Query(...),
    days: int = Query(30),
    db: AsyncSession = Depends(get_db),
):
    """KPI summary: leads, deals, revenue, conversion rates."""
    from app.services.analytics_service import AnalyticsService
    svc = AnalyticsService(db)
    return await svc.get_kpi_summary(tenant_id, days)


@router.get("/analytics/funnel")
async def analytics_funnel(
    tenant_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Conversion funnel: Lead → Contacted → Qualified → Converted."""
    from app.services.analytics_service import AnalyticsService
    svc = AnalyticsService(db)
    return await svc.get_conversion_funnel(tenant_id)


@router.get("/analytics/channels")
async def analytics_channels(
    tenant_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Channel performance comparison."""
    from app.services.analytics_service import AnalyticsService
    svc = AnalyticsService(db)
    return await svc.get_channel_performance(tenant_id)


@router.get("/analytics/sectors")
async def analytics_sectors(
    tenant_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Sector performance breakdown."""
    from app.services.analytics_service import AnalyticsService
    svc = AnalyticsService(db)
    return await svc.get_sector_performance(tenant_id)


@router.get("/analytics/agents")
async def analytics_agents(
    tenant_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Agent performance metrics."""
    from app.services.analytics_service import AnalyticsService
    svc = AnalyticsService(db)
    return await svc.get_agent_performance(tenant_id)


@router.get("/analytics/trends")
async def analytics_trends(
    tenant_id: str = Query(...),
    days: int = Query(90),
    db: AsyncSession = Depends(get_db),
):
    """Time-series trends."""
    from app.services.analytics_service import AnalyticsService
    svc = AnalyticsService(db)
    return await svc.get_trends(tenant_id, days)


# ── Trust Scores ──────────────────────────────────

@router.post("/trust-scores/lead/{lead_id}")
async def score_lead(
    lead_id: str,
    tenant_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Calculate trust score for a lead."""
    from app.services.trust_score_service import TrustScoreService
    svc = TrustScoreService(db)
    return await svc.calculate_lead_score(tenant_id, lead_id)


@router.post("/trust-scores/affiliate/{affiliate_id}")
async def score_affiliate(
    affiliate_id: str,
    tenant_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Calculate trust score for an affiliate."""
    from app.services.trust_score_service import TrustScoreService
    svc = TrustScoreService(db)
    return await svc.calculate_affiliate_score(tenant_id, affiliate_id)


@router.post("/trust-scores/batch")
async def score_all(
    tenant_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Batch score all unscored leads."""
    from app.services.trust_score_service import TrustScoreService
    svc = TrustScoreService(db)
    return await svc.score_all_leads(tenant_id)


# ── AI Orchestration ──────────────────────────────

@router.post("/orchestrator/process-lead/{lead_id}")
async def orchestrate_lead(
    lead_id: str,
    tenant_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Process a new lead through the full AI pipeline."""
    from app.ai.orchestrator import Orchestrator
    orch = Orchestrator(db)
    return await orch.process_new_lead(tenant_id, lead_id)


@router.post("/orchestrator/handle-message")
async def handle_message(
    tenant_id: str = Query(...),
    lead_id: str = Query(...),
    message: str = Query(...),
    channel: str = Query("whatsapp"),
    language: str = Query("ar"),
    db: AsyncSession = Depends(get_db),
):
    """Process an inbound message through AI agents."""
    from app.ai.orchestrator import Orchestrator
    orch = Orchestrator(db)
    return await orch.handle_inbound_message(
        tenant_id, lead_id, message, channel, language
    )


@router.post("/orchestrator/prepare-meeting/{meeting_id}")
async def prepare_meeting(
    meeting_id: str,
    tenant_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Generate AI meeting preparation package."""
    from app.ai.orchestrator import Orchestrator
    orch = Orchestrator(db)
    return await orch.prepare_meeting(tenant_id, meeting_id)


@router.post("/orchestrator/daily")
async def run_daily(
    tenant_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Run daily automation tasks."""
    from app.ai.orchestrator import Orchestrator
    orch = Orchestrator(db)
    return await orch.run_daily_automation(tenant_id)


@router.get("/orchestrator/states")
async def get_states():
    """Get the lead lifecycle state machine."""
    from app.ai.orchestrator import Orchestrator
    return Orchestrator.__init__  # Will return states without DB
    # Simplified response
    return {
        "states": {
            "new": {"next_states": ["contacted", "lost"], "auto_agent": "lead_qualification"},
            "contacted": {"next_states": ["qualified", "lost"], "auto_agent": "outreach_writer"},
            "qualified": {"next_states": ["converted", "contacted", "lost"], "auto_agent": "meeting_booking"},
            "converted": {"next_states": [], "auto_agent": None},
            "lost": {"next_states": ["new"], "auto_agent": None},
        }
    }


@router.get("/orchestrator/events")
async def get_events():
    """List all supported event types."""
    from app.ai.agent_router import EVENT_AGENT_MAP
    return {
        "events": [
            {"type": k, "agents": v}
            for k, v in EVENT_AGENT_MAP.items()
        ]
    }


# ── AI Agent Direct Invocation ────────────────────

@router.get("/ai/agents")
async def list_ai_agents():
    """List all 18 available AI agents."""
    from app.ai.agent_executor import AgentExecutor
    executor = AgentExecutor()
    return {"agents": executor.get_available_agents()}


@router.get("/ai/usage")
async def ai_usage():
    """Get AI token usage stats."""
    from app.ai.llm_provider import LLMProvider
    llm = LLMProvider()
    return llm.get_usage_stats()
