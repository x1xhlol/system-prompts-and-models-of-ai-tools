"""Revenue discovery: vertical playbooks + optional licensed search + structured LLM enrichment."""

from __future__ import annotations

import asyncio
import json
import logging
import os
from typing import Any

import httpx
from groq import AsyncGroq

from app.schemas.revenue_discovery import (
    ExplorationEnrichment,
    ICPBuyingCommitteeHint,
    MarketSignalItem,
    ProvenanceEntry,
)
from app.services.dealix_os.vertical_playbooks import get_playbook

logger = logging.getLogger("dealix.revenue_discovery")

SECTOR_TO_PLAYBOOK: dict[str, str] = {
    "تقنية المعلومات": "saas_b2b",
    "العقارات": "real_estate",
    "الصحة": "healthcare",
    "التعليم": "professional_services",
    "التجزئة": "professional_services",
    "المقاولات": "professional_services",
    "الاستشارات": "professional_services",
    "التصنيع": "professional_services",
    "اللوجستيات": "professional_services",
    "المالية": "professional_services",
}


def resolve_playbook_id(sector_ar: str) -> str:
    return SECTOR_TO_PLAYBOOK.get(sector_ar.strip(), "saas_b2b")


async def _tavily_snippets(query: str, max_results: int = 3) -> tuple[list[dict[str, str]], list[ProvenanceEntry]]:
    key = (os.getenv("TAVILY_API_KEY") or "").strip()
    if not key:
        return [], [
            ProvenanceEntry(
                field_path="market_signals",
                source="unavailable",
                detail="TAVILY_API_KEY not set — licensed web search skipped",
            )
        ]
    last_err: Exception | None = None
    data: dict = {}
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=22.0) as client:
                r = await client.post(
                    "https://api.tavily.com/search",
                    json={
                        "api_key": key,
                        "query": query,
                        "search_depth": "basic",
                        "max_results": max_results,
                        "include_answer": False,
                    },
                )
                r.raise_for_status()
                data = r.json()
                break
        except Exception as e:
            last_err = e
            logger.warning("tavily attempt %s failed: %s", attempt + 1, e)
            if attempt < 2:
                await asyncio.sleep(0.4 * (attempt + 1))
    else:
        return [], [
            ProvenanceEntry(
                field_path="market_signals",
                source="licensed_web_search",
                detail=f"Tavily error after retries: {type(last_err).__name__ if last_err else 'unknown'}",
            )
        ]

    results = data.get("results") or []
    snippets: list[dict[str, str]] = []
    for item in results[:max_results]:
        title = (item.get("title") or "")[:200]
        content = (item.get("content") or "")[:400]
        url = item.get("url") or ""
        if title or content:
            snippets.append({"title": title, "url": url, "content": content})
    prov = [
        ProvenanceEntry(
            field_path="market_signals",
            source="licensed_web_search",
            detail="Tavily search API",
        )
    ]
    return snippets, prov


async def build_enrichment_for_lead(
    *,
    sector: str,
    city: str,
    lead: dict[str, Any],
    icp_notes_ar: str = "",
    icp_notes_en: str = "",
    use_licensed_search: bool = True,
    groq_model: str = "llama-3.1-8b-instant",
    knowledge_chunks: list[dict[str, Any]] | None = None,
) -> ExplorationEnrichment:
    playbook_id = resolve_playbook_id(sector)
    pb = get_playbook(playbook_id) or {}
    pb_label = pb.get("label_ar") or playbook_id

    prov: list[ProvenanceEntry] = [
        ProvenanceEntry(
            field_path="vertical_playbook_id",
            source="vertical_playbook_static",
            detail=f"vertical_playbooks.{playbook_id}",
        ),
    ]
    if icp_notes_ar or icp_notes_en:
        prov.append(
            ProvenanceEntry(field_path="icp_notes", source="user_input", detail="workspace ICP context")
        )

    k_chunks = knowledge_chunks or []
    if k_chunks:
        prov.append(
            ProvenanceEntry(
                field_path="knowledge_rag",
                source="knowledge_rag",
                detail=f"SectorAsset semantic search ({len(k_chunks)} chunks)",
            )
        )

    search_snippets: list[dict[str, str]] = []
    if use_licensed_search:
        q = f"{lead.get('company_name','')} {sector} {city} Saudi Arabia business news"
        snippets, sprov = await _tavily_snippets(q, max_results=3)
        search_snippets = snippets
        prov.extend(sprov)

    groq_key = os.getenv("GROQ_API_KEY", "")
    if not groq_key:
        refs = [f"playbook:{playbook_id}"] + [f"knowledge:{c.get('title', '')}" for c in k_chunks if c.get("title")]
        return ExplorationEnrichment(
            vertical_playbook_id=playbook_id,
            playbook_label_ar=pb_label,
            icp_summary_ar="تعذر تشغيل نموذج الإثراء (GROQ_API_KEY غير مضبوط).",
            partnership_angle_ar="",
            rag_playbook_refs=refs,
            provenance=prov
            + [ProvenanceEntry(field_path="llm", source="unavailable", detail="GROQ_API_KEY missing")],
            feature_flags_used={"knowledge_rag": bool(k_chunks), "licensed_search": use_licensed_search},
        )

    client = AsyncGroq(api_key=groq_key)
    pb_full = dict(pb) if pb else {}
    pb_full["id"] = playbook_id
    pb_blob = json.dumps(pb_full, ensure_ascii=False)
    if len(pb_blob) > 8000:
        pb_blob = pb_blob[:8000] + "\n…[truncated playbook JSON]"
    search_blob = json.dumps(search_snippets, ensure_ascii=False) if search_snippets else "[]"
    rag_blob = json.dumps(
        [{"title": c.get("title"), "excerpt": (c.get("content") or "")[:500]} for c in k_chunks],
        ensure_ascii=False,
    )

    prompt = f"""أنت محلل إيرادات B2B للسوق السعودي. أنتج JSON فقط حسب المخطط الذهني التالي (بالعربية حيث ينطبق).
قطاع: {sector}
مدينة: {city}
شركة مستهدفة: {json.dumps(lead, ensure_ascii=False)}
ملاحظات ICP من المستخدم (عربي): {icp_notes_ar or "—"}
ملاحظات ICP (إنجليزي اختياري): {icp_notes_en or "—"}
مقتطفات بحث مرخّص (قد تكون فارغة): {search_blob}
مقتطفات معرفة داخلية (RAG من أصول القطاع، قد تكون فارغة): {rag_blob}
معلومات playbook قطاعي كاملة (ثابتة من النظام، قد تُقتطع): {pb_blob}

أعد JSON بالشكل:
{{
  "icp_summary_ar": "ملخص قصير",
  "icp_summary_en": "Short EN summary for export",
  "market_signals": [{{"title":"...", "summary":"...", "implication_ar":"..."}}],
  "buying_committee_hints": [{{"role_ar":"...", "role_en":"...", "rationale_ar":"..."}}],
  "partnership_angle_ar": "زاوية شراكة واقعية"
}}
قواعد: لا تدّعي أخباراً غير موجودة في المقتطفات؛ إن لم تتوفر أخبار، اذكر عبارات عامة قطاعية فقط. استخدم مقتطفات المعرفة الداخلية فقط كسياق إضافي عند وجودها. لا تذكر أسعاراً."""

    response = await client.chat.completions.create(
        model=groq_model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.25,
        max_tokens=1200,
        response_format={"type": "json_object"},
    )
    raw = json.loads(response.choices[0].message.content)

    signals = []
    for s in raw.get("market_signals") or []:
        if isinstance(s, dict) and s.get("title"):
            signals.append(MarketSignalItem.model_validate(s))

    hints = []
    for h in raw.get("buying_committee_hints") or []:
        if isinstance(h, dict) and h.get("role_ar"):
            hints.append(ICPBuyingCommitteeHint.model_validate(h))

    prov.append(
        ProvenanceEntry(
            field_path="structured_enrichment",
            source="llm_groq",
            detail=f"model={groq_model}",
        )
    )

    refs = [f"playbook:{playbook_id}"] + [
        f"knowledge:{c.get('title', '')}" for c in k_chunks if c.get("title")
    ]

    return ExplorationEnrichment(
        vertical_playbook_id=playbook_id,
        playbook_label_ar=pb_label,
        icp_summary_ar=raw.get("icp_summary_ar") or "",
        icp_summary_en=raw.get("icp_summary_en") or "",
        market_signals=signals,
        buying_committee_hints=hints,
        partnership_angle_ar=raw.get("partnership_angle_ar") or "",
        rag_playbook_refs=refs,
        provenance=prov,
        model_id=groq_model,
        feature_flags_used={"knowledge_rag": bool(k_chunks), "licensed_search": use_licensed_search},
    )


def attach_generation_provenance(leads: list[dict], sector: str, city: str) -> dict[str, Any]:
    """Manifest for the bulk generate response (per-field sources)."""
    playbook_id = resolve_playbook_id(sector)
    return {
        "sector": sector,
        "city": city,
        "playbook_id": playbook_id,
        "lead_field_sources": {
            "company_name": "llm_groq",
            "pain_point": "llm_groq",
            "dealix_solution": "llm_groq",
            "vertical_context": "vertical_playbook_static",
        },
        "provenance": [
            ProvenanceEntry(
                field_path="leads[]",
                source="llm_groq",
                detail="GoogleMapsLeadScraper.generate_leads_for_sector",
            ).model_dump(),
            ProvenanceEntry(
                field_path="sector_context",
                source="vertical_playbook_static",
                detail=f"vertical_playbooks.{playbook_id}",
            ).model_dump(),
        ],
    }


def merge_persist_metadata(enrichment: ExplorationEnrichment) -> dict[str, Any]:
    """For Lead.extra_metadata merge via API metadata field."""
    d = enrichment.model_dump()
    return {"revenue_discovery": d, "provenance_index": [p.model_dump() for p in enrichment.provenance]}
