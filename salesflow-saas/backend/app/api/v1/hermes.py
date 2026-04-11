"""
Hermes API — Dealix AI Revenue OS
Top-level orchestration, profiles, cost, health, improvements, security.
"""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/hermes", tags=["hermes"])


class ExecuteRequest(BaseModel):
    profile_id: str
    task: str
    params: dict = {}


class ApproveRequest(BaseModel):
    approved_by: str


class ScanRequest(BaseModel):
    environment: str
    base_url: str
    scopes: list[str] = []


# ── Execute ────────────────────────────────────────


@router.post("/execute")
async def execute_task(req: ExecuteRequest):
    from app.services.hermes_orchestrator import hermes
    try:
        result = await hermes.execute(
            profile_id=req.profile_id,
            task=req.task,
            params=req.params,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


# ── Profiles ───────────────────────────────────────


@router.get("/profiles")
async def list_profiles():
    from app.services.hermes_orchestrator import hermes
    profiles = hermes.list_profiles()
    return {"profiles": [p.model_dump() if hasattr(p, 'model_dump') else p.__dict__ for p in profiles]}


@router.get("/profiles/{profile_id}")
async def get_profile(profile_id: str):
    from app.services.hermes_orchestrator import hermes
    profile = hermes.get_profile(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="الملف الشخصي غير موجود")
    return profile.model_dump() if hasattr(profile, 'model_dump') else profile.__dict__


# ── Cost & Health ──────────────────────────────────


@router.get("/cost")
async def cost_report(period: str = "daily", profile: Optional[str] = None):
    from app.services.observability import observability
    return await observability.get_cost_report(period, profile)


@router.get("/health")
async def health_report():
    from app.services.observability import observability
    return await observability.get_health_report()


@router.get("/performance")
async def performance_report(period: str = "daily"):
    from app.services.observability import observability
    return await observability.get_performance_report(period)


@router.get("/anomalies")
async def detect_anomalies():
    from app.services.observability import observability
    return {"anomalies": await observability.detect_anomalies()}


@router.get("/executive-summary")
async def executive_summary(period: str = "weekly"):
    from app.services.observability import observability
    summary = await observability.get_executive_summary(period)
    return {"summary": summary}


# ── Runs ───────────────────────────────────────────


@router.get("/runs")
async def list_active_runs():
    from app.services.hermes_orchestrator import hermes
    return {"runs": hermes.get_active_runs()}


@router.post("/runs/{run_id}/abort")
async def abort_run(run_id: str):
    from app.services.hermes_orchestrator import hermes
    success = hermes.abort_run(run_id)
    if not success:
        raise HTTPException(status_code=404, detail="التشغيل غير موجود")
    return {"status": "aborted", "run_id": run_id}


# ── Self-Improvement ──────────────────────────────


@router.get("/improvements")
async def list_improvements(status_filter: Optional[str] = None):
    from app.services.self_improvement import self_improvement, ImprovementStatus
    if status_filter:
        try:
            s = ImprovementStatus(status_filter)
        except ValueError:
            raise HTTPException(status_code=400, detail="حالة غير صالحة")
        proposals = await self_improvement.get_proposals(s)
    else:
        proposals = await self_improvement.get_proposals()
    return {"proposals": [p.model_dump() for p in proposals]}


@router.post("/improvements/cycle")
async def run_improvement_cycle():
    from app.services.self_improvement import self_improvement
    result = await self_improvement.run_cycle()
    return result.model_dump()


@router.post("/improvements/{proposal_id}/approve")
async def approve_improvement(proposal_id: str, req: ApproveRequest):
    from app.services.self_improvement import self_improvement
    success = await self_improvement.apply(proposal_id, req.approved_by)
    if not success:
        raise HTTPException(status_code=404, detail="المقترح غير موجود أو يحتاج موافقة")
    return {"status": "approved", "proposal_id": proposal_id}


@router.post("/improvements/{proposal_id}/reject")
async def reject_improvement(proposal_id: str):
    from app.services.self_improvement import self_improvement
    success = await self_improvement.reject(proposal_id)
    if not success:
        raise HTTPException(status_code=404, detail="المقترح غير موجود")
    return {"status": "rejected", "proposal_id": proposal_id}


# ── Security (Shannon) ────────────────────────────


@router.get("/security/report")
async def security_report(severity: Optional[str] = None):
    from app.services.shannon_security import shannon
    findings = shannon.get_all_findings(severity)
    should_block = await shannon.should_block_release()
    return {
        "findings": [f.model_dump() for f in findings],
        "total": len(findings),
        "should_block_release": should_block,
    }


@router.post("/security/scan")
async def trigger_security_scan(req: ScanRequest):
    from app.services.shannon_security import shannon, ShannonScope
    try:
        scopes = [ShannonScope(s) for s in req.scopes] if req.scopes else None
        report = await shannon.run_scan(
            environment=req.environment,
            base_url=req.base_url,
            scopes=scopes,
        )
        return report.model_dump()
    except PermissionError as e:
        raise HTTPException(
            status_code=403,
            detail=f"محظور: {str(e)}"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Session Continuity ────────────────────────────


@router.get("/session/restore")
async def restore_session():
    from app.services.session_continuity import session_continuity
    prompt = await session_continuity.get_restore_prompt()
    return {"restore_prompt": prompt}


@router.get("/session/state")
async def get_session_state():
    from app.services.session_continuity import session_continuity
    state = await session_continuity.restore_state()
    if not state:
        return {"state": None}
    return {"state": state.model_dump() if hasattr(state, 'model_dump') else state.__dict__}
