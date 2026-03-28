from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.database import get_db
from app.api.deps import get_current_user, get_current_tenant, require_role
from app.models.user import User
from app.models.tenant import Tenant

router = APIRouter()


class TenantResponse(BaseModel):
    id: UUID
    name: str
    name_ar: Optional[str]
    slug: str
    industry: Optional[str]
    plan: str
    logo_url: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    whatsapp_number: Optional[str]
    settings: Optional[dict]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TenantUpdate(BaseModel):
    name: Optional[str] = None
    name_ar: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    whatsapp_number: Optional[str] = None
    industry: Optional[str] = None
    settings: Optional[dict] = None


@router.get("", response_model=TenantResponse)
async def get_tenant(tenant: Tenant = Depends(get_current_tenant)):
    return TenantResponse.model_validate(tenant)


@router.put("", response_model=TenantResponse)
async def update_tenant(
    data: TenantUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(require_role("owner", "admin")),
    db: AsyncSession = Depends(get_db),
):
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(tenant, field, value)

    await db.flush()
    await db.refresh(tenant)
    return TenantResponse.model_validate(tenant)
