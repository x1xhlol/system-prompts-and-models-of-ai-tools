from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr
from uuid import UUID
import uuid

from app.database import get_db
from app.models.affiliate import AffiliateMarketer, AffiliatePerformance, AffiliateDeal, AffiliateStatus

router = APIRouter(prefix="/affiliates", tags=["affiliates"])


# ─── Schemas ─────────────────────────────────────────────

class AffiliateRegisterRequest(BaseModel):
    full_name: str
    full_name_ar: Optional[str] = None
    email: EmailStr
    phone: str
    whatsapp: Optional[str] = None
    city: Optional[str] = None
    national_id: Optional[str] = None


class AffiliateResponse(BaseModel):
    id: UUID
    full_name: str
    email: str
    phone: str
    status: str
    referral_code: str
    total_deals_closed: int
    total_commission_earned: float
    current_month_deals: int

    class Config:
        from_attributes = True


class AffiliateDealRequest(BaseModel):
    client_company: str
    client_contact: Optional[str] = None
    client_phone: Optional[str] = None
    client_email: Optional[str] = None
    plan_type: str  # basic, professional, enterprise


class AffiliatePerformanceResponse(BaseModel):
    month: str
    leads_generated: int
    calls_made: int
    meetings_booked: int
    deals_closed: int
    commission_earned: float
    bonus_earned: float
    payment_status: str


# ─── Commission Rates ────────────────────────────────────

COMMISSION_RATES = {
    "basic": {"price": 299, "rate": 0.15},
    "professional": {"price": 699, "rate": 0.20},
    "enterprise": {"price": 1499, "rate": 0.25},
}

BONUS_TIERS = [
    {"min_deals": 5, "bonus": 500},
    {"min_deals": 10, "bonus": 1500},
    {"min_deals": 15, "bonus": 3000},
]


def generate_referral_code() -> str:
    return f"DLX-{uuid.uuid4().hex[:8].upper()}"


# ─── Endpoints ───────────────────────────────────────────

@router.post("/register", response_model=AffiliateResponse, status_code=status.HTTP_201_CREATED)
async def register_affiliate(data: AffiliateRegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new affiliate marketer."""
    existing = await db.execute(
        select(AffiliateMarketer).where(AffiliateMarketer.email == data.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    affiliate = AffiliateMarketer(
        full_name=data.full_name,
        full_name_ar=data.full_name_ar,
        email=data.email,
        phone=data.phone,
        whatsapp=data.whatsapp or data.phone,
        city=data.city,
        national_id=data.national_id,
        status=AffiliateStatus.PENDING,
        referral_code=generate_referral_code(),
    )
    db.add(affiliate)
    await db.commit()
    await db.refresh(affiliate)
    return affiliate


@router.get("/{affiliate_id}", response_model=AffiliateResponse)
async def get_affiliate(affiliate_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get affiliate details."""
    result = await db.execute(
        select(AffiliateMarketer).where(AffiliateMarketer.id == affiliate_id)
    )
    affiliate = result.scalar_one_or_none()
    if not affiliate:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    return affiliate


@router.post("/{affiliate_id}/activate", response_model=AffiliateResponse)
async def activate_affiliate(affiliate_id: UUID, db: AsyncSession = Depends(get_db)):
    """Activate an affiliate after onboarding."""
    result = await db.execute(
        select(AffiliateMarketer).where(AffiliateMarketer.id == affiliate_id)
    )
    affiliate = result.scalar_one_or_none()
    if not affiliate:
        raise HTTPException(status_code=404, detail="Affiliate not found")

    affiliate.status = AffiliateStatus.ACTIVE
    affiliate.onboarded_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(affiliate)
    return affiliate


@router.post("/{affiliate_id}/deals", status_code=status.HTTP_201_CREATED)
async def submit_deal(
    affiliate_id: UUID,
    data: AffiliateDealRequest,
    db: AsyncSession = Depends(get_db),
):
    """Submit a new deal for commission tracking."""
    result = await db.execute(
        select(AffiliateMarketer).where(AffiliateMarketer.id == affiliate_id)
    )
    affiliate = result.scalar_one_or_none()
    if not affiliate:
        raise HTTPException(status_code=404, detail="Affiliate not found")

    if data.plan_type not in COMMISSION_RATES:
        raise HTTPException(status_code=400, detail="Invalid plan type")

    rate_info = COMMISSION_RATES[data.plan_type]
    commission = rate_info["price"] * rate_info["rate"]

    deal = AffiliateDeal(
        affiliate_id=affiliate_id,
        client_company=data.client_company,
        client_contact=data.client_contact,
        client_phone=data.client_phone,
        client_email=data.client_email,
        plan_type=data.plan_type,
        plan_price=rate_info["price"],
        commission_rate=rate_info["rate"],
        commission_amount=commission,
    )
    db.add(deal)

    # Update affiliate counters
    affiliate.total_deals_closed += 1
    affiliate.current_month_deals += 1
    affiliate.total_commission_earned += commission

    # Auto-employ if target reached (10 deals/month)
    if affiliate.current_month_deals >= 10 and affiliate.status == AffiliateStatus.ACTIVE:
        affiliate.status = AffiliateStatus.EMPLOYED
        affiliate.employed_at = datetime.now(timezone.utc)

    await db.commit()
    return {"message": "Deal submitted successfully", "commission": commission}


@router.get("/{affiliate_id}/performance", response_model=list[AffiliatePerformanceResponse])
async def get_performance(affiliate_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get affiliate performance history."""
    result = await db.execute(
        select(AffiliatePerformance)
        .where(AffiliatePerformance.affiliate_id == affiliate_id)
        .order_by(AffiliatePerformance.month.desc())
    )
    return result.scalars().all()


@router.get("/leaderboard/top")
async def get_leaderboard(limit: int = 10, db: AsyncSession = Depends(get_db)):
    """Get top performing affiliates."""
    result = await db.execute(
        select(AffiliateMarketer)
        .where(AffiliateMarketer.status.in_([AffiliateStatus.ACTIVE, AffiliateStatus.EMPLOYED]))
        .order_by(AffiliateMarketer.total_deals_closed.desc())
        .limit(limit)
    )
    affiliates = result.scalars().all()
    return [
        {
            "name": a.full_name,
            "deals": a.total_deals_closed,
            "commission": a.total_commission_earned,
            "status": a.status.value,
        }
        for a in affiliates
    ]
