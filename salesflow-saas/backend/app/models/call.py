import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, Float, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import TenantModel


class CallDirection(str, enum.Enum):
    INBOUND = "inbound"
    OUTBOUND = "outbound"


class CallChannel(str, enum.Enum):
    PHONE = "phone"
    WHATSAPP_VOICE = "whatsapp_voice"


class CallStatus(str, enum.Enum):
    INITIATED = "initiated"
    RINGING = "ringing"
    ANSWERED = "answered"
    COMPLETED = "completed"
    FAILED = "failed"
    NO_ANSWER = "no_answer"


class CallOutcome(str, enum.Enum):
    INTERESTED = "interested"
    NOT_INTERESTED = "not_interested"
    CALLBACK = "callback"
    MEETING_BOOKED = "meeting_booked"
    WRONG_NUMBER = "wrong_number"


class Call(TenantModel):
    __tablename__ = "calls"

    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=True, index=True)
    contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id"), nullable=True, index=True)
    affiliate_id = Column(UUID(as_uuid=True), ForeignKey("affiliate_marketers.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    direction = Column(Enum(CallDirection), nullable=False)
    channel = Column(Enum(CallChannel), default=CallChannel.PHONE)
    duration_seconds = Column(Integer, nullable=True)
    status = Column(Enum(CallStatus), default=CallStatus.INITIATED)
    outcome = Column(Enum(CallOutcome), nullable=True)
    transcript = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    sentiment_score = Column(Float, nullable=True)
    recording_url = Column(String(500), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)

    lead = relationship("Lead")
    contact = relationship("Contact")
    affiliate = relationship("AffiliateMarketer")
    user = relationship("User")
