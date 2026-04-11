"""
Dealix Proposals & Quotes API
إدارة عروض الأسعار والعروض التجارية
"""

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.proposal import Proposal
from app.services.cpq.quote_engine import (
    QuoteEngine, QuoteCreate, LineItemInput, DiscountInput, QuoteStatus,
)
from app.services.cpq.proposal_generator import (
    ProposalGenerator, ProposalInput,
)

router = APIRouter(prefix="/proposals", tags=["Proposals & Quotes"])


# ── Request / Response Models ────────────────────

class ProposalCreateRequest(BaseModel):
    deal_id: Optional[str] = None
    lead_id: Optional[str] = None
    title: str
    currency: str = "SAR"
    industry: str = "services"
    validity_days: int = 30
    vat_registration_number: Optional[str] = None
    client_name: str = ""
    client_company: str = ""
    notes_ar: str = ""


class ProposalUpdateRequest(BaseModel):
    title: Optional[str] = None
    notes_ar: Optional[str] = None
    validity_days: Optional[int] = None
    vat_registration_number: Optional[str] = None


class SendRequest(BaseModel):
    channel: str = Field(pattern=r"^(whatsapp|email)$", default="whatsapp")
    recipient: str


class AcceptRequest(BaseModel):
    client_signature: str = ""
    notes: str = ""


class AIProposalRequest(BaseModel):
    deal_title: str
    client_name: str
    client_company: str = ""
    industry: str = "services"
    deal_value: float = 0.0
    currency: str = "SAR"
    requirements: str = ""
    language: str = "ar"
    extra_context: str = ""


# ── Endpoints ────────────────────────────────────

@router.get("")
async def list_proposals(
    status: Optional[str] = Query(None),
    deal_id: Optional[UUID] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List proposals with filters."""
    query = select(Proposal).where(Proposal.tenant_id == current_user.tenant_id)

    if status:
        query = query.where(Proposal.status == status)
    if deal_id:
        query = query.where(Proposal.deal_id == deal_id)
    if date_from:
        query = query.where(Proposal.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        query = query.where(Proposal.created_at <= datetime.fromisoformat(date_to))

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Proposal.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = [_proposal_dict(p) for p in result.scalars().all()]

    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.post("", status_code=201)
async def create_proposal(
    data: ProposalCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new proposal/quote."""
    engine = QuoteEngine(db)
    quote_data = QuoteCreate(
        tenant_id=str(current_user.tenant_id),
        deal_id=data.deal_id,
        lead_id=data.lead_id,
        title=data.title,
        currency=data.currency,
        industry=data.industry,
        validity_days=data.validity_days,
        vat_registration_number=data.vat_registration_number,
        client_name=data.client_name,
        client_company=data.client_company,
        notes_ar=data.notes_ar,
    )
    return await engine.create_quote(quote_data)


@router.get("/analytics")
async def proposal_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Win rate, average deal size, time-to-close analytics."""
    tid = current_user.tenant_id

    total_q = select(func.count()).where(Proposal.tenant_id == tid)
    total = (await db.execute(total_q)).scalar() or 0

    accepted_q = select(func.count()).where(
        Proposal.tenant_id == tid, Proposal.status == QuoteStatus.ACCEPTED.value,
    )
    accepted = (await db.execute(accepted_q)).scalar() or 0

    rejected_q = select(func.count()).where(
        Proposal.tenant_id == tid, Proposal.status == QuoteStatus.REJECTED.value,
    )
    rejected = (await db.execute(rejected_q)).scalar() or 0

    avg_value_q = select(func.avg(Proposal.total_amount)).where(
        Proposal.tenant_id == tid, Proposal.status == QuoteStatus.ACCEPTED.value,
    )
    avg_value = (await db.execute(avg_value_q)).scalar()

    decided = accepted + rejected
    win_rate = round((accepted / decided) * 100, 1) if decided > 0 else 0.0

    return {
        "total_proposals": total,
        "accepted": accepted,
        "rejected": rejected,
        "win_rate_percent": win_rate,
        "average_deal_value": float(avg_value) if avg_value else 0.0,
        "currency": "SAR",
    }


@router.get("/{proposal_id}")
async def get_proposal(
    proposal_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get full proposal details."""
    result = await db.execute(
        select(Proposal).where(
            Proposal.id == proposal_id,
            Proposal.tenant_id == current_user.tenant_id,
        )
    )
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="عرض السعر غير موجود")
    return _proposal_dict(proposal)


@router.put("/{proposal_id}")
async def update_proposal(
    proposal_id: UUID,
    data: ProposalUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update proposal metadata."""
    result = await db.execute(
        select(Proposal).where(
            Proposal.id == proposal_id,
            Proposal.tenant_id == current_user.tenant_id,
        )
    )
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="عرض السعر غير موجود")

    if data.title is not None:
        proposal.title = data.title
    if data.notes_ar is not None:
        content = dict(proposal.content)
        content["notes_ar"] = data.notes_ar
        proposal.content = content
    if data.vat_registration_number is not None:
        content = dict(proposal.content)
        content["vat_registration_number"] = data.vat_registration_number
        proposal.content = content

    await db.flush()
    await db.refresh(proposal)
    return _proposal_dict(proposal)


@router.post("/{proposal_id}/items")
async def add_line_item(
    proposal_id: UUID,
    item: LineItemInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a line item to the quote."""
    engine = QuoteEngine(db)
    return await engine.add_line_item(str(current_user.tenant_id), str(proposal_id), item)


@router.post("/{proposal_id}/discount")
async def apply_discount(
    proposal_id: UUID,
    discount: DiscountInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Apply a discount to the quote."""
    engine = QuoteEngine(db)
    return await engine.apply_discount(str(current_user.tenant_id), str(proposal_id), discount)


@router.post("/{proposal_id}/send")
async def send_proposal(
    proposal_id: UUID,
    data: SendRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send proposal via WhatsApp or Email."""
    engine = QuoteEngine(db)
    return await engine.send_quote(
        str(current_user.tenant_id), str(proposal_id), data.channel, data.recipient,
    )


@router.post("/{proposal_id}/accept")
async def accept_proposal(
    proposal_id: UUID,
    data: AcceptRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Client acceptance endpoint."""
    result = await db.execute(
        select(Proposal).where(
            Proposal.id == proposal_id,
            Proposal.tenant_id == current_user.tenant_id,
        )
    )
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="عرض السعر غير موجود")
    if proposal.status == QuoteStatus.EXPIRED.value:
        raise HTTPException(status_code=400, detail="عرض السعر منتهي الصلاحية")

    proposal.status = QuoteStatus.ACCEPTED.value
    content = dict(proposal.content)
    content["acceptance"] = {
        "signature": data.client_signature,
        "notes": data.notes,
        "accepted_at": datetime.now(timezone.utc).isoformat(),
    }
    proposal.content = content
    await db.flush()
    await db.refresh(proposal)
    return _proposal_dict(proposal)


@router.get("/{proposal_id}/pdf")
async def generate_pdf_data(
    proposal_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate PDF-ready data for a proposal."""
    result = await db.execute(
        select(Proposal).where(
            Proposal.id == proposal_id,
            Proposal.tenant_id == current_user.tenant_id,
        )
    )
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="عرض السعر غير موجود")

    generator = ProposalGenerator()
    ai_req = ProposalInput(
        deal_title=proposal.title,
        client_name=proposal.content.get("client_name", ""),
        client_company=proposal.content.get("client_company", ""),
        industry=proposal.content.get("industry", "services"),
        deal_value=float(proposal.total_amount) if proposal.total_amount else 0.0,
        currency=proposal.currency or "SAR",
        requirements=proposal.content.get("notes_ar", ""),
        language="both",
    )
    ai_proposal = await generator.generate_proposal(ai_req)
    return await generator.export_pdf_data(ai_proposal)


# ── Helpers ──────────────────────────────────────

def _proposal_dict(p: Proposal) -> dict:
    return {
        "id": str(p.id),
        "tenant_id": str(p.tenant_id),
        "deal_id": str(p.deal_id) if p.deal_id else None,
        "lead_id": str(p.lead_id) if p.lead_id else None,
        "title": p.title,
        "content": p.content,
        "total_amount": str(p.total_amount) if p.total_amount else "0",
        "currency": p.currency,
        "status": p.status,
        "valid_until": p.valid_until.isoformat() if p.valid_until else None,
        "sent_at": p.sent_at.isoformat() if p.sent_at else None,
        "viewed_at": p.viewed_at.isoformat() if p.viewed_at else None,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }
