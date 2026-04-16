"""Tests for decision plane bundle (Completion Program WS2)."""
from __future__ import annotations

from app.services.core_os.decision_memo import DecisionMemo, AuditMetadata, FinancialImpact
from app.services.core_os.decision_plane_contracts import (
    ApprovalPacket,
    EvidencePack,
    ExecutionIntent,
    assemble_decision_bundle,
    new_evidence_pack_id,
)


def test_assemble_decision_bundle_keys():
    memo = DecisionMemo(
        objective="Test objective",
        decision_context="ctx",
        inputs_used=["a"],
        assumptions=["x"],
        recommendation_ar="do thing",
        alternatives_considered=["b"],
        expected_financial_impact=FinancialImpact(),
        risk_register=[],
        confidence_score=80.0,
        required_approvals=["CEO"],
        next_best_action="approve",
        rollback_plan="revert",
        evidence_links=[],
        audit_metadata=AuditMetadata(agent_id="test_agent", timestamp="2026-01-01T00:00:00Z"),
    )
    ep = EvidencePack(
        pack_id=new_evidence_pack_id(),
        sources=["https://example.com/doc"],
        provenance_score=70.0,
    )
    ap = ApprovalPacket(
        approval_class="A2",
        reversibility_class="R2",
        sensitivity_class="S2",
        actor_type="recommender_agent",
        approvers_required=["CFO"],
    )
    ei = ExecutionIntent(
        workflow_key="partner_approval_v1",
        idempotency_key="idem-001",
        requested_side_effect_class="internal_write",
        correlation_id="corr-1",
    )
    bundle = assemble_decision_bundle(
        evidence_pack=ep,
        approval_packet=ap,
        execution_intent=ei,
        memo_json=memo.to_json(),
    )
    assert set(bundle.keys()) == {
        "memo_json",
        "evidence_pack_json",
        "risk_register_json",
        "approval_packet_json",
        "execution_intent_json",
    }
    assert bundle["approval_packet_json"]["approval_class"] == "A2"
    assert bundle["execution_intent_json"]["idempotency_key"] == "idem-001"
