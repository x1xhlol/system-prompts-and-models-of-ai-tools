"""Approval Center API — enhanced approval queue with SLA tracking."""

from typing import Any, Dict, Optional

from fastapi import APIRouter
from pydantic import BaseModel as PydanticBase

from app.services.core_os.decision_memo import DecisionMemo, FinancialImpact, RiskRegisterItem
from app.services.core_os.decision_plane_contracts import (
    ApprovalPacket,
    EvidencePack,
    ExecutionIntent,
    assemble_decision_bundle,
    new_evidence_pack_id,
    validate_class_b_bundle,
)

router = APIRouter(prefix="/approval-center", tags=["Approval Center"])


class ApprovalAction(PydanticBase):
    note: Optional[str] = None


@router.get("/class-b-decision-bundle")
async def class_b_decision_bundle_demo() -> Dict[str, Any]:
    """
    Tier-1 Class B pilot: returns a fully validated decision bundle (demo data).
    Used by executive surfaces and contract tests — replace payload with real DB rows later.
    """
    memo = DecisionMemo.create_memo(
        agent_id="approval_center_demo",
        objective="عرض حزمة قرار Class B (Tier-1)",
        recommendation="المتابعة وفق الحوكمة المعروضة في الوثائق",
        confidence=90.0,
        decision_context="Tier-1 master closure — demo bundle only",
        inputs_used=["docs/architecture-register.md", "docs/TIER1_MASTER_CLOSURE_CHECKLIST_AR.md"],
        assumptions=["بيانات تجريبية؛ لا التزام تعاقدي"],
        alternatives_considered=["تأجيل المسار"],
        expected_financial_impact=FinancialImpact(),
        risk_register=[
            RiskRegisterItem(
                risk="سطح تجريبي",
                severity="low",
                mitigation="عدم استخدامه لقرارات مالية حقيقية",
            )
        ],
        required_approvals=["governance_lead", "product_owner"],
        next_best_action="ربط الواجهة التنفيذية بهذا المسار",
        rollback_plan="تعطيل المسار أو إرجاع قائمة فارغة",
        evidence_links=["docs/completion-program-workstreams.md"],
    )
    evidence = EvidencePack(
        pack_id=new_evidence_pack_id(),
        sources=["pytest:approval_center", "ci:dealix-ci"],
        assumptions=["Evidence pack compiled for demo"],
        artifact_refs=["architecture_brief.py"],
        provenance_score=72.0,
        tool_proof_ids=[],
    )
    approval_packet = ApprovalPacket(
        approval_class="A2",
        reversibility_class="R1",
        sensitivity_class="S1",
        actor_type="recommender_agent",
        approvers_required=["human_approver"],
        policy_notes="Class B — approval required before external side effects",
    )
    execution_intent = ExecutionIntent(
        workflow_key="governance_class_b_review_v1",
        idempotency_key="class-b-demo-approval-center-001",
        requested_side_effect_class="internal_write",
        correlation_id="corr_class_b_demo",
        payload_summary="Record approval decision in internal audit trail",
    )
    bundle = assemble_decision_bundle(
        evidence_pack=evidence,
        approval_packet=approval_packet,
        execution_intent=execution_intent,
        memo_json=memo.model_dump(mode="json"),
    )
    validate_class_b_bundle(bundle)
    return bundle


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
    """Approve a request."""
    return {"id": approval_id, "status": "approved", "note": body.note}


@router.post("/{approval_id}/reject")
async def reject(approval_id: str, body: ApprovalAction) -> Dict[str, Any]:
    """Reject a request."""
    return {"id": approval_id, "status": "rejected", "note": body.note}


@router.post("/{approval_id}/escalate")
async def escalate(approval_id: str, body: ApprovalAction) -> Dict[str, Any]:
    """Escalate a request."""
    return {"id": approval_id, "status": "escalated", "note": body.note}
