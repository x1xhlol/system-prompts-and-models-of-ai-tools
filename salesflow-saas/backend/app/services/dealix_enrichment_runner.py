"""Shared enrichment pipeline for sync HTTP and background jobs."""

from __future__ import annotations

import hashlib
import json
import logging
import os
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.dealix_master import EnrichExplorationBody
from app.services.intelligence_plane_control import cache_get, cache_set, tenant_may_use_licensed_search
from app.services.revenue_discovery_service import build_enrichment_for_lead, resolve_playbook_id

logger = logging.getLogger("dealix.enrichment_runner")


async def compute_enrich_exploration(
    db: AsyncSession,
    body: EnrichExplorationBody,
    *,
    tenant_id: str | None,
    tid_for_tavily: str | None,
) -> dict:
    """
    Cache-aware enrichment (payload hash + daily idempotency). Returns model_dump dict.
    """
    payload_hash = hashlib.sha256(
        json.dumps(body.model_dump(), ensure_ascii=False, sort_keys=True).encode("utf-8")
    ).hexdigest()[:32]
    cache_key = f"enrich:{payload_hash}"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    company_key = str(body.lead.get("company_name") or "").strip().lower()[:160]
    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    idem_key = (
        f"enrich:idemp:{day}:{body.sector}:{body.city}:"
        f"{hashlib.sha256(company_key.encode('utf-8')).hexdigest()[:24]}"
    )
    if os.getenv("DEALIX_ENRICH_IDEMPOTENT_DAILY", "true").lower() not in ("0", "false", "no"):
        idem_hit = cache_get(idem_key)
        if idem_hit is not None:
            return idem_hit

    allow_search = (os.getenv("TAVILY_API_KEY") or "").strip() != ""
    if os.getenv("DEALIX_ALLOW_LICENSED_SEARCH", "true").lower() in ("0", "false", "no"):
        allow_search = False
    if tid_for_tavily and not tenant_may_use_licensed_search(tid_for_tavily):
        allow_search = False

    knowledge_chunks: list[dict] = []
    if os.getenv("DEALIX_KNOWLEDGE_RAG_ENRICH", "true").lower() not in ("0", "false", "no"):
        try:
            from app.services.knowledge_service import KnowledgeService

            ks = KnowledgeService(db)
            q = f"{company_key} {body.sector} {body.city} sales partnership B2B"
            pb = resolve_playbook_id(body.sector)
            knowledge_chunks = await ks.search_sector_knowledge(q, sector=pb, limit=3)
            if not knowledge_chunks:
                knowledge_chunks = await ks.search_sector_knowledge(q, sector=None, limit=3)
        except Exception as e:
            logger.debug("knowledge RAG skipped: %s", e)

    enrichment = await build_enrichment_for_lead(
        sector=body.sector,
        city=body.city,
        lead=body.lead,
        icp_notes_ar=body.icp_notes_ar,
        icp_notes_en=body.icp_notes_en,
        use_licensed_search=allow_search,
        knowledge_chunks=knowledge_chunks or None,
    )
    out = enrichment.model_dump()
    cache_set(cache_key, out)
    if os.getenv("DEALIX_ENRICH_IDEMPOTENT_DAILY", "true").lower() not in ("0", "false", "no"):
        cache_set(idem_key, out, ttl_sec=86400)
    return out
