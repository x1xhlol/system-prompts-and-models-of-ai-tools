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
from app.models.company import Contact

router = APIRouter()


class ContactCreate(Schema):
    company_id: UUID
    full_name: str
    role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_decision_maker: bool = False
    preferred_language: str = "ar"
    preferred_channel: str = "whatsapp"
    notes: Optional[str] = None


class ContactUpdate(Schema):
    full_name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_decision_maker: Optional[bool] = None
    preferred_language: Optional[str] = None
    preferred_channel: Optional[str] = None
    notes: Optional[str] = None


class ContactResponse(Schema):
    id: UUID
    tenant_id: UUID
    company_id: UUID
    full_name: str
    role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_decision_maker: bool
    preferred_language: str
    preferred_channel: str
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ContactListResponse(Schema):
    items: list[ContactResponse]
    total: int
    page: int
    per_page: int


@router.get("", response_model=ContactListResponse)
async def list_contacts(
    company_id: UUID = Query(None),
    search: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Contact).where(Contact.tenant_id == current_user.tenant_id)
    if company_id:
        query = query.where(Contact.company_id == company_id)
    if search:
        query = query.where(Contact.full_name.ilike(f"%{search}%") | Contact.email.ilike(f"%{search}%") | Contact.phone.ilike(f"%{search}%"))

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.order_by(Contact.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = [ContactResponse.model_validate(c) for c in result.scalars().all()]
    return ContactListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Contact).where(Contact.id == contact_id, Contact.tenant_id == current_user.tenant_id))
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return ContactResponse.model_validate(contact)


@router.post("", response_model=ContactResponse, status_code=201)
async def create_contact(
    data: ContactCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    contact = Contact(tenant_id=current_user.tenant_id, **data.model_dump(exclude_none=True))
    db.add(contact)
    await db.flush()
    await db.refresh(contact)
    return ContactResponse.model_validate(contact)


@router.put("/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: UUID,
    data: ContactUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Contact).where(Contact.id == contact_id, Contact.tenant_id == current_user.tenant_id))
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(contact, field, value)
    await db.flush()
    await db.refresh(contact)
    return ContactResponse.model_validate(contact)


@router.delete("/{contact_id}", status_code=204)
async def delete_contact(
    contact_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Contact).where(Contact.id == contact_id, Contact.tenant_id == current_user.tenant_id))
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    await db.delete(contact)
    await db.flush()
