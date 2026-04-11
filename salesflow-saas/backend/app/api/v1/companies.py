from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel as Schema

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.company import Company

router = APIRouter()


class CompanyCreate(Schema):
    name: str
    name_ar: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    source: Optional[str] = None
    affiliate_id: Optional[UUID] = None
    notes: Optional[str] = None
    metadata: Optional[dict] = None


class CompanyUpdate(Schema):
    name: Optional[str] = None
    name_ar: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class CompanyResponse(Schema):
    id: UUID
    tenant_id: UUID
    name: str
    name_ar: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    source: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CompanyListResponse(Schema):
    items: list[CompanyResponse]
    total: int
    page: int
    per_page: int


@router.get("", response_model=CompanyListResponse)
async def list_companies(
    search: str = Query(None),
    industry: str = Query(None),
    city: str = Query(None),
    is_active: bool = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Company).where(Company.tenant_id == current_user.tenant_id)
    if search:
        query = query.where(Company.name.ilike(f"%{search}%") | Company.email.ilike(f"%{search}%"))
    if industry:
        query = query.where(Company.industry == industry)
    if city:
        query = query.where(Company.city == city)
    if is_active is not None:
        query = query.where(Company.is_active == is_active)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.order_by(Company.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = [CompanyResponse.model_validate(c) for c in result.scalars().all()]
    return CompanyListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Company).where(Company.id == company_id, Company.tenant_id == current_user.tenant_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return CompanyResponse.model_validate(company)


@router.post("", response_model=CompanyResponse, status_code=201)
async def create_company(
    data: CompanyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    company = Company(tenant_id=current_user.tenant_id, **data.model_dump(exclude_none=True))
    db.add(company)
    await db.flush()
    await db.refresh(company)
    return CompanyResponse.model_validate(company)


@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: UUID,
    data: CompanyUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Company).where(Company.id == company_id, Company.tenant_id == current_user.tenant_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(company, field, value)
    await db.flush()
    await db.refresh(company)
    return CompanyResponse.model_validate(company)


@router.delete("/{company_id}", status_code=204)
async def delete_company(
    company_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Company).where(Company.id == company_id, Company.tenant_id == current_user.tenant_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company.is_active = False
    await db.flush()
