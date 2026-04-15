"""Request bodies for Dealix Master API (shared with background runners)."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class EnrichExplorationBody(BaseModel):
    sector: str = Field(default="تقنية المعلومات")
    city: str = Field(default="الرياض")
    lead: dict[str, Any] = Field(default_factory=dict)
    icp_notes_ar: str = ""
    icp_notes_en: str = ""
