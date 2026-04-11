"""
Hermes API -- Dealix AI Revenue OS -- واجهة هيرمس البرمجية
Orchestrator endpoints: execute tasks, manage profiles, view costs,
run security scans, approve improvements, and generate executive summaries.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.services.hermes_orchestrator import hermes_orchestrator, HermesProfile
from app.services.execution_router import execution_router, TaskClass
from app.services.shannon_security import shannon_security, ShannonScope
from app.services.self_improvement import self_improvement_engine
from app.services.observability import observability_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hermes", tags=["Hermes Orchestrator"])


# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------

class ExecuteRequest(BaseModel):
    profile_id: str = "founder"
    task: str
    params: Dict[str, Any] = Field(default_factory=dict)
    user_context: Dict[str, Any] = Field(default_factory=lambda: {
        "user_id": "api_user", "tenant_id": "default", "role": "owner",
    })


class ExecuteResponse(BaseModel):
    run_id: str
    profile_id: str
    task: str
    status: str
    backend: str = ""
    data: Dict[str, Any] = {}
    evidence: List[str] = []
    receipt_id: Optional[str] = None
    cost_usd: float = 0.0
    duration_ms: int = 0
    error: Optional[str] = None
    message_ar: str = ""


class ScanRequest(BaseModel):
    environment: str = "staging"
    scopes: List[str] = Field(
        default_factory=lambda: ["auth", "injection", "pdpl"],
    )
    base_url: str = "https://staging.dealix.sa"


class ApproveRequest(BaseModel):
    user_id: str = "founder"


# ---------------------------------------------------------------------------
# Execute
# ---------------------------------------------------------------------------

@router.post("/execute", response_model=ExecuteResponse)
async def execute_task(req: ExecuteRequest) -> ExecuteResponse:
    """Execute a task via the Hermes orchestrator."""
    result = await hermes_orchestrator.execute(
        profile_id=req.profile_id,
        task=req.task,
        params=req.params,
        user_context=req.user_context,
    )
    return ExecuteResponse(**result.model_dump())


# ---------------------------------------------------------------------------
# Profiles
# ---------------------------------------------------------------------------

@router.get("/profiles")
async def list_profiles() -> JSONResponse:
    """List all available Hermes profiles."""
    profiles = await hermes_orchestrator.list_profiles()
    return JSONResponse(content={
        "profiles": [p.model_dump() for p in profiles],
        "count": len(profiles),
        "message_ar": f"{len(profiles)} ملفات شخصية متاحة",
    })


@router.get("/profiles/{profile_id}")
async def get_profile(profile_id: str) -> JSONResponse:
    """Get details for a specific profile."""
    profile = await hermes_orchestrator.get_profile(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail=f"الملف الشخصي غير موجود: {profile_id}")
    return JSONResponse(content=profile.model_dump())


# ---------------------------------------------------------------------------
# Cost
# ---------------------------------------------------------------------------

@router.get("/cost")
async def cost_report(period: str = "daily") -> JSONResponse:
    """Get cost report from the orchestrator and observability service."""
    hermes_cost = await hermes_orchestrator.get_cost_report(period)
    obs_cost = await observability_service.get_cost_report(period)
    return JSONResponse(content={
        "hermes": hermes_cost,
        "observability": obs_cost,
    })


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@router.get("/health")
async def health_report() -> JSONResponse:
    """System health report across all backends and workflows."""
    obs_health = await observability_service.get_health_report()
    backend_health = await execution_router.get_backend_health()
    anomalies = await observability_service.detect_anomalies()
    return JSONResponse(content={
        "system": obs_health,
        "backends": {k: v.model_dump() for k, v in backend_health.items()},
        "anomalies": [a.model_dump(mode="json") for a in anomalies],
        "anomaly_count": len(anomalies),
    })


# ---------------------------------------------------------------------------
# Runs
# ---------------------------------------------------------------------------

@router.get("/runs")
async def list_active_runs() -> JSONResponse:
    """List currently active runs."""
    runs = await hermes_orchestrator.get_active_runs()
    return JSONResponse(content={
        "active_runs": [r.model_dump(mode="json") for r in runs],
        "count": len(runs),
        "message_ar": f"{len(runs)} عمليات نشطة حالياً",
    })


@router.post("/runs/{run_id}/abort")
async def abort_run(run_id: str) -> JSONResponse:
    """Abort an active run."""
    success = await hermes_orchestrator.abort_run(run_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"التشغيل غير موجود أو اكتمل بالفعل: {run_id}")
    return JSONResponse(content={
        "run_id": run_id,
        "status": "aborted",
        "message_ar": f"تم إلغاء التشغيل: {run_id}",
    })


# ---------------------------------------------------------------------------
# Self-improvement
# ---------------------------------------------------------------------------

@router.get("/improvements")
async def list_improvements(status: Optional[str] = None) -> JSONResponse:
    """List self-improvement proposals."""
    proposals = self_improvement_engine.list_proposals(status)
    report = await self_improvement_engine.report()
    return JSONResponse(content={
        "proposals": [p.model_dump(mode="json") for p in proposals],
        "count": len(proposals),
        "summary": report,
    })


@router.post("/improvements/{proposal_id}/approve")
async def approve_improvement(proposal_id: str, req: ApproveRequest) -> JSONResponse:
    """Approve a self-improvement proposal."""
    proposal = await self_improvement_engine.approve(proposal_id, req.user_id)
    if not proposal:
        raise HTTPException(
            status_code=404,
            detail=f"المقترح غير موجود أو ليس في حالة 'مقترح': {proposal_id}",
        )
    return JSONResponse(content={
        "proposal_id": proposal.id,
        "status": proposal.status,
        "approved_by": proposal.approved_by,
        "message_ar": f"تمت الموافقة على المقترح: {proposal.title_ar}",
    })


@router.post("/improvements/cycle")
async def run_improvement_cycle(tenant_id: Optional[str] = None) -> JSONResponse:
    """Trigger a self-improvement cycle."""
    cycle = await self_improvement_engine.run_cycle(tenant_id)
    return JSONResponse(content=cycle.model_dump(mode="json"))


# ---------------------------------------------------------------------------
# Shannon security
# ---------------------------------------------------------------------------

@router.get("/security/report")
async def latest_security_report() -> JSONResponse:
    """Get the latest Shannon security scan report."""
    report = shannon_security.get_latest_report()
    if not report:
        return JSONResponse(content={
            "report": None,
            "message_ar": "لا يوجد تقرير أمني بعد. قم بتشغيل فحص أولاً.",
        })
    return JSONResponse(content=report.model_dump(mode="json"))


@router.post("/security/scan")
async def trigger_security_scan(req: ScanRequest) -> JSONResponse:
    """Trigger a Shannon security scan (staging only)."""
    scopes = []
    for s in req.scopes:
        try:
            scopes.append(ShannonScope(s))
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"نطاق غير صالح: {s}. المتاحة: {[x.value for x in ShannonScope]}",
            )

    report = await shannon_security.run_scan(
        environment=req.environment,
        scopes=scopes,
        base_url=req.base_url,
    )
    return JSONResponse(content=report.model_dump(mode="json"))


# ---------------------------------------------------------------------------
# Executive summary
# ---------------------------------------------------------------------------

@router.get("/executive-summary")
async def executive_summary(period: str = "weekly") -> JSONResponse:
    """Arabic executive summary for leadership."""
    summary = await observability_service.get_executive_summary(period)
    improvement_report = await self_improvement_engine.report()
    security_report = shannon_security.get_latest_report()

    full_summary = summary
    if improvement_report.get("total_proposals", 0) > 0:
        applied = improvement_report.get("by_status", {}).get("applied", 0)
        pending = improvement_report.get("by_status", {}).get("proposed", 0)
        full_summary += f"، {applied} تحسين مطبق، {pending} تحسين معلق"

    if security_report:
        full_summary += (
            f"، آخر فحص أمني: {security_report.critical_count} حرجة، "
            f"{security_report.high_count} عالية"
        )
    else:
        full_summary += "، لا يوجد فحص أمني بعد"

    return JSONResponse(content={
        "summary_ar": full_summary,
        "period": period,
        "improvements": improvement_report,
        "security_status": security_report.model_dump(mode="json") if security_report else None,
    })


# ---------------------------------------------------------------------------
# Routing stats
# ---------------------------------------------------------------------------

@router.get("/routing-stats")
async def routing_stats() -> JSONResponse:
    """Execution routing statistics."""
    stats = await execution_router.get_routing_stats()
    return JSONResponse(content=stats)
