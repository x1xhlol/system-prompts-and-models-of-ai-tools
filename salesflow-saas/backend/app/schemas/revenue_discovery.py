"""Structured outputs for revenue discovery / lead exploration with provenance."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class ProvenanceEntry(BaseModel):
    """Source attribution for a field or block (audit-friendly)."""

    field_path: str
    source: Literal[
        "user_input",
        "llm_groq",
        "vertical_playbook_static",
        "licensed_web_search",
        "knowledge_rag",
        "derived",
        "unavailable",
    ]
    detail: str = Field(default="", description="Provider name, model id, or note")


class MarketSignalItem(BaseModel):
    title: str
    summary: str
    implication_ar: str = ""


class ICPBuyingCommitteeHint(BaseModel):
    role_ar: str
    role_en: str = ""
    rationale_ar: str = ""


class ExplorationEnrichment(BaseModel):
    """Enrichment block stored under Lead.extra_metadata['revenue_discovery'] when persisted."""

    vertical_playbook_id: str | None = None
    playbook_label_ar: str | None = None
    icp_summary_ar: str = ""
    icp_summary_en: str = ""
    market_signals: list[MarketSignalItem] = Field(default_factory=list)
    buying_committee_hints: list[ICPBuyingCommitteeHint] = Field(default_factory=list)
    partnership_angle_ar: str = ""
    rag_playbook_refs: list[str] = Field(
        default_factory=list,
        description="Static playbook section keys or titles used (not full RAG chunks)",
    )
    provenance: list[ProvenanceEntry] = Field(default_factory=list)
    model_id: str | None = None
    feature_flags_used: dict[str, bool] = Field(default_factory=dict)


class LeadExplorationPersistMeta(BaseModel):
    """Shape recommended for merging into Lead.extra_metadata."""

    revenue_discovery: dict[str, Any]
    provenance_index: list[ProvenanceEntry] = Field(default_factory=list)
