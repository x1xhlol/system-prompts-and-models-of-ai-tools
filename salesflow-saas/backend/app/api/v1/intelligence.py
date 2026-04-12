"""
Intelligence API — Signals, alerts, behaviour patterns, recommendations,
escalations.  Wires signal_intelligence, alert_delivery and
behavior_intelligence services into FastAPI endpoints.
"""
from __future__ import annotations

import logging, uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query
from pydantic import BaseModel, Field

from app.services.signal_intelligence import (
    SignalSource, SignalFilter, Watchlist, get_signal_intelligence,
)
from app.services.alert_delivery import AlertUrgency, get_alert_delivery
from app.services.behavior_intelligence import get_behavior_intelligence

logger = logging.getLogger("dealix.api.intelligence")
router = APIRouter(prefix="/intelligence", tags=["Intelligence"])


# ── Request / Response schemas ──────────────────────────────────────────

class IngestRequest(BaseModel):
    source: SignalSource
    payload: dict
    tenant_id: str

class WatchlistCreate(BaseModel):
    tenant_id: str
    name: str
    name_ar: str
    entity_type: str
    entity_ids: List[str] = []
    keywords: List[str] = []
    alert_threshold: float = 0.5
    channels: List[str] = Field(default=["dashboard"])

class AckRequest(BaseModel):
    user_id: str

class EscalationResolve(BaseModel):
    user_id: str
    resolution: str
    resolution_ar: str = ""

class _Escalation(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    tenant_id: str
    title: str
    title_ar: str
    reason: str
    reason_ar: str
    entity_type: str = ""
    entity_id: str = ""
    assigned_to: Optional[str] = None
    status: str = "open"
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolution: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

_escalations: dict[str, list[_Escalation]] = {}


# ── Signals ─────────────────────────────────────────────────────────────

@router.post("/signals/ingest", summary="Ingest a raw signal event")
async def ingest_signal(req: IngestRequest):
    event = await get_signal_intelligence().ingest(req.source, req.payload, req.tenant_id)
    return event.model_dump()

@router.get("/signals", summary="List recent signals with filters")
async def list_signals(tenant_id: str, source: Optional[SignalSource] = None,
                       entity_type: Optional[str] = None, entity_id: Optional[str] = None,
                       min_importance: float = 0.0, sentiment: Optional[str] = None,
                       limit: int = Query(default=50, le=200)):
    f = SignalFilter(source=source, entity_type=entity_type, entity_id=entity_id,
                     min_importance=min_importance, sentiment=sentiment, limit=limit)
    events = await get_signal_intelligence().get_signals(tenant_id, f)
    return {"count": len(events), "signals": [e.model_dump() for e in events]}

@router.get("/signals/{entity_type}/{entity_id}", summary="Entity signal summary")
async def entity_signal_summary(entity_type: str, entity_id: str, tenant_id: str,
                                 hours: int = Query(default=24, le=720)):
    return await get_signal_intelligence().get_entity_summary(entity_type, entity_id, tenant_id, hours)


# ── Watchlists ──────────────────────────────────────────────────────────

@router.post("/watchlists", summary="Create a signal watchlist")
async def create_watchlist(body: WatchlistCreate):
    wl = Watchlist(tenant_id=body.tenant_id, name=body.name, name_ar=body.name_ar,
                   entity_type=body.entity_type, entity_ids=body.entity_ids,
                   keywords=body.keywords, alert_threshold=body.alert_threshold, channels=body.channels)
    return (await get_signal_intelligence().create_watchlist(wl)).model_dump()

@router.get("/watchlists", summary="List active watchlists")
async def list_watchlists(tenant_id: str):
    items = await get_signal_intelligence().get_watchlists(tenant_id)
    return {"count": len(items), "watchlists": [w.model_dump() for w in items]}


# ── Alerts ──────────────────────────────────────────────────────────────

@router.get("/alerts", summary="Pending alerts for a user")
async def pending_alerts(tenant_id: str, user_id: Optional[str] = None):
    alerts = await get_alert_delivery().get_pending(tenant_id, user_id)
    return {"count": len(alerts), "alerts": [a.model_dump() for a in alerts]}

@router.post("/alerts/{alert_id}/acknowledge", summary="Acknowledge an alert")
async def acknowledge_alert(alert_id: str, body: AckRequest):
    if not await get_alert_delivery().acknowledge(alert_id, body.user_id):
        raise HTTPException(404, "التنبيه غير موجود")
    return {"acknowledged": True, "alert_id": alert_id}

@router.get("/alerts/stats", summary="Alert delivery statistics")
async def alert_stats(tenant_id: str):
    return await get_alert_delivery().get_delivery_stats(tenant_id)


# ── Digest ──────────────────────────────────────────────────────────────

@router.get("/digest", summary="Generate Arabic alert digest")
async def generate_digest(tenant_id: str, user_id: Optional[str] = None,
                           period: str = Query(default="daily", pattern="^(daily|weekly)$")):
    return await get_alert_delivery().generate_digest(tenant_id, user_id, period)


# ── Behavior Patterns ──────────────────────────────────────────────────

@router.get("/patterns", summary="Detected behaviour patterns")
async def detected_patterns(tenant_id: str):
    bi = get_behavior_intelligence()
    rep = await bi.analyze_rep_performance(tenant_id)
    seq = await bi.analyze_winning_sequences(tenant_id)
    risk = await bi.detect_at_risk_patterns(tenant_id)
    timing = await bi.analyze_best_contact_times(tenant_id)
    all_p = [p.model_dump() for p in rep + seq + risk]
    return {"count": len(all_p), "patterns": all_p, "best_contact_times": timing}

@router.get("/recommendations", summary="AI recommendations in Arabic")
async def recommendations(tenant_id: str):
    recs = await get_behavior_intelligence().get_recommendations(tenant_id)
    return {"count": len(recs), "recommendations": recs}


# ── Escalations ────────────────────────────────────────────────────────

@router.get("/escalations", summary="Pending escalations")
async def pending_escalations(tenant_id: str):
    items = [e for e in _escalations.get(tenant_id, []) if e.status == "open"]
    return {"count": len(items), "escalations": [e.model_dump() for e in items]}

@router.post("/escalations/{escalation_id}/resolve", summary="Resolve an escalation")
async def resolve_escalation(escalation_id: str, body: EscalationResolve):
    for lst in _escalations.values():
        for esc in lst:
            if esc.id == escalation_id:
                if esc.status == "resolved":
                    return {"already_resolved": True, "id": escalation_id}
                esc.status = "resolved"
                esc.resolved_by = body.user_id
                esc.resolved_at = datetime.now(timezone.utc)
                esc.resolution = body.resolution or body.resolution_ar
                return {"resolved": True, "id": escalation_id}
    raise HTTPException(404, "التصعيد غير موجود")


async def create_escalation(tenant_id: str, title: str, title_ar: str,
                             reason: str, reason_ar: str, entity_type: str = "",
                             entity_id: str = "", assigned_to: Optional[str] = None) -> dict:
    """Internal helper — creates an escalation and fires a HIGH alert."""
    esc = _Escalation(tenant_id=tenant_id, title=title, title_ar=title_ar,
                      reason=reason, reason_ar=reason_ar, entity_type=entity_type,
                      entity_id=entity_id, assigned_to=assigned_to)
    _escalations.setdefault(tenant_id, []).insert(0, esc)
    await get_alert_delivery().send_from_template(
        "escalation", tenant_id, AlertUrgency.HIGH, category="compliance",
        user_id=assigned_to, requires_ack=True, title=title_ar, reason=reason_ar)
    logger.info("Escalation created: %s for tenant %s", esc.id[:8], tenant_id[:8])
    return esc.model_dump()


# ── Legacy endpoints (backward compat) ─────────────────────────────────

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

def _groq_key():
    import os
    key = os.getenv("GROQ_API_KEY", "")
    if not key: raise HTTPException(500, "GROQ_API_KEY missing")
    return key

@router.post("/run-pipeline")
async def run_lead_pipeline(lead_input: LeadInput):
    from app.services.lead_pipeline import DealixLeadPipeline, Lead, Company
    p = DealixLeadPipeline(_groq_key())
    lead = Lead(id=lead_input.id, contact_name=lead_input.contact_name,
                contact_phone=lead_input.contact_phone, contact_title=lead_input.contact_title,
                company=Company(name=lead_input.company_name, website=lead_input.company_website),
                source=lead_input.source)
    return await p.run_full_pipeline(lead)

@router.post("/executive-report")
async def generate_executive_report(r: MeetingReport):
    from app.services.lead_pipeline import DealixLeadPipeline, Lead, Company
    p = DealixLeadPipeline(_groq_key())
    lead = Lead(id=r.lead_id, contact_name=r.contact_name, contact_phone=r.contact_phone,
                company=Company(name=r.company_name))
    return await p.generate_executive_report(lead, r.meeting_notes, r.outcome)

@router.get("/system-report")
async def get_system_intelligence_report():
    from app.services.autonomous_core import get_autonomous_core
    return await get_autonomous_core(_groq_key()).get_full_intelligence_report()

@router.post("/improve")
async def trigger_self_improvement(background_tasks: BackgroundTasks):
    from app.services.autonomous_core import get_autonomous_core
    core = get_autonomous_core(_groq_key())
    background_tasks.add_task(core.improver.analyze_and_improve, {"triggered": "manual"})
    return {"status": "improvement_cycle_started", "message": "النظام يحلل نفسه ويتحسن..."}

@router.get("/financial-forecast")
async def get_financial_forecast():
    from app.services.autonomous_core import get_autonomous_core
    return await get_autonomous_core(_groq_key()).financial.generate_financial_forecast(
        {"timestamp": "now", "pipeline": "active"})

@router.get("/market-expansion")
async def get_expansion_opportunities():
    from app.services.autonomous_core import get_autonomous_core
    return await get_autonomous_core(_groq_key()).strategic.analyze_market_opportunity(
        {"market": "Saudi Arabia", "current_sectors": ["عقارات", "تقنية", "صحة"]})

@router.get("/growth-plan")
async def get_90_day_growth_plan():
    from app.services.autonomous_core import get_autonomous_core
    return await get_autonomous_core(_groq_key()).strategic.generate_growth_plan(
        {"current_stage": "early_growth", "market": "KSA"})

@router.get("/health")
async def system_health():
    from app.services.autonomous_core import get_autonomous_core
    c = get_autonomous_core(_groq_key())
    return {"health": c.healer.get_system_health(), "autonomous_cycle": c._cycle_count,
            "improvements_applied": len(c.improver.improvements_log), "status": "AUTONOMOUS_RUNNING"}
