"""HTTP helpers for Class B decision bundle enforcement (Tier-1 runtime)."""

from __future__ import annotations

from typing import Any, Dict

from fastapi import HTTPException

from app.services.core_os.decision_plane_contracts import validate_class_b_bundle


def http_validate_class_b_bundle(bundle: Dict[str, Any]) -> None:
    """Raise 422 if bundle fails Tier-1 Class B gate (including correlation for external_*)."""
    try:
        validate_class_b_bundle(bundle)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
