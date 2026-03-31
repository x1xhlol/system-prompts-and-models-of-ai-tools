from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel as Schema

from app.database import get_db
from app.api.deps import get_current_user, require_role
from app.models.user import User
from app.models.compliance import Complaint, ComplaintStatus

router = APIRouter()


class ComplaintCreate(Schema):
    complainant_name: str
    complainant_phone: Optional[str] = None
    complainant_email: Optional[str] = None
    type: str
    subject: str
    description: Optional[str] = None


class ComplaintUpdate(Schema):
    complainant_name: Optional[str] = None
    complainant_phone: Optional[str] = None
    complainant_email: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None


class ComplaintResponse(Schema):
    id: UUID
    tenant_id: Optional[UUID] = None
    complainant_name: str
    complainant_phone: Optional[str] = None
    complainant_email: Optional[str] = None
    type: str
    status: str
    subject: str
    description: Optional[str] = None
    resolution: Optional[str] = None
    assigned_to: Optional[UUID] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ComplaintListResponse(Schema):
    items: list[ComplaintResponse]
    total: int
    page: int
    per_page: int


class AssignRequest(Schema):
    user_id: UUID


class ResolveRequest(Schema):
    resolution: str


@router.get("", response_model=ComplaintListResponse)
async def list_complaints(
    type: str = Query(None),
    status: str = Query(None),
    assigned_to: UUID = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Complaint).where(Complaint.tenant_id == current_user.tenant_id)
    if type:
        query = query.where(Complaint.type == type)
    if status:
        query = query.where(Complaint.status == status)
    if assigned_to:
        query = query.where(Complaint.assigned_to == assigned_to)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.order_by(Complaint.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = [ComplaintResponse.model_validate(c) for c in result.scalars().all()]
    return ComplaintListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(
    complaint_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return ComplaintResponse.model_validate(complaint)


@router.post("", response_model=ComplaintResponse, status_code=201)
async def create_complaint(
    data: ComplaintCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    complaint = Complaint(
        tenant_id=current_user.tenant_id,
        status=ComplaintStatus.RECEIVED,
        **data.model_dump(exclude_none=True),
    )
    db.add(complaint)
    await db.flush()
    await db.refresh(complaint)
    return ComplaintResponse.model_validate(complaint)


@router.put("/{complaint_id}", response_model=ComplaintResponse)
async def update_complaint(
    complaint_id: UUID,
    data: ComplaintUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if complaint.status == ComplaintStatus.RESOLVED:
        raise HTTPException(status_code=400, detail="Cannot update a resolved complaint")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(complaint, field, value)
    await db.flush()
    await db.refresh(complaint)
    return ComplaintResponse.model_validate(complaint)


@router.post("/{complaint_id}/assign", response_model=ComplaintResponse)
async def assign_complaint(
    complaint_id: UUID,
    data: AssignRequest,
    current_user: User = Depends(require_role("admin", "manager")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    complaint.assigned_to = data.user_id
    complaint.status = ComplaintStatus.INVESTIGATING
    await db.flush()
    await db.refresh(complaint)
    return ComplaintResponse.model_validate(complaint)


@router.post("/{complaint_id}/resolve", response_model=ComplaintResponse)
async def resolve_complaint(
    complaint_id: UUID,
    data: ResolveRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if complaint.status == ComplaintStatus.RESOLVED:
        raise HTTPException(status_code=400, detail="Complaint is already resolved")
    complaint.status = ComplaintStatus.RESOLVED
    complaint.resolution = data.resolution
    complaint.resolved_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(complaint)
    return ComplaintResponse.model_validate(complaint)


@router.delete("/{complaint_id}", status_code=204)
async def delete_complaint(
    complaint_id: UUID,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    await db.delete(complaint)
    await db.flush()
