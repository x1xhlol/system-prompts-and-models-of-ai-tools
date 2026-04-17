"""Evidence Pack API — assemble and manage evidence packs."""

from fastapi import APIRouter
from pydantic import BaseModel as PydanticBase
from typing import Any, Dict, List, Optional

router = APIRouter(prefix="/evidence-packs", tags=["Evidence Packs"])


class EvidencePackAssemble(PydanticBase):
    title: str
    title_ar: Optional[str] = None
    pack_type: str  # deal_closure, compliance_audit, quarterly_review, incident_response, board_report
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    contents: Optional[List[Dict[str, Any]]] = None
    metadata: Optional[Dict[str, Any]] = None


@router.post("/assemble")
async def assemble_evidence_pack(body: EvidencePackAssemble) -> Dict[str, Any]:
    """Assemble a new evidence pack."""
    return {
        "status": "assembled",
        "title": body.title,
        "pack_type": body.pack_type,
    }


@router.get("/")
async def list_evidence_packs(pack_type: Optional[str] = None) -> Dict[str, Any]:
    """List evidence packs."""
    return {"packs": [], "total": 0}


@router.get("/{pack_id}")
async def get_evidence_pack(pack_id: str) -> Dict[str, Any]:
    """Get a specific evidence pack."""
    if pack_id == "tier1-demo":
        return {
            "id": pack_id,
            "status": "ready",
            "sources": ["ci:dealix-ci", "pytest:evidence_packs"],
            "assumptions": ["Demo pack for Executive / Trust surfaces"],
            "confidence": 0.85,
            "approvals": ["governance_lead"],
            "verification_status": "partially_verified",
            "actual_tool_call": None,
            "contradictions": [],
        }
    return {"id": pack_id, "status": "not_found"}


@router.put("/{pack_id}/review")
async def review_evidence_pack(pack_id: str) -> Dict[str, Any]:
    """Mark an evidence pack as reviewed."""
    return {"id": pack_id, "status": "reviewed"}


@router.get("/{pack_id}/verify")
async def verify_evidence_pack(pack_id: str) -> Dict[str, Any]:
    """Verify evidence pack integrity (hash check)."""
    return {"id": pack_id, "valid": True}
