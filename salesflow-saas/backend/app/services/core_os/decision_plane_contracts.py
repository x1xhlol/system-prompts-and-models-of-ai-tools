"""
Decision plane bundle — structured artifacts for Completion Program WS2.

Compose alongside DecisionMemo for Class B / governed paths:
  evidence_pack, approval_packet, execution_intent (risk_register lives on DecisionMemo).
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field

ApprovalClass = Literal["A0", "A1", "A2", "A3"]
ReversibilityClass = Literal["R0", "R1", "R2", "R3"]
SensitivityClass = Literal["S0", "S1", "S2", "S3"]
ActorType = Literal["human", "observer_agent", "recommender_agent", "executor_system", "automated_workflow"]


class EvidencePack(BaseModel):
    """Structured evidence for a decision or agent run."""

    pack_id: str = Field(..., description="Stable id, e.g. ep_<uuid>")
    sources: List[str] = Field(default_factory=list, description="URLs, file paths, ticket ids")
    assumptions: List[str] = Field(default_factory=list)
    freshness_utc: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO-8601 UTC",
    )
    compliance_notes: Optional[str] = None
    artifact_refs: List[str] = Field(default_factory=list, description="Build ids, test logs, PR urls")
    provenance_score: float = Field(default=0.0, ge=0.0, le=100.0)
    tool_proof_ids: List[str] = Field(default_factory=list)


class ApprovalPacket(BaseModel):
    """A/R/S + actor for routing and audit."""

    approval_class: ApprovalClass
    reversibility_class: ReversibilityClass
    sensitivity_class: SensitivityClass
    actor_type: ActorType
    approvers_required: List[str] = Field(default_factory=list)
    policy_notes: Optional[str] = None


class ExecutionIntent(BaseModel):
    """What the execution plane should do — not narration."""

    workflow_key: str = Field(..., description="Logical workflow name, e.g. partner_approval_v1")
    idempotency_key: str
    requested_side_effect_class: Literal["none", "internal_write", "external_message", "external_commitment"]
    correlation_id: Optional[str] = None
    payload_summary: str = Field(default="", description="Human-readable one-liner; details in workflow state")


def new_evidence_pack_id(prefix: str = "ep") -> str:
    from uuid import uuid4

    return f"{prefix}_{uuid4().hex[:12]}"


CLASS_B_BUNDLE_KEYS = (
    "memo_json",
    "evidence_pack_json",
    "risk_register_json",
    "approval_packet_json",
    "execution_intent_json",
)


def validate_class_b_bundle(bundle: Dict[str, Any]) -> None:
    """
    Enforce Tier-1 Class B response shape: all bundle keys present and sub-objects valid.
    Raises ValueError with a short message suitable for HTTP 400.
    """
    missing = [k for k in CLASS_B_BUNDLE_KEYS if k not in bundle or bundle[k] is None]
    if missing:
        raise ValueError(f"Class B bundle missing keys: {', '.join(missing)}")

    # Local import avoids import cycle at module load.
    from app.services.core_os.decision_memo import DecisionMemo

    memo = DecisionMemo.model_validate(bundle["memo_json"])
    if not memo.required_approvals:
        raise ValueError("memo_json.required_approvals must be non-empty for Class B paths")
    EvidencePack.model_validate(bundle["evidence_pack_json"])
    ApprovalPacket.model_validate(bundle["approval_packet_json"])
    ei = ExecutionIntent.model_validate(bundle["execution_intent_json"])
    if ei.requested_side_effect_class in ("external_message", "external_commitment"):
        cid = (ei.correlation_id or "").strip()
        if not cid:
            raise ValueError(
                "execution_intent_json.correlation_id is required for "
                f"requested_side_effect_class={ei.requested_side_effect_class!r} (traceability / OTel)"
            )
    rr = bundle["risk_register_json"]
    if not isinstance(rr, list):
        raise ValueError("risk_register_json must be a list")


def assemble_decision_bundle(
    *,
    evidence_pack: EvidencePack,
    approval_packet: ApprovalPacket,
    execution_intent: ExecutionIntent,
    memo_json: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Single JSON-serializable bundle for APIs and logs.

    Keys: memo_json, evidence_pack_json, risk_register_json (from memo if present),
    approval_packet_json, execution_intent_json
    """
    risk_register = memo_json.get("risk_register")
    if risk_register is None:
        risk_register = memo_json.get("risk_register_json")
    return {
        "memo_json": memo_json,
        "evidence_pack_json": evidence_pack.model_dump(mode="json"),
        "risk_register_json": risk_register if isinstance(risk_register, list) else [],
        "approval_packet_json": approval_packet.model_dump(mode="json"),
        "execution_intent_json": execution_intent.model_dump(mode="json"),
    }
