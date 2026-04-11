"""Sequence engine models for multi-channel outreach."""

import enum
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.models.base import TenantModel, BaseModel
from app.models.compat import UUID, JSONB


class SequenceStatus(str, enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    STOPPED = "stopped"


class SequenceEventStatus(str, enum.Enum):
    SENT = "sent"
    DELIVERED = "delivered"
    OPENED = "opened"
    REPLIED = "replied"
    FAILED = "failed"


class Sequence(TenantModel):
    """A reusable multi-step outreach sequence."""

    __tablename__ = "sequences"
    __table_args__ = (
        Index("ix_seq_tenant_active", "tenant_id", "is_active"),
    )

    name = Column(String(255), nullable=False)
    name_ar = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    trigger_event = Column(String(100), nullable=True)  # lead_created, stage_changed, etc.
    is_active = Column(Boolean, default=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    steps = relationship("SequenceStep", back_populates="sequence", order_by="SequenceStep.step_order")
    enrollments = relationship("SequenceEnrollment", back_populates="sequence")
    creator = relationship("User", foreign_keys=[created_by])


class SequenceStep(BaseModel):
    """A single step within a sequence."""

    __tablename__ = "sequence_steps"
    __table_args__ = (
        Index("ix_step_sequence_order", "sequence_id", "step_order"),
    )

    sequence_id = Column(UUID(as_uuid=True), ForeignKey("sequences.id", ondelete="CASCADE"), nullable=False)
    step_order = Column(Integer, nullable=False)
    channel = Column(String(50), nullable=False)  # whatsapp, email, sms
    delay_minutes = Column(Integer, nullable=False, default=0)
    template_content = Column(Text, nullable=False)
    template_content_ar = Column(Text, nullable=True)
    variant = Column(String(1), nullable=True)  # A or B for A/B testing
    conditions = Column(JSONB, default=dict)  # e.g. {"only_if_no_reply": true}

    sequence = relationship("Sequence", back_populates="steps")
    events = relationship("SequenceEvent", back_populates="step")


class SequenceEnrollment(BaseModel):
    """Tracks a single lead's progress through a sequence."""

    __tablename__ = "sequence_enrollments"
    __table_args__ = (
        Index("ix_enroll_sequence_status", "sequence_id", "status"),
        Index("ix_enroll_lead", "lead_id"),
    )

    sequence_id = Column(UUID(as_uuid=True), ForeignKey("sequences.id", ondelete="CASCADE"), nullable=False)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=False)
    current_step = Column(Integer, default=0)
    status = Column(String(50), nullable=False, default=SequenceStatus.ACTIVE.value)
    enrolled_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    next_step_at = Column(DateTime(timezone=True), nullable=True)

    sequence = relationship("Sequence", back_populates="enrollments")
    lead = relationship("Lead", foreign_keys=[lead_id])
    events = relationship("SequenceEvent", back_populates="enrollment")


class SequenceEvent(BaseModel):
    """Records every message sent or event within a sequence enrollment."""

    __tablename__ = "sequence_events"
    __table_args__ = (
        Index("ix_sevent_enrollment", "enrollment_id"),
        Index("ix_sevent_step", "step_id"),
    )

    enrollment_id = Column(UUID(as_uuid=True), ForeignKey("sequence_enrollments.id", ondelete="CASCADE"), nullable=False)
    step_id = Column(UUID(as_uuid=True), ForeignKey("sequence_steps.id"), nullable=False)
    channel = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default=SequenceEventStatus.SENT.value)
    sent_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    metadata = Column(JSONB, default=dict)

    enrollment = relationship("SequenceEnrollment", back_populates="events")
    step = relationship("SequenceStep", back_populates="events")
