"""
Dealix Full API: Lead Pipeline + Autonomous Core + Intelligence Reports
"""
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import Optional
import os

router = APIRouter(prefix="/intelligence", tags=["🧠 Intelligence"])


def _groq_key():
    key = os.getenv("GROQ_API_KEY", "")
    if not key:
        raise HTTPException(500, "GROQ_API_KEY missing")
    return key


# ── Lead Pipeline ─────────────────────────────────────────────
class LeadInput(BaseModel):
    id: str = "lead_001"
    contact_name: str
    contact_phone: str
    contact_title: Optional[str] = None
    company_name: str
    company_website: Optional[str] = None
    source: str = "whatsapp"


class MeetingReport(BaseModel):
    lead_id: str
    contact_name: str
    company_name: str
    contact_phone: str
    meeting_notes: str
    outcome: str = "follow_up_needed"


@router.post("/run-pipeline")
async def run_lead_pipeline(lead_input: LeadInput):
    """🎯 Complete Lead-to-Meeting pipeline in one API call."""
    from app.services.lead_pipeline import DealixLeadPipeline, Lead, Company

    pipeline = DealixLeadPipeline(_groq_key())
    lead = Lead(
        id=lead_input.id,
        contact_name=lead_input.contact_name,
        contact_phone=lead_input.contact_phone,
        contact_title=lead_input.contact_title,
        company=Company(
            name=lead_input.company_name,
            website=lead_input.company_website
        ),
        source=lead_input.source
    )
    return await pipeline.run_full_pipeline(lead)


@router.post("/executive-report")
async def generate_executive_report(report_data: MeetingReport):
    """📋 Generate post-meeting executive report with company analysis."""
    from app.services.lead_pipeline import DealixLeadPipeline, Lead, Company

    pipeline = DealixLeadPipeline(_groq_key())
    lead = Lead(
        id=report_data.lead_id,
        contact_name=report_data.contact_name,
        contact_phone=report_data.contact_phone,
        company=Company(name=report_data.company_name)
    )
    return await pipeline.generate_executive_report(
        lead, report_data.meeting_notes, report_data.outcome
    )


# ── Autonomous Intelligence ───────────────────────────────────
@router.get("/system-report")
async def get_system_intelligence_report():
    """🔮 Full autonomous intelligence + financial + strategic report."""
    from app.services.autonomous_core import get_autonomous_core
    core = get_autonomous_core(_groq_key())
    return await core.get_full_intelligence_report()


@router.post("/improve")
async def trigger_self_improvement(background_tasks: BackgroundTasks):
    """⚡ Trigger autonomous self-improvement cycle."""
    from app.services.autonomous_core import get_autonomous_core
    core = get_autonomous_core(_groq_key())

    async def run_improvement():
        await core.improver.analyze_and_improve({"triggered": "manual"})

    background_tasks.add_task(run_improvement)
    return {"status": "improvement_cycle_started", "message": "النظام يحلل نفسه ويتحسن..."}


@router.get("/financial-forecast")
async def get_financial_forecast():
    """💰 AI-powered financial forecast and pipeline valuation."""
    from app.services.autonomous_core import get_autonomous_core
    core = get_autonomous_core(_groq_key())
    return await core.financial.generate_financial_forecast({
        "timestamp": "now",
        "pipeline": "active"
    })


@router.get("/market-expansion")
async def get_expansion_opportunities():
    """🌍 Strategic market expansion opportunities for Saudi Arabia."""
    from app.services.autonomous_core import get_autonomous_core
    core = get_autonomous_core(_groq_key())
    return await core.strategic.analyze_market_opportunity({
        "market": "Saudi Arabia",
        "current_sectors": ["عقارات", "تقنية", "صحة"]
    })


@router.get("/growth-plan")
async def get_90_day_growth_plan():
    """📈 Autonomous 90-day growth plan generation."""
    from app.services.autonomous_core import get_autonomous_core
    core = get_autonomous_core(_groq_key())
    return await core.strategic.generate_growth_plan({
        "current_stage": "early_growth",
        "market": "KSA"
    })


@router.get("/health")
async def system_health():
    """❤️ System health and auto-healing status."""
    from app.services.autonomous_core import get_autonomous_core
    core = get_autonomous_core(_groq_key())
    return {
        "health": core.healer.get_system_health(),
        "autonomous_cycle": core._cycle_count,
        "improvements_applied": len(core.improver.improvements_log),
        "status": "AUTONOMOUS_RUNNING — لا يتوقف أبداً"
    }
