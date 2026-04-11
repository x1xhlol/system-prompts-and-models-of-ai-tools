from __future__ import annotations

from typing import Any, Dict

from app.config import get_settings
from app.openclaw.policy import PolicyDecision, classify_action


class OpenClawApprovalBridge:
    """Central policy+approval gate for OpenClaw runtime actions."""

    def evaluate(self, *, action: str, payload: Dict[str, Any], tenant_id: str) -> Dict[str, Any]:
        if not tenant_id:
            return {
                "allowed": False,
                "requires_approval": False,
                "reason": "missing_tenant_id",
                "policy": {"action": action, "class": "C"},
            }

        decision: PolicyDecision = classify_action(action)
        if not decision.allowed:
            return {
                "allowed": False,
                "requires_approval": False,
                "reason": decision.reason,
                "policy": decision.as_dict(),
            }

        if payload.get("cross_tenant_context"):
            return {
                "allowed": False,
                "requires_approval": False,
                "reason": "cross_tenant_context_blocked",
                "policy": decision.as_dict(),
            }

        settings = get_settings()
        canary = [x.strip() for x in (settings.OPENCLAW_CANARY_TENANTS or "").split(",") if x.strip()]
        canary_restrict_auto = bool(settings.OPENCLAW_CANARY_ENFORCE_AUTO_ACTIONS)
        is_auto_action = decision.action_class == "A"
        in_canary = not canary or tenant_id in canary
        if canary_restrict_auto and is_auto_action and not in_canary and not payload.get("approval_token"):
            return {
                "allowed": False,
                "requires_approval": True,
                "reason": "approval_required:auto_action_outside_canary",
                "policy": decision.as_dict(),
                "canary": {"enforced": True, "tenant_in_canary": False},
            }

        if decision.requires_approval and not payload.get("approval_token"):
            return {
                "allowed": False,
                "requires_approval": True,
                "reason": f"approval_required:{action}",
                "policy": decision.as_dict(),
            }

        return {
            "allowed": True,
            "requires_approval": decision.requires_approval or (canary_restrict_auto and is_auto_action and not in_canary),
            "reason": "ok",
            "policy": decision.as_dict(),
            "canary": {"enforced": canary_restrict_auto, "tenant_in_canary": in_canary},
        }


approval_bridge = OpenClawApprovalBridge()
