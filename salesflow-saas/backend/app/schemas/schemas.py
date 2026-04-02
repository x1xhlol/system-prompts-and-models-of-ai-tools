"""Pydantic schemas for request/response validation."""
from datetime import datetime, date
from typing import Optional, List, Any
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


# ── Auth Schemas ────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)
    full_name: str
    company_name: str
    industry: Optional[str] = None
    phone: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: "UserResponse"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


# ── User Schemas ────────────────────────────────────────────────

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    email: str
    full_name: Optional[str] = None
    full_name_ar: Optional[str] = None
    role: str
    phone: Optional[str] = None
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    full_name_ar: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(BaseModel):
    email: str
    password: str = Field(min_length=8)
    full_name: str
    role: str = "agent"
    phone: Optional[str] = None


# ── Tenant Schemas ──────────────────────────────────────────────

class TenantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    name_ar: Optional[str] = None
    slug: str
    industry: Optional[str] = None
    plan: str
    is_active: bool
    created_at: datetime

class TenantUpdate(BaseModel):
    name: Optional[str] = None
    name_ar: Optional[str] = None
    industry: Optional[str] = None
    logo_url: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    whatsapp_number: Optional[str] = None
    settings: Optional[dict] = None


# ── Lead Schemas ────────────────────────────────────────────────

class LeadCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    source: Optional[str] = "manual"
    company_name: Optional[str] = None
    sector: Optional[str] = None
    city: Optional[str] = None
    notes: Optional[str] = None
    extra_metadata: Optional[dict] = None

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None
    score: Optional[int] = None
    assigned_to: Optional[UUID] = None
    notes: Optional[str] = None
    extra_metadata: Optional[dict] = None

class LeadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    tenant_id: UUID
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    source: Optional[str] = None
    status: str
    score: int
    notes: Optional[str] = None
    extra_metadata: Optional[dict] = None
    assigned_to: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class LeadQualifyResponse(BaseModel):
    lead_id: UUID
    score: int
    status: str
    reasoning: str
    suggested_action: str
    bant_analysis: dict


# ── Deal Schemas ────────────────────────────────────────────────

class DealCreate(BaseModel):
    title: str
    lead_id: Optional[UUID] = None
    value: Optional[float] = None
    currency: str = "SAR"
    stage: str = "new"
    probability: int = 0
    expected_close_date: Optional[date] = None
    notes: Optional[str] = None

class DealUpdate(BaseModel):
    title: Optional[str] = None
    value: Optional[float] = None
    stage: Optional[str] = None
    probability: Optional[int] = None
    expected_close_date: Optional[date] = None
    notes: Optional[str] = None
    assigned_to: Optional[UUID] = None

class DealResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    tenant_id: UUID
    lead_id: Optional[UUID] = None
    customer_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    title: str
    value: Optional[float] = None
    currency: str
    stage: str
    probability: int
    expected_close_date: Optional[date] = None
    closed_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


# ── Company Schemas ─────────────────────────────────────────────

class CompanyCreate(BaseModel):
    name: str
    name_ar: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
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
    is_active: bool
    created_at: datetime


# ── Contact Schemas ─────────────────────────────────────────────

class ContactCreate(BaseModel):
    company_id: UUID
    full_name: str
    role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_decision_maker: bool = False
    preferred_language: str = "ar"
    preferred_channel: str = "whatsapp"

class ContactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
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
    created_at: datetime


# ── Meeting Schemas ─────────────────────────────────────────────

class MeetingCreate(BaseModel):
    lead_id: Optional[UUID] = None
    meeting_type: str = "demo"
    meeting_datetime: datetime
    duration_minutes: int = 30
    client_name: str
    client_phone: Optional[str] = None
    client_email: Optional[str] = None
    client_company: Optional[str] = None
    assigned_sales_rep: Optional[UUID] = None
    notes: Optional[str] = None

class MeetingUpdate(BaseModel):
    meeting_datetime: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    outcome: Optional[str] = None

class MeetingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    tenant_id: UUID
    lead_id: Optional[UUID] = None
    meeting_type: str
    meeting_datetime: datetime
    duration_minutes: int
    client_name: str
    client_company: Optional[str] = None
    status: str
    assigned_sales_rep: Optional[UUID] = None
    notes: Optional[str] = None
    outcome: Optional[str] = None
    created_at: datetime


# ── AI Agent Schemas ────────────────────────────────────────────

class AgentInvokeRequest(BaseModel):
    agent_type: str
    input_data: dict
    lead_id: Optional[UUID] = None
    conversation_id: Optional[UUID] = None
    async_mode: bool = True

class AgentInvokeResponse(BaseModel):
    task_id: Optional[str] = None
    agent_type: str
    status: str  # queued, processing, completed, error
    output: Optional[dict] = None
    tokens_used: Optional[int] = None
    latency_ms: Optional[int] = None

class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    tenant_id: UUID
    channel: str
    status: str
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_company: Optional[str] = None
    messages_count: int
    sentiment_score: int
    interest_level: int
    qualified: bool
    meeting_booked: bool
    last_message_at: Optional[datetime] = None
    created_at: datetime


# ── Affiliate Schemas ───────────────────────────────────────────

class AffiliateCreate(BaseModel):
    full_name: str
    full_name_ar: Optional[str] = None
    email: str
    phone: str
    whatsapp: Optional[str] = None
    city: Optional[str] = None
    notes: Optional[str] = None

class AffiliateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    full_name: str
    full_name_ar: Optional[str] = None
    email: str
    phone: str
    status: str
    referral_code: Optional[str] = None
    total_leads_generated: int
    total_deals_closed: int
    total_commission_earned: float
    created_at: datetime


# ── Commission Schemas ──────────────────────────────────────────

class CommissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    affiliate_id: UUID
    deal_id: UUID
    amount: float
    rate: float
    status: str
    approved_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    created_at: datetime


# ── Dashboard Schemas ───────────────────────────────────────────

class DashboardSummary(BaseModel):
    total_leads: int = 0
    new_leads_today: int = 0
    qualified_leads: int = 0
    active_conversations: int = 0
    meetings_today: int = 0
    meetings_this_week: int = 0
    total_deals: int = 0
    deals_won: int = 0
    pipeline_value: float = 0.0
    revenue_this_month: float = 0.0
    active_affiliates: int = 0
    ai_conversations_today: int = 0

class PipelineSummary(BaseModel):
    stage: str
    count: int
    total_value: float

class RevenueMetrics(BaseModel):
    period: str
    revenue: float
    deals_closed: int
    avg_deal_size: float


# ── Pagination ──────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    pages: int
