import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import BaseModel, TenantModel
import enum


class ConversationChannel(str, enum.Enum):
    WHATSAPP = "whatsapp"
    VOICE_CALL = "voice_call"
    EMAIL = "email"
    WEBCHAT = "webchat"


class ConversationStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ESCALATED = "escalated"
    DROPPED = "dropped"


class AIConversation(TenantModel):
    __tablename__ = "ai_conversations"

    # Contact info
    contact_phone = Column(String(20), nullable=True, index=True)
    contact_email = Column(String(255), nullable=True)
    contact_name = Column(String(255), nullable=True)
    contact_company = Column(String(255), nullable=True)

    # Conversation info
    channel = Column(Enum(ConversationChannel), nullable=False)
    status = Column(Enum(ConversationStatus), default=ConversationStatus.ACTIVE)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=True)

    # AI tracking
    messages_count = Column(Integer, default=0)
    sentiment_score = Column(Integer, default=50)  # 0-100
    interest_level = Column(Integer, default=0)  # 0-100
    qualified = Column(Boolean, default=False)

    # Scheduling
    meeting_booked = Column(Boolean, default=False)
    meeting_datetime = Column(DateTime(timezone=True), nullable=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Conversation data
    messages = Column(JSONB, default=[])
    context = Column(JSONB, default={})
    last_message_at = Column(DateTime(timezone=True), nullable=True)

    # Escalation
    escalated_at = Column(DateTime(timezone=True), nullable=True)
    escalation_reason = Column(Text, nullable=True)


class AutoBooking(TenantModel):
    __tablename__ = "auto_bookings"

    # Source
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("ai_conversations.id"), nullable=True)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=True)
    affiliate_id = Column(UUID(as_uuid=True), ForeignKey("affiliate_marketers.id"), nullable=True)

    # Meeting info
    meeting_type = Column(String(50), nullable=False)  # demo, consultation, follow_up
    meeting_datetime = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=30)
    timezone = Column(String(50), default="Asia/Riyadh")

    # Attendees
    client_name = Column(String(255), nullable=False)
    client_phone = Column(String(20), nullable=True)
    client_email = Column(String(255), nullable=True)
    client_company = Column(String(255), nullable=True)
    assigned_sales_rep = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Status
    status = Column(String(20), default="scheduled")  # scheduled, confirmed, completed, cancelled, no_show
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    cancellation_reason = Column(Text, nullable=True)

    # Notes
    notes = Column(Text, nullable=True)
    outcome = Column(Text, nullable=True)
    extra_metadata = Column(JSONB, default={})
