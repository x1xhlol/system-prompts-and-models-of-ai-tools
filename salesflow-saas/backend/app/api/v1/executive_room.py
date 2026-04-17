"""Executive Room API — unified executive decision surface."""

from fastapi import APIRouter
from typing import Any, Dict

from app.services.core_os.tier1_demo_bundle import build_exec_weekly_governance_contract_from_demo_bundle

router = APIRouter(prefix="/executive-room", tags=["Executive Room"])


@router.get("/snapshot")
async def executive_snapshot() -> Dict[str, Any]:
    """Full executive room snapshot."""
    exec_weekly = build_exec_weekly_governance_contract_from_demo_bundle()
    return {
        "revenue": {
            "actual": 0,
            "forecast": 0,
            "variance_percent": 0.0,
            "pipeline_value": 0,
            "win_rate": 0.0,
        },
        "approvals": {
            "pending": 0,
            "warning": 0,
            "breach": 0,
        },
        "connectors": {
            "healthy": 0,
            "degraded": 0,
            "error": 0,
        },
        "compliance": {
            "compliant": 0,
            "partial": 0,
            "non_compliant": 0,
            "posture": "unknown",
        },
        "contradictions": {
            "active": 0,
            "critical": 0,
        },
        "strategic_deals": {
            "active": 0,
            "pipeline_value": 0,
        },
        "evidence_packs": {
            "ready": 0,
            "pending_review": 0,
        },
        "tier1_exec_surface": exec_weekly.model_dump(mode="json"),
    }


@router.get("/risks")
async def executive_risks() -> Dict[str, Any]:
    """Risk summary for executives."""
    return {"risks": [], "total": 0}


@router.get("/decisions-pending")
async def pending_decisions() -> Dict[str, Any]:
    """Decisions requiring executive attention."""
    return {"decisions": [], "total": 0}


@router.get("/forecast-vs-actual")
async def forecast_vs_actual() -> Dict[str, Any]:
    """Forecast vs actual comparison."""
    return {"tracks": {}, "overall_health": "unknown"}
