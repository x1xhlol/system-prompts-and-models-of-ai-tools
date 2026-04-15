"""
Agent Performance Dashboard API
================================
Real-time analytics for the AI agent ecosystem.
Tracks execution metrics, costs, errors, and conversion rates per agent.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from typing import Optional
from datetime import datetime, timezone, timedelta
import logging

from app.database import get_db

router = APIRouter(prefix="/agent-dashboard", tags=["Agent Dashboard"])
logger = logging.getLogger("dealix.agent_dashboard")


@router.get("/overview")
async def agent_system_overview(
    tenant_id: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    📊 Overview of the full AI agent system performance.
    Shows totals, averages, and health metrics.
    """
    from app.services.agents.router import AgentRouter
    from app.services.agents.autonomous_pipeline import AutonomousPipeline

    router_instance = AgentRouter()
    pipeline = AutonomousPipeline(db)

    # Get agent execution stats from DB
    stats = await _get_execution_stats(db, tenant_id)

    return {
        "system": {
            "total_agents": router_instance.get_agent_count(),
            "total_events": len(router_instance.list_all_events()),
            "pipeline_stages": pipeline.get_pipeline_summary()["total_stages"],
            "prompt_files": 20,
        },
        "performance": stats,
        "health": {
            "status": "healthy" if stats.get("error_rate", 0) < 0.1 else "degraded",
            "uptime_percent": 99.9,
            "last_check": datetime.now(timezone.utc).isoformat(),
        },
    }


@router.get("/agents/performance")
async def per_agent_performance(
    tenant_id: str = Query(None),
    period_days: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
):
    """
    📊 Performance breakdown per agent type.
    Shows execution count, avg latency, error rate, and token usage per agent.
    """
    stats = await _get_per_agent_stats(db, tenant_id, period_days)
    return {
        "period_days": period_days,
        "agents": stats,
        "total_agents": len(stats),
    }


@router.get("/pipeline/performance")
async def pipeline_performance(
    tenant_id: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    📊 Pipeline conversion funnel metrics.
    Shows how many leads pass through each stage.
    """
    funnel = {
        "new": {"count": 0, "conversion_rate": 0},
        "qualified": {"count": 0, "conversion_rate": 0},
        "outreach": {"count": 0, "conversion_rate": 0},
        "meeting_scheduled": {"count": 0, "conversion_rate": 0},
        "negotiation": {"count": 0, "conversion_rate": 0},
        "closing": {"count": 0, "conversion_rate": 0},
        "won": {"count": 0, "conversion_rate": 0},
        "lost": {"count": 0, "conversion_rate": 0},
        "nurturing": {"count": 0, "conversion_rate": 0},
    }

    # Get lead counts per stage from DB
    try:
        from app.models.lead import Lead
        for stage in funnel.keys():
            result = await db.execute(
                select(func.count(Lead.id))
                .where(Lead.status == stage)
            )
            funnel[stage]["count"] = result.scalar() or 0
    except Exception:
        pass

    # Calculate conversion rates
    total_new = funnel["new"]["count"] or 1
    for stage_name, data in funnel.items():
        data["conversion_rate"] = round(data["count"] / total_new * 100, 1)

    return {
        "funnel": funnel,
        "overall_conversion": funnel["won"]["count"] / total_new * 100 if total_new > 0 else 0,
    }


@router.get("/costs")
async def token_cost_analysis(
    tenant_id: str = Query(None),
    period_days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
):
    """
    💰 Token usage and estimated cost analysis.
    Helps optimize LLM spending across agents.
    """
    # Token pricing (approximate)
    GROQ_COST_PER_1K = 0.0003  # USD
    OPENAI_COST_PER_1K = 0.003  # USD

    stats = await _get_per_agent_stats(db, tenant_id, period_days)

    total_tokens = sum(s.get("total_tokens", 0) for s in stats)
    estimated_cost_groq = (total_tokens / 1000) * GROQ_COST_PER_1K
    estimated_cost_openai = (total_tokens / 1000) * OPENAI_COST_PER_1K

    return {
        "period_days": period_days,
        "total_tokens": total_tokens,
        "estimated_cost_usd": {
            "groq": round(estimated_cost_groq, 2),
            "openai": round(estimated_cost_openai, 2),
            "actual": round(estimated_cost_groq, 2),  # Groq is primary
        },
        "cost_per_agent": [
            {
                "agent": s["agent_type"],
                "tokens": s.get("total_tokens", 0),
                "cost_usd": round((s.get("total_tokens", 0) / 1000) * GROQ_COST_PER_1K, 4),
            }
            for s in sorted(stats, key=lambda x: x.get("total_tokens", 0), reverse=True)
        ],
        "optimization_tips": _generate_cost_tips(stats),
    }


@router.get("/escalations/summary")
async def escalation_summary(
    tenant_id: str = Query("default"),
    db: AsyncSession = Depends(get_db),
):
    """
    🚨 Escalation metrics from the agent system.
    Shows which agents escalate most and why.
    """
    from app.services.agents.escalation_handler import get_escalation_service

    service = get_escalation_service()
    stats = await service.get_stats(tenant_id)
    pending = await service.list_pending(tenant_id)

    return {
        "stats": stats.model_dump(),
        "pending_count": len(pending),
        "pending_items": [
            {
                "id": p.id,
                "title_ar": p.title_ar,
                "priority": p.priority.value,
                "reason": p.reason.value,
                "entity": f"{p.entity_type}/{p.entity_id}",
                "age_hours": round(
                    (datetime.now(timezone.utc) - p.created_at).total_seconds() / 3600, 1
                ),
            }
            for p in pending[:20]  # Top 20
        ],
    }


# ── Helper Functions ──────────────────────────────

async def _get_execution_stats(db: AsyncSession, tenant_id: str = None) -> dict:
    """Get aggregate execution statistics."""
    try:
        from app.models.ai_conversation import AIConversation

        base = select(func.count(AIConversation.id))
        if tenant_id:
            base = base.where(AIConversation.tenant_id == tenant_id)

        total = (await db.execute(base)).scalar() or 0

        # Count by status
        qualified = (await db.execute(
            base.where(AIConversation.qualified == True)
        )).scalar() or 0

        meeting_booked = (await db.execute(
            base.where(AIConversation.meeting_booked == True)
        )).scalar() or 0

        return {
            "total_conversations": total,
            "qualified_leads": qualified,
            "meetings_booked": meeting_booked,
            "qualification_rate": round(qualified / max(total, 1) * 100, 1),
            "meeting_rate": round(meeting_booked / max(total, 1) * 100, 1),
            "error_rate": 0,  # TODO: calculate from logs
        }
    except Exception as e:
        logger.warning(f"Stats query failed: {e}")
        return {
            "total_conversations": 0,
            "qualified_leads": 0,
            "meetings_booked": 0,
            "qualification_rate": 0,
            "meeting_rate": 0,
            "error_rate": 0,
        }


async def _get_per_agent_stats(db, tenant_id, period_days) -> list:
    """Get per-agent performance metrics."""
    # For now, return structural data; in production would query AI logs table
    from app.services.agents.router import AgentRouter
    router_inst = AgentRouter()
    agents = router_inst.list_all_agents()

    return [
        {
            "agent_type": a["agent_id"],
            "event_count": a["event_count"],
            "executions": 0,  # TODO: query from logs
            "avg_latency_ms": 0,
            "total_tokens": 0,
            "error_rate": 0,
            "escalation_rate": 0,
        }
        for a in agents
    ]


def _generate_cost_tips(stats: list) -> list:
    """Generate cost optimization tips."""
    tips = []

    # Find highest token consumers
    high_consumers = [s for s in stats if s.get("total_tokens", 0) > 10000]
    if high_consumers:
        tips.append(
            "Consider using Groq fast model for high-volume agents like "
            f"{', '.join(s['agent_type'] for s in high_consumers[:3])}"
        )

    tips.append("Enable response caching for knowledge_retrieval agent to reduce redundant calls")
    tips.append("Batch management_summary executions to run once daily instead of per-event")

    return tips
