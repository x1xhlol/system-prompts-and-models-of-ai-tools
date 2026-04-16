"""Evidence Pack Service — assembles auditable proof from existing system data."""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.evidence_pack import EvidencePack, EvidencePackStatus, EvidencePackType


class EvidencePackService:
    """Assembles, stores, and manages evidence packs."""

    async def assemble(
        self,
        db: AsyncSession,
        *,
        tenant_id: str,
        title: str,
        title_ar: Optional[str] = None,
        pack_type: str,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        assembled_by_id: Optional[str] = None,
        contents: Optional[List[Dict[str, Any]]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> EvidencePack:
        pack_contents = contents or []
        hash_sig = hashlib.sha256(
            json.dumps(pack_contents, sort_keys=True, default=str).encode()
        ).hexdigest()

        pack = EvidencePack(
            tenant_id=tenant_id,
            title=title,
            title_ar=title_ar,
            pack_type=EvidencePackType(pack_type),
            entity_type=entity_type,
            entity_id=entity_id,
            assembled_by_id=assembled_by_id,
            status=EvidencePackStatus.READY,
            contents=pack_contents,
            metadata_=metadata or {},
            hash_signature=hash_sig,
        )
        db.add(pack)
        await db.commit()
        await db.refresh(pack)
        return pack

    async def list_packs(
        self, db: AsyncSession, *, tenant_id: str, pack_type: Optional[str] = None
    ) -> List[EvidencePack]:
        stmt = (
            select(EvidencePack)
            .where(EvidencePack.tenant_id == tenant_id)
            .order_by(EvidencePack.created_at.desc())
        )
        if pack_type:
            stmt = stmt.where(EvidencePack.pack_type == EvidencePackType(pack_type))
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(
        self, db: AsyncSession, *, tenant_id: str, pack_id: str
    ) -> Optional[EvidencePack]:
        stmt = (
            select(EvidencePack)
            .where(EvidencePack.tenant_id == tenant_id)
            .where(EvidencePack.id == pack_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def review(
        self,
        db: AsyncSession,
        *,
        tenant_id: str,
        pack_id: str,
        reviewed_by_id: str,
    ) -> Optional[EvidencePack]:
        pack = await self.get_by_id(db, tenant_id=tenant_id, pack_id=pack_id)
        if not pack:
            return None
        pack.status = EvidencePackStatus.REVIEWED
        pack.reviewed_by_id = reviewed_by_id
        pack.reviewed_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(pack)
        return pack

    async def verify_integrity(
        self, db: AsyncSession, *, tenant_id: str, pack_id: str
    ) -> Dict[str, Any]:
        pack = await self.get_by_id(db, tenant_id=tenant_id, pack_id=pack_id)
        if not pack:
            return {"valid": False, "reason": "pack_not_found"}
        current_hash = hashlib.sha256(
            json.dumps(pack.contents, sort_keys=True, default=str).encode()
        ).hexdigest()
        return {
            "valid": current_hash == pack.hash_signature,
            "stored_hash": pack.hash_signature,
            "computed_hash": current_hash,
        }


evidence_pack_service = EvidencePackService()
