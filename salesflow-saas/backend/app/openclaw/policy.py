from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


SAFE_AUTO_ACTIONS = {
    "read_status",
    "collect_signals",
    "summarize",
    "classify",
    "tag",
    "internal_status_update",
    "research",
    "generate_draft",
    "plan",
    "predictive_analysis",
}

APPROVAL_GATED_ACTIONS = {
    "send_whatsapp",
    "send_email",
    "send_linkedin",
    "trigger_voice_call",
    "sync_salesforce",
    "create_charge",
    "publish_content",
    "change_billing_state",
    "modify_lead_routing",
    "send_contract_for_signature",
    "video_generate",
    "music_generate",
}

FORBIDDEN_ACTIONS = {
    "exfiltrate_secrets",
    "delete_data_without_audit",
    "bypass_auth",
    "publish_without_approval",
    "destructive_unchecked",
}


@dataclass
class PolicyDecision:
    action: str
    action_class: str  # A, B, C
    allowed: bool
    requires_approval: bool
    reason: str

    def as_dict(self) -> Dict[str, Any]:
        return {
            "action": self.action,
            "class": self.action_class,
            "allowed": self.allowed,
            "requires_approval": self.requires_approval,
            "reason": self.reason,
        }


def classify_action(action: str) -> PolicyDecision:
    act = (action or "").strip()
    if not act:
        return PolicyDecision(action=act, action_class="C", allowed=False, requires_approval=False, reason="empty_action")
    if act in FORBIDDEN_ACTIONS:
        return PolicyDecision(action=act, action_class="C", allowed=False, requires_approval=False, reason="forbidden_action")
    if act in APPROVAL_GATED_ACTIONS:
        return PolicyDecision(action=act, action_class="B", allowed=True, requires_approval=True, reason="approval_required")
    if act in SAFE_AUTO_ACTIONS:
        return PolicyDecision(action=act, action_class="A", allowed=True, requires_approval=False, reason="safe_auto")
    # default to approval-gated for unknown actions
    return PolicyDecision(action=act, action_class="B", allowed=True, requires_approval=True, reason="unknown_action_requires_approval")
