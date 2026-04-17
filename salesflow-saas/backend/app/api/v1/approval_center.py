"""Approval Center API — enhanced approval queue with SLA tracking."""

from typing import Any, Dict, Literal, Optional

from fastapi import APIRouter, Body
from pydantic import BaseModel as PydanticBase

from app.api.governance_http import http_validate_class_b_bundle
from app.services.core_os.tier1_demo_bundle import build_class_b_demo_bundle

router = APIRouter(prefix="/approval-center", tags=["Approval Center"])


class ApprovalAction(PydanticBase):
    """HITL action per execution-fabric taxonomy (approve / edit / reject)."""

    note: Optional[str] = None
    hitl: Optional[Literal["approve", "edit", "reject"]] = None
    decision_bundle: Optional[Dict[str, Any]] = None


@router.get("/class-b-decision-bundle")
async def class_b_decision_bundle_demo() -> Dict[str, Any]:
    """
    Tier-1 Class B pilot: returns a fully validated decision bundle (demo data).
    Used by executive surfaces and contract tests — replace payload with real DB rows later.
    """
    return build_class_b_demo_bundle()


@router.post("/validate-class-b-bundle")
async def validate_class_b_bundle_endpoint(
    body: Dict[str, Any] = Body(..., description="Full Class B bundle JSON"),
) -> Dict[str, Any]:
    """Runtime gate: 422 if bundle violates Class B + correlation rules."""
    http_validate_class_b_bundle(body)
    ei = body.get("execution_intent_json") or {}
    return {"status": "valid", "correlation_id": ei.get("correlation_id")}


@router.get("/")
async def list_approvals(
    category: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = "pending",
) -> Dict[str, Any]:
    """List pending approvals with SLA status."""
    return {"approvals": [], "total": 0}


@router.get("/stats")
async def approval_stats() -> Dict[str, Any]:
    """Get approval velocity and SLA compliance."""
    return {
        "total_pending": 0,
        "sla_compliant": 0,
        "sla_warning": 0,
        "sla_breach": 0,
        "avg_approval_time_hours": 0.0,
    }


@router.get("/my-pending")
async def my_pending_approvals() -> Dict[str, Any]:
    """Get approvals assigned to current user."""
    return {"approvals": [], "total": 0}


@router.post("/{approval_id}/approve")
async def approve(approval_id: str, body: ApprovalAction) -> Dict[str, Any]:
    """Approve a request. If decision_bundle is supplied, it must pass Class B validation."""
    if body.decision_bundle is not None:
        http_validate_class_b_bundle(body.decision_bundle)
    return {
        "id": approval_id,
        "status": "approved",
        "note": body.note,
        "hitl": body.hitl or "approve",
    }


@router.post("/{approval_id}/reject")
async def reject(approval_id: str, body: ApprovalAction) -> Dict[str, Any]:
    """Reject a request. Optional decision_bundle validated when present."""
    if body.decision_bundle is not None:
        http_validate_class_b_bundle(body.decision_bundle)
    return {
        "id": approval_id,
        "status": "rejected",
        "note": body.note,
        "hitl": body.hitl or "reject",
    }


@router.post("/{approval_id}/escalate")
async def escalate(approval_id: str, body: ApprovalAction) -> Dict[str, Any]:
    """Escalate a request."""
    return {"id": approval_id, "status": "escalated", "note": body.note}
