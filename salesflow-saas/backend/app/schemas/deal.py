from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal


class DealCreate(BaseModel):
    title: str
    lead_id: Optional[UUID] = None
    customer_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    value: Optional[Decimal] = None
    currency: str = "SAR"
    stage: str = "new"
    probability: int = 0
    expected_close_date: Optional[date] = None
    notes: Optional[str] = None


class DealUpdate(BaseModel):
    title: Optional[str] = None
    value: Optional[Decimal] = None
    stage: Optional[str] = None
    probability: Optional[int] = None
    expected_close_date: Optional[date] = None
    assigned_to: Optional[UUID] = None
    notes: Optional[str] = None


class DealResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    title: str
    lead_id: Optional[UUID]
    customer_id: Optional[UUID]
    assigned_to: Optional[UUID]
    value: Optional[Decimal]
    currency: str
    stage: str
    probability: int
    expected_close_date: Optional[date]
    closed_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StageUpdate(BaseModel):
    stage: str


class PipelineResponse(BaseModel):
    stages: dict[str, list[DealResponse]]
    total_value: Decimal
    total_deals: int
