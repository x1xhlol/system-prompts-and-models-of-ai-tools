from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List
import uuid


@dataclass
class MemoryItem:
    memory_id: str
    tenant_id: str
    domain: str
    content: str
    evidence: Dict[str, Any]
    score: float
    promoted: bool
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def as_dict(self) -> Dict[str, Any]:
        return {
            "memory_id": self.memory_id,
            "tenant_id": self.tenant_id,
            "domain": self.domain,
            "content": self.content,
            "evidence": self.evidence,
            "score": self.score,
            "promoted": self.promoted,
            "created_at": self.created_at,
        }


class OpenClawMemoryBridge:
    """Phase-1 memory promotion pipeline: collect -> score -> promote."""

    def __init__(self) -> None:
        self._items: Dict[str, MemoryItem] = {}

    def collect(self, *, tenant_id: str, domain: str, content: str, evidence: Dict[str, Any] | None = None) -> Dict[str, Any]:
        item = MemoryItem(
            memory_id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            domain=domain or "operational",
            content=content.strip(),
            evidence=evidence or {},
            score=0.0,
            promoted=False,
        )
        self._items[item.memory_id] = item
        return item.as_dict()

    def score(self, memory_id: str, signal_count: int = 0, repetition_count: int = 0, impact_score: float = 0.0) -> Dict[str, Any]:
        item = self._items[memory_id]
        # lightweight deterministic scoring for phase-1
        value = min(100.0, float(signal_count) * 8.0 + float(repetition_count) * 12.0 + float(impact_score))
        item.score = round(value, 2)
        return item.as_dict()

    def promote(self, memory_id: str, threshold: float = 60.0) -> Dict[str, Any]:
        item = self._items[memory_id]
        item.promoted = item.score >= threshold
        return item.as_dict()

    def list_items(
        self,
        *,
        tenant_id: str,
        promoted_only: bool = False,
        domain: str | None = None,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        rows = [r for r in self._items.values() if r.tenant_id == tenant_id]
        if promoted_only:
            rows = [r for r in rows if r.promoted]
        if domain:
            rows = [r for r in rows if r.domain == domain]
        rows.sort(key=lambda x: x.created_at, reverse=True)
        return [r.as_dict() for r in rows[: max(1, min(300, limit))]]


memory_bridge = OpenClawMemoryBridge()
