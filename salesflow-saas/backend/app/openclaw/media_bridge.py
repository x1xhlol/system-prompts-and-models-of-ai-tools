from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List
import uuid


@dataclass
class MediaDraft:
    draft_id: str
    tenant_id: str
    media_type: str  # video | music
    prompt: str
    status: str = "draft_pending_approval"
    provider_hint: str | None = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def as_dict(self) -> Dict[str, Any]:
        return {
            "draft_id": self.draft_id,
            "tenant_id": self.tenant_id,
            "media_type": self.media_type,
            "prompt": self.prompt,
            "status": self.status,
            "provider_hint": self.provider_hint,
            "metadata": self.metadata,
            "created_at": self.created_at,
        }


class OpenClawMediaBridge:
    """Draft-only media generation bridge for phase-1 safety."""

    def __init__(self) -> None:
        self._drafts: Dict[str, MediaDraft] = {}

    def create_draft(
        self,
        *,
        tenant_id: str,
        media_type: str,
        prompt: str,
        provider_hint: str | None = None,
        metadata: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        mtype = media_type.strip().lower()
        if mtype not in {"video", "music"}:
            raise ValueError("media_type must be 'video' or 'music'")
        row = MediaDraft(
            draft_id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            media_type=mtype,
            prompt=prompt.strip(),
            provider_hint=provider_hint,
            metadata=metadata or {},
        )
        self._drafts[row.draft_id] = row
        return row.as_dict()

    def list_drafts(self, *, tenant_id: str, media_type: str | None = None, limit: int = 100) -> List[Dict[str, Any]]:
        rows = [r for r in self._drafts.values() if r.tenant_id == tenant_id]
        if media_type:
            rows = [r for r in rows if r.media_type == media_type.strip().lower()]
        rows.sort(key=lambda x: x.created_at, reverse=True)
        return [r.as_dict() for r in rows[: max(1, min(300, limit))]]


media_bridge = OpenClawMediaBridge()
