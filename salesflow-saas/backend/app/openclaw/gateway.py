from __future__ import annotations

from typing import Any, Dict

from app.openclaw.approval_bridge import approval_bridge
from app.openclaw.observability_bridge import observability_bridge
from app.openclaw.task_router import task_router


class OpenClawGateway:
    """Single ingress for OpenClaw tasks: policy -> progress -> execute."""

    async def execute(
        self,
        *,
        tenant_id: str,
        task_type: str,
        action: str,
        payload: Dict[str, Any],
        model_provider: str = "auto",
        cache_hint: str = "prompt-cache-reuse",
    ) -> Dict[str, Any]:
        gate = approval_bridge.evaluate(action=action, payload=payload, tenant_id=tenant_id)
        run_id = observability_bridge.start_run(
            tenant_id=tenant_id,
            task_type=task_type,
            model_provider=model_provider,
            cache_hint=cache_hint,
            approval_required=bool(gate.get("requires_approval")),
        )
        observability_bridge.step(run_id, "policy_gate", "ok" if gate["allowed"] else "blocked", {"gate": gate})
        if not gate["allowed"]:
            observability_bridge.finish(run_id, status="blocked", error=gate["reason"])
            return {"run_id": run_id, "status": "blocked", "gate": gate}

        try:
            observability_bridge.step(run_id, "routing", "ok", {"task_type": task_type})
            result = await task_router.route(task_type, tenant_id, payload)
            observability_bridge.step(run_id, "execution", "ok")
            observability_bridge.finish(run_id, status="completed")
            return {"run_id": run_id, "status": "completed", "gate": gate, "result": result}
        except Exception as e:
            observability_bridge.step(run_id, "execution", "error", {"error": str(e)})
            observability_bridge.finish(run_id, status="failed", error=str(e))
            return {"run_id": run_id, "status": "failed", "gate": gate, "error": str(e)}


openclaw_gateway = OpenClawGateway()
