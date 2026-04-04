from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List
import uuid


@dataclass
class FlowRevision:
    revision_id: str
    at: str
    note: str
    checkpoint: Dict[str, Any]


@dataclass
class DurableTaskFlow:
    flow_name: str
    tenant_id: str
    run_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    checkpoints: List[FlowRevision] = field(default_factory=list)
    state: Dict[str, Any] = field(default_factory=dict)

    def checkpoint(self, note: str, patch: Dict[str, Any]) -> FlowRevision:
        self.state.update(patch)
        revision = FlowRevision(
            revision_id=str(uuid.uuid4()),
            at=datetime.now(timezone.utc).isoformat(),
            note=note,
            checkpoint=dict(self.state),
        )
        self.checkpoints.append(revision)
        return revision

    def as_dict(self) -> Dict[str, Any]:
        return {
            "flow_name": self.flow_name,
            "tenant_id": self.tenant_id,
            "run_id": self.run_id,
            "state": self.state,
            "revisions": [
                {
                    "revision_id": r.revision_id,
                    "at": r.at,
                    "note": r.note,
                    "checkpoint": r.checkpoint,
                }
                for r in self.checkpoints
            ],
        }
