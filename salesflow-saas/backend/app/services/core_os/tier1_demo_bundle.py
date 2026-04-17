"""Shared Tier-1 Class B demo bundle for approval center, executive snapshot, and tests."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List

from app.schemas.structured_outputs import ExecWeeklyGovernanceContract, Provenance
from app.services.core_os.decision_memo import DecisionMemo, FinancialImpact, RiskRegisterItem
from app.services.core_os.decision_plane_contracts import (
    ApprovalPacket,
    EvidencePack,
    ExecutionIntent,
    assemble_decision_bundle,
    new_evidence_pack_id,
    validate_class_b_bundle,
)


def build_class_b_demo_bundle() -> Dict[str, Any]:
    """Validated demo bundle; same shape as GET /approval-center/class-b-decision-bundle."""
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
        requested_side_effect_class="external_message",
        correlation_id="corr_class_b_demo",
        payload_summary="Demo external-class path; correlation_id mandatory per validate_class_b_bundle",
    )
    bundle = assemble_decision_bundle(
        evidence_pack=evidence,
        approval_packet=approval_packet,
        execution_intent=execution_intent,
        memo_json=memo.model_dump(mode="json"),
    )
    validate_class_b_bundle(bundle)
    return bundle


def build_exec_weekly_governance_contract_from_demo_bundle() -> ExecWeeklyGovernanceContract:
    """Single source for executive weekly fields: same demo bundle as Class B / golden path."""
    bundle = build_class_b_demo_bundle()
    memo = bundle.get("memo_json") or {}
    ei = bundle.get("execution_intent_json") or {}
    correlation_id = ei.get("correlation_id") or "unknown"
    iso = datetime.now(timezone.utc).isocalendar()
    week_of = f"{iso.year}-W{iso.week:02d}"
    pending = list(memo.get("required_approvals") or [])
    nba_raw = memo.get("next_best_action")
    next_best: List[str] = [nba_raw] if isinstance(nba_raw, str) and nba_raw.strip() else []
    risks = memo.get("risk_register") or []
    at_risk: List[str] = []
    if isinstance(risks, list):
        for item in risks:
            if isinstance(item, dict) and item.get("risk"):
                at_risk.append(str(item["risk"]))
    changes_summary = (
        f"Weekly rollup (demo): {memo.get('objective', '')} — {memo.get('recommendation', '')}".strip()
    )
    raw_conf = memo.get("confidence")
    if raw_conf is not None:
        c = float(raw_conf)
        conf_norm = c / 100.0 if c > 1.0 else c
    else:
        conf_norm = 0.72
    provenance = Provenance(
        generated_by="tier1_demo_bundle",
        model_provider=None,
        model_id=None,
        confidence=min(1.0, max(0.0, conf_norm)),
        freshness_hours=0.0,
        trace_id=str(correlation_id),
    )
    return ExecWeeklyGovernanceContract(
        week_of=week_of,
        changes_summary=changes_summary or "No changes summary in demo memo.",
        pending_decisions=pending,
        blockers_summary="No live blockers in demo mode.",
        at_risk_items=at_risk,
        next_best_actions=next_best or ["none"],
        provenance=provenance,
    )
