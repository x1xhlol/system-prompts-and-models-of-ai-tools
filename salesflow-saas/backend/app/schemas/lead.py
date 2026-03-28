from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class LeadCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    metadata: Optional[dict] = None


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    score: Optional[int] = None
    notes: Optional[str] = None
    assigned_to: Optional[UUID] = None
    metadata: Optional[dict] = None


class LeadResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    name: str
    phone: Optional[str]
    email: Optional[str]
    source: Optional[str]
    status: str
    score: int
    notes: Optional[str]
    metadata: Optional[dict]
    assigned_to: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LeadListResponse(BaseModel):
    items: list[LeadResponse]
    total: int
    page: int
    per_page: int
