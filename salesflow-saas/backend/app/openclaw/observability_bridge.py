from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List
import uuid


@dataclass
class OpenClawRun:
    run_id: str
    tenant_id: str
    task_type: str
    status: str = "running"
    started_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    ended_at: str | None = None
    model_provider: str | None = None
    cache_hint: str | None = None
    approval_required: bool = False
    steps: List[Dict[str, Any]] = field(default_factory=list)
    error: str | None = None

    def as_dict(self) -> Dict[str, Any]:
        return {
            "run_id": self.run_id,
            "tenant_id": self.tenant_id,
            "task_type": self.task_type,
            "status": self.status,
            "started_at": self.started_at,
            "ended_at": self.ended_at,
            "model_provider": self.model_provider,
            "cache_hint": self.cache_hint,
            "approval_required": self.approval_required,
            "steps": self.steps,
            "error": self.error,
        }


class OpenClawObservabilityBridge:
    """In-process run telemetry for phase-1 safe core."""

    def __init__(self) -> None:
        self._runs: Dict[str, OpenClawRun] = {}

    def start_run(
        self,
        *,
        tenant_id: str,
        task_type: str,
        model_provider: str | None = None,
        cache_hint: str | None = None,
        approval_required: bool = False,
    ) -> str:
        run_id = str(uuid.uuid4())
        self._runs[run_id] = OpenClawRun(
            run_id=run_id,
            tenant_id=tenant_id,
            task_type=task_type,
            model_provider=model_provider,
            cache_hint=cache_hint,
            approval_required=approval_required,
        )
        return run_id

    def step(self, run_id: str, stage: str, status: str = "ok", details: Dict[str, Any] | None = None) -> None:
        run = self._runs.get(run_id)
        if not run:
            return
        run.steps.append(
            {
                "at": datetime.now(timezone.utc).isoformat(),
                "stage": stage,
                "status": status,
                "details": details or {},
            }
        )

    def finish(self, run_id: str, *, status: str = "completed", error: str | None = None) -> None:
        run = self._runs.get(run_id)
        if not run:
            return
        run.status = status
        run.error = error
        run.ended_at = datetime.now(timezone.utc).isoformat()

    def list_runs(self, *, tenant_id: str | None = None, limit: int = 50) -> List[Dict[str, Any]]:
        rows = list(self._runs.values())
        if tenant_id:
            rows = [r for r in rows if r.tenant_id == tenant_id]
        rows.sort(key=lambda r: r.started_at, reverse=True)
        return [r.as_dict() for r in rows[: max(1, min(200, limit))]]


observability_bridge = OpenClawObservabilityBridge()
