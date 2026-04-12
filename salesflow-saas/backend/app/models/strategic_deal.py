"""
Strategic Deal Models — B2B deal discovery, matching, and negotiation.
نماذج الصفقات الاستراتيجية: اكتشاف وتوفيق وتفاوض الشراكات بين الشركات
"""

import enum
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, DateTime, Boolean, Float, Numeric, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.models.base import TenantModel
from app.models.compat import UUID, JSONB, default_uuid


# ── Enums ────────────────────────────────────────────────────────────────────


class DealType(str, enum.Enum):
    PARTNERSHIP = "partnership"
    DISTRIBUTION = "distribution"
    FRANCHISE = "franchise"
    JOINT_VENTURE = "jv"
    REFERRAL = "referral"
    ACQUISITION = "acquisition"
    BARTER = "barter"


class DealStatus(str, enum.Enum):
    DISCOVERY = "discovery"
    OUTREACH = "outreach"
    NEGOTIATING = "negotiating"
    TERM_SHEET = "term_sheet"
    DUE_DILIGENCE = "due_diligence"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"


class DealChannel(str, enum.Enum):
    WHATSAPP = "whatsapp"
    LINKEDIN = "linkedin"
    EMAIL = "email"
    IN_PERSON = "in_person"


class MatchStatus(str, enum.Enum):
    SUGGESTED = "suggested"
    APPROVED = "approved"
    OUTREACH_SENT = "outreach_sent"
    IN_PROGRESS = "in_progress"
    CONVERTED = "converted"
    REJECTED = "rejected"


# ── Company Profile ──────────────────────────────────────────────────────────


class CompanyProfile(TenantModel):
    """
    Rich company profile for B2B matching.
    ملف الشركة الغني للمطابقة بين الشركات
    """
    __tablename__ = "company_profiles"
    __table_args__ = (
        Index("ix_company_profiles_industry", "industry"),
        Index("ix_company_profiles_region", "region"),
        Index("ix_company_profiles_verified", "is_verified"),
    )

    company_name = Column(String(255), nullable=False, index=True)
    company_name_ar = Column(String(255), nullable=True)

    # Industry classification (ISIC codes)
    industry = Column(String(100), nullable=True)
    sub_industry = Column(String(100), nullable=True)

    # Saudi Commercial Registration
    cr_number = Column(String(20), nullable=True, unique=True)

    # Location
    city = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)  # Saudi administrative regions

    # Size indicators
    employee_count = Column(Numeric(10, 0), nullable=True)
    annual_revenue_sar = Column(Numeric(15, 2), nullable=True)

    # AI-enriched capability/need vectors (JSONB arrays)
    capabilities = Column(JSONB, default=list)   # What this company can offer
    needs = Column(JSONB, default=list)           # What this company needs

    # Deal preferences: partnership, acquisition, distribution, referral, barter weights
    deal_preferences = Column(JSONB, default=dict)

    # Contact & web
    website = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    whatsapp_number = Column(String(20), nullable=True)

    # Trust & verification
    trust_score = Column(Float, default=0.0)  # 0-1 from KYB verification
    is_verified = Column(Boolean, default=False)

    # Relationships
    initiated_deals = relationship(
        "StrategicDeal",
        back_populates="initiator_profile",
        foreign_keys="StrategicDeal.initiator_profile_id",
    )
    targeted_deals = relationship(
        "StrategicDeal",
        back_populates="target_profile",
        foreign_keys="StrategicDeal.target_profile_id",
    )
    matches_as_a = relationship(
        "DealMatch",
        back_populates="company_a",
        foreign_keys="DealMatch.company_a_id",
    )
    matches_as_b = relationship(
        "DealMatch",
        back_populates="company_b",
        foreign_keys="DealMatch.company_b_id",
    )


# ── Strategic Deal ───────────────────────────────────────────────────────────


class StrategicDeal(TenantModel):
    """
    A B2B deal between two companies.
    صفقة بين شركتين
    """
    __tablename__ = "strategic_deals"
    __table_args__ = (
        Index("ix_strategic_deals_status", "status"),
        Index("ix_strategic_deals_type", "deal_type"),
    )

    # Parties
    initiator_profile_id = Column(
        UUID(as_uuid=True), ForeignKey("company_profiles.id"), nullable=False, index=True,
    )
    target_profile_id = Column(
        UUID(as_uuid=True), ForeignKey("company_profiles.id"), nullable=True, index=True,
    )

    # Target info (when profile doesn't exist yet)
    target_company_name = Column(String(255), nullable=True)
    target_contact_phone = Column(String(20), nullable=True)
    target_contact_email = Column(String(255), nullable=True)

    # Deal classification
    deal_type = Column(String(30), default=DealType.PARTNERSHIP.value)
    deal_title = Column(String(500), nullable=False)
    deal_title_ar = Column(String(500), nullable=True)

    # Value proposition
    our_offer = Column(Text, nullable=True)   # What we're offering
    our_need = Column(Text, nullable=True)    # What we need from them

    # Terms
    proposed_terms = Column(JSONB, default=dict)  # equity_split, revenue_share, territory, exclusivity
    agreed_terms = Column(JSONB, default=dict)    # Final agreed terms

    estimated_value_sar = Column(Numeric(15, 2), nullable=True)

    # Status & channel
    status = Column(String(30), default=DealStatus.DISCOVERY.value)
    channel = Column(String(20), default=DealChannel.WHATSAPP.value)

    # AI signals
    ai_confidence = Column(Float, default=0.0)  # 0-1

    # Negotiation audit trail
    negotiation_history = Column(JSONB, default=list)  # list of round dicts

    # Notes
    notes = Column(Text, nullable=True)
    notes_ar = Column(Text, nullable=True)

    closed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    initiator_profile = relationship(
        "CompanyProfile", back_populates="initiated_deals",
        foreign_keys=[initiator_profile_id],
    )
    target_profile = relationship(
        "CompanyProfile", back_populates="targeted_deals",
        foreign_keys=[target_profile_id],
    )


# ── Deal Match ───────────────────────────────────────────────────────────────


class DealMatch(TenantModel):
    """
    AI-generated match between two companies.
    مطابقة بالذكاء الاصطناعي بين شركتين
    """
    __tablename__ = "deal_matches"
    __table_args__ = (
        Index("ix_deal_matches_score", "match_score"),
        Index("ix_deal_matches_status", "status"),
    )

    company_a_id = Column(
        UUID(as_uuid=True), ForeignKey("company_profiles.id"), nullable=False, index=True,
    )
    company_b_id = Column(
        UUID(as_uuid=True), ForeignKey("company_profiles.id"), nullable=True, index=True,
    )

    # External company data (when company_b has no profile)
    company_b_name = Column(String(255), nullable=True)
    company_b_data = Column(JSONB, default=dict)

    # Scoring
    match_score = Column(Float, default=0.0)  # 0-1
    match_reasons = Column(JSONB, default=list)  # Arabic explanations

    # AI suggestions
    deal_type_suggested = Column(String(30), nullable=True)
    terms_suggested = Column(JSONB, default=dict)

    # Status
    status = Column(String(30), default=MatchStatus.SUGGESTED.value)

    # Relationships
    company_a = relationship(
        "CompanyProfile", back_populates="matches_as_a", foreign_keys=[company_a_id],
    )
    company_b = relationship(
        "CompanyProfile", back_populates="matches_as_b", foreign_keys=[company_b_id],
    )
