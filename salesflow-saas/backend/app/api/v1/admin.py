from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel as Schema

from app.database import get_db
from app.api.deps import require_role
from app.models.user import User
from app.models.tenant import Tenant
from app.models.lead import Lead
from app.models.deal import Deal
from app.models.customer import Customer
from app.models.subscription import Subscription
from app.models.affiliate import AffiliateMarketer
from app.models.commission import Commission
from app.models.compliance import Policy

router = APIRouter()


class SystemStats(Schema):
    total_tenants: int
    total_users: int
    total_leads: int
    total_deals: int
    total_customers: int
    total_subscriptions: int
    total_affiliates: int
    total_commissions: float


class UserResponse(Schema):
    id: UUID
    tenant_id: UUID
    email: str
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserListResponse(Schema):
    items: list[UserResponse]
    total: int
    page: int
    per_page: int


class UserUpdate(Schema):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class SettingResponse(Schema):
    key: str
    title: str
    title_ar: Optional[str] = None
    version: int
    is_active: bool

    model_config = {"from_attributes": True}


@router.get("/stats", response_model=SystemStats)
async def system_stats(
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    tenants = (await db.execute(select(func.count(Tenant.id)))).scalar() or 0
    users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    leads = (await db.execute(select(func.count(Lead.id)))).scalar() or 0
    deals = (await db.execute(select(func.count(Deal.id)))).scalar() or 0
    customers = (await db.execute(select(func.count(Customer.id)))).scalar() or 0
    subscriptions = (await db.execute(select(func.count(Subscription.id)))).scalar() or 0
    affiliates = (await db.execute(select(func.count(AffiliateMarketer.id)))).scalar() or 0
    commissions_total = (await db.execute(select(func.coalesce(func.sum(Commission.amount), 0)))).scalar() or 0

    return SystemStats(
        total_tenants=tenants,
        total_users=users,
        total_leads=leads,
        total_deals=deals,
        total_customers=customers,
        total_subscriptions=subscriptions,
        total_affiliates=affiliates,
        total_commissions=float(commissions_total),
    )


@router.get("/users", response_model=UserListResponse)
async def list_users(
    role: str = Query(None),
    is_active: bool = Query(None),
    search: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    query = select(User).where(User.tenant_id == current_user.tenant_id)
    if role:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    if search:
        query = query.where(User.email.ilike(f"%{search}%") | User.full_name.ilike(f"%{search}%"))

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = [UserResponse.model_validate(u) for u in result.scalars().all()]
    return UserListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id, User.tenant_id == current_user.tenant_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user)


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    data: UserUpdate,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id, User.tenant_id == current_user.tenant_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    await db.flush()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.delete("/users/{user_id}", status_code=204)
async def deactivate_user(
    user_id: UUID,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    result = await db.execute(select(User).where(User.id == user_id, User.tenant_id == current_user.tenant_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    await db.flush()


@router.get("/settings", response_model=list[SettingResponse])
async def list_settings(
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Policy).where(Policy.is_active == True).order_by(Policy.key))
    return [SettingResponse.model_validate(p) for p in result.scalars().all()]


@router.get("/settings/{key}", response_model=dict)
async def get_setting(
    key: str,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Policy).where(Policy.key == key))
    policy = result.scalar_one_or_none()
    if not policy:
        raise HTTPException(status_code=404, detail="Setting not found")
    return {
        "key": policy.key,
        "title": policy.title,
        "title_ar": policy.title_ar,
        "content": policy.content,
        "content_ar": policy.content_ar,
        "version": policy.version,
        "is_active": policy.is_active,
    }
