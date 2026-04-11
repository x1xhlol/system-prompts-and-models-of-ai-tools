from __future__ import annotations

from typing import Any, Dict

from app.openclaw.durable_flow import DurableTaskFlow


class SelfImprovementFlow:
    """6-phase self-improvement loop v2.0 as durable flow."""

    def run(self, tenant_id: str, input_state: Dict[str, Any]) -> Dict[str, Any]:
        flow = DurableTaskFlow(flow_name="self_improvement_v2", tenant_id=tenant_id)
        flow.checkpoint("collect_signals", {"signals": input_state.get("signals", [])})
        flow.checkpoint("diagnose_bottlenecks", {"bottlenecks": input_state.get("bottlenecks", [])})
        flow.checkpoint("generate_experiments", {"experiments": input_state.get("experiments", [])})
        flow.checkpoint("run_ab_tests", {"ab_results": input_state.get("ab_results", {})})
        flow.checkpoint(
            "validate_security_governance",
            {"governance_passed": input_state.get("governance_passed", True)},
        )
        flow.checkpoint("promote_or_rollback", {"promoted": input_state.get("promoted", True)})
        flow.checkpoint("done", {"status": "completed"})
        return flow.as_dict()


self_improvement_flow = SelfImprovementFlow()
