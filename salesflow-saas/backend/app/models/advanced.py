"""Trust Score & Prospect models — new additions to Dealix architecture."""
import enum
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, Boolean, Enum, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import TenantModel, BaseModel


# ─── Trust Score ───────────────────────────────────────────────

class EntityType(str, enum.Enum):
    AFFILIATE = "affiliate"
    LEAD = "lead"
    COMPANY = "company"
    CONTACT = "contact"


class TrustScore(TenantModel):
    """Trust assessment for affiliates, leads, and companies.
    Helps the system focus effort on people who actually buy/perform."""
    __tablename__ = "trust_scores"

    entity_type = Column(Enum(EntityType), nullable=False, index=True)
    entity_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Composite score (0-100)
    score = Column(Float, default=50.0, nullable=False)

    # Breakdown dimensions
    engagement_score = Column(Float, default=50.0)      # Response rate, activity level
    conversion_score = Column(Float, default=50.0)       # Historical conversion rate
    reliability_score = Column(Float, default=50.0)      # Show-up rate, commitment
    quality_score = Column(Float, default=50.0)           # Lead quality, deal value

    # Signals
    positive_signals = Column(JSONB, default=[])           # List of positive indicators
    negative_signals = Column(JSONB, default=[])           # List of risk indicators
    last_computed_at = Column(DateTime(timezone=True))

    # History
    history = Column(JSONB, default=[])                    # Score history over time


# ─── Prospect (pre-lead, from scraping) ───────────────────────

class ProspectStatus(str, enum.Enum):
    IDENTIFIED = "identified"
    RESEARCHING = "researching"
    APPROACHING = "approaching"
    ENGAGED = "engaged"
    CONVERTED = "converted"
    DISQUALIFIED = "disqualified"


class Prospect(TenantModel):
    """Pre-lead record created by the AI Lead Generator from scraping.
    Gets promoted to a Lead when qualified."""
    __tablename__ = "prospects"

    # Source data
    source = Column(String(50), nullable=False, index=True)   # google_maps, linkedin, saudi_registry
    source_url = Column(String(1000), nullable=True)
    source_id = Column(String(255), nullable=True)            # External ID from source

    # Business info
    company_name = Column(String(255), nullable=True)
    company_name_ar = Column(String(255), nullable=True)
    sector = Column(String(100), nullable=True, index=True)
    website = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)

    # Contact info
    contact_name = Column(String(255), nullable=True)
    contact_title = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    whatsapp = Column(String(20), nullable=True)

    # AI analysis
    status = Column(Enum(ProspectStatus), default=ProspectStatus.IDENTIFIED, nullable=False)
    buying_intent_score = Column(Float, default=0.0)      # AI-computed 0-100
    estimated_value = Column(Float, default=0.0)           # Estimated deal size SAR
    fit_score = Column(Float, default=0.0)                  # Product-market fit 0-100
    priority = Column(String(20), default="medium")        # low, medium, high, critical

    # Enrichment data
    enrichment_data = Column(JSONB, default={})             # Raw scraped/enriched data
    notes = Column(Text, nullable=True)

    # Conversion
    converted_to_lead_id = Column(UUID(as_uuid=True), nullable=True)
    converted_at = Column(DateTime(timezone=True), nullable=True)


# ─── Scorecard ─────────────────────────────────────────────────

class Scorecard(TenantModel):
    """Performance scorecard for sales agents and affiliates."""
    __tablename__ = "scorecards"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    period = Column(Date, nullable=False)
    period_type = Column(String(20), default="monthly")  # weekly, monthly, quarterly

    # Activity metrics
    leads_handled = Column(Integer, default=0)
    calls_made = Column(Integer, default=0)
    meetings_booked = Column(Integer, default=0)
    meetings_completed = Column(Integer, default=0)

    # Outcome metrics
    deals_closed = Column(Integer, default=0)
    revenue_generated = Column(Float, default=0.0)
    avg_deal_size = Column(Float, default=0.0)

    # Quality metrics
    avg_response_time_seconds = Column(Integer, default=0)
    customer_satisfaction = Column(Float, default=0.0)    # 0-5
    ai_assist_rate = Column(Float, default=0.0)            # % of AI-assisted interactions

    # Composite
    composite_score = Column(Float, default=0.0)           # Weighted aggregate

    user = relationship("User")


# ─── AI Rehearsal (Meeting Preview) ────────────────────────────

class AIRehearsal(TenantModel):
    """AI-powered meeting rehearsal — simulates the upcoming meeting
    so the sales rep can practice the best closing strategy."""
    __tablename__ = "ai_rehearsals"

    meeting_id = Column(UUID(as_uuid=True), ForeignKey("auto_bookings.id"), nullable=True)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)   # Sales rep

    # Context
    client_profile_summary = Column(Text, nullable=True)       # AI-generated summary of client
    industry_insights = Column(Text, nullable=True)             # Relevant sector intelligence
    predicted_objections = Column(JSONB, default=[])            # Expected objections
    recommended_approach = Column(Text, nullable=True)          # AI closing strategy
    talking_points = Column(JSONB, default=[])                  # Key talking points
    competitive_intel = Column(Text, nullable=True)             # Competitor positioning

    # Rehearsal session
    rehearsal_transcript = Column(JSONB, default=[])            # Simulated conversation
    feedback = Column(Text, nullable=True)                      # AI feedback on performance
    readiness_score = Column(Float, default=0.0)                # 0-100

    # Status
    status = Column(String(20), default="pending")             # pending, in_progress, completed
    completed_at = Column(DateTime(timezone=True), nullable=True)

    meeting = relationship("AutoBooking")
    lead = relationship("Lead")
    user = relationship("User")
