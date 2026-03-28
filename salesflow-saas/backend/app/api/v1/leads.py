from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadUpdate, LeadResponse, LeadListResponse

router = APIRouter()


@router.get("", response_model=LeadListResponse)
async def list_leads(
    status: str = Query(None),
    source: str = Query(None),
    assigned_to: UUID = Query(None),
    search: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Lead).where(Lead.tenant_id == current_user.tenant_id)

    if status:
        query = query.where(Lead.status == status)
    if source:
        query = query.where(Lead.source == source)
    if assigned_to:
        query = query.where(Lead.assigned_to == assigned_to)
    if search:
        query = query.where(Lead.name.ilike(f"%{search}%") | Lead.phone.ilike(f"%{search}%") | Lead.email.ilike(f"%{search}%"))

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar()

    query = query.order_by(Lead.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    leads = result.scalars().all()

    return LeadListResponse(items=[LeadResponse.model_validate(l) for l in leads], total=total, page=page, per_page=per_page)


@router.post("", response_model=LeadResponse, status_code=201)
async def create_lead(
    data: LeadCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    lead = Lead(tenant_id=current_user.tenant_id, **data.model_dump(exclude_none=True))
    db.add(lead)
    await db.flush()
    await db.refresh(lead)
    return LeadResponse.model_validate(lead)


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Lead).where(Lead.id == lead_id, Lead.tenant_id == current_user.tenant_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return LeadResponse.model_validate(lead)


@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: UUID,
    data: LeadUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Lead).where(Lead.id == lead_id, Lead.tenant_id == current_user.tenant_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(lead, field, value)

    await db.flush()
    await db.refresh(lead)
    return LeadResponse.model_validate(lead)


@router.post("/{lead_id}/assign", response_model=LeadResponse)
async def assign_lead(
    lead_id: UUID,
    assigned_to: UUID = Query(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Lead).where(Lead.id == lead_id, Lead.tenant_id == current_user.tenant_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    lead.assigned_to = assigned_to
    await db.flush()
    await db.refresh(lead)
    return LeadResponse.model_validate(lead)
