"""Multi-channel sequence engine for Dealix CRM.

Orchestrates ordered outreach steps across WhatsApp, email, and SMS
with PDPL consent checks, A/B testing, and analytics.
"""

import logging
import random
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from pydantic import BaseModel as Schema
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.sequence import (
    Sequence, SequenceStep, SequenceEnrollment, SequenceEvent,
    SequenceStatus, SequenceEventStatus,
)
from app.services.pdpl.consent_manager import ConsentManager

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class SequenceCreateInput(Schema):
    tenant_id: UUID
    name: str
    name_ar: Optional[str] = None
    description: Optional[str] = None
    trigger_event: Optional[str] = None
    created_by: UUID
    steps: list[dict] = []


class EnrollInput(Schema):
    sequence_id: UUID
    lead_id: UUID


class StepProcessResult(Schema):
    enrollment_id: UUID
    step_id: UUID
    channel: str
    status: str
    message: str


class SequenceAnalytics(Schema):
    sequence_id: UUID
    name: str
    total_enrolled: int
    active: int
    completed: int
    stopped: int
    total_sent: int
    delivered: int
    opened: int
    replied: int
    failed: int
    open_rate: float
    reply_rate: float
    conversion_rate: float


# ---------------------------------------------------------------------------
# SequenceEngine
# ---------------------------------------------------------------------------

class SequenceEngine:
    """Manages multi-channel outreach sequences."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # -- create sequence -----------------------------------------------------

    async def create_sequence(self, data: SequenceCreateInput) -> Sequence:
        """Create a new sequence with optional steps."""

        seq = Sequence(
            tenant_id=data.tenant_id,
            name=data.name,
            name_ar=data.name_ar,
            description=data.description,
            trigger_event=data.trigger_event,
            is_active=True,
            created_by=data.created_by,
        )
        self.db.add(seq)
        await self.db.flush()

        for i, step_data in enumerate(data.steps):
            step = SequenceStep(
                sequence_id=seq.id,
                step_order=i + 1,
                channel=step_data.get("channel", "email"),
                delay_minutes=step_data.get("delay_minutes", 0),
                template_content=step_data.get("template_content", ""),
                template_content_ar=step_data.get("template_content_ar"),
                variant=step_data.get("variant"),
                conditions=step_data.get("conditions", {}),
            )
            self.db.add(step)

        await self.db.flush()
        await self.db.refresh(seq)
        logger.info("Sequence created: id=%s name=%s", seq.id, seq.name)
        return seq

    # -- enroll lead ---------------------------------------------------------

    async def enroll_lead(self, data: EnrollInput) -> SequenceEnrollment:
        """Enroll a lead into a sequence. Starts at step 0."""

        # Prevent duplicate active enrollments
        existing = await self.db.execute(
            select(SequenceEnrollment).where(
                SequenceEnrollment.sequence_id == data.sequence_id,
                SequenceEnrollment.lead_id == data.lead_id,
                SequenceEnrollment.status == SequenceStatus.ACTIVE.value,
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError("العميل المحتمل مسجل بالفعل في هذا التسلسل")  # Lead already enrolled

        # Fetch first step to calculate next_step_at
        first_step = await self.db.execute(
            select(SequenceStep).where(SequenceStep.sequence_id == data.sequence_id)
            .order_by(SequenceStep.step_order).limit(1)
        )
        step = first_step.scalar_one_or_none()
        now = datetime.now(timezone.utc)
        next_at = now + timedelta(minutes=step.delay_minutes) if step else None

        enrollment = SequenceEnrollment(
            sequence_id=data.sequence_id,
            lead_id=data.lead_id,
            current_step=0,
            status=SequenceStatus.ACTIVE.value,
            enrolled_at=now,
            next_step_at=next_at,
        )
        self.db.add(enrollment)
        await self.db.flush()
        await self.db.refresh(enrollment)
        logger.info("Lead enrolled: lead=%s sequence=%s", data.lead_id, data.sequence_id)
        return enrollment

    # -- process pending steps -----------------------------------------------

    async def process_pending_steps(self, tenant_id: UUID) -> list[StepProcessResult]:
        """Process all enrollments whose next step is due. Checks PDPL consent."""

        now = datetime.now(timezone.utc)
        consent_mgr = ConsentManager(self.db)
        results: list[StepProcessResult] = []

        # Find active enrollments that are due
        query = (
            select(SequenceEnrollment)
            .join(Sequence, Sequence.id == SequenceEnrollment.sequence_id)
            .where(
                Sequence.tenant_id == tenant_id,
                Sequence.is_active == True,
                SequenceEnrollment.status == SequenceStatus.ACTIVE.value,
                SequenceEnrollment.next_step_at <= now,
            )
            .limit(200)
        )
        rows = await self.db.execute(query)
        enrollments = rows.scalars().all()

        for enrollment in enrollments:
            result = await self._execute_next_step(enrollment, consent_mgr)
            if result:
                results.append(result)

        logger.info("Processed %d pending steps for tenant=%s", len(results), tenant_id)
        return results

    # -- pause / resume / stop -----------------------------------------------

    async def pause_enrollment(self, enrollment_id: UUID) -> SequenceEnrollment:
        enrollment = await self._get_enrollment(enrollment_id)
        enrollment.status = SequenceStatus.PAUSED.value
        await self.db.flush()
        logger.info("Enrollment paused: %s", enrollment_id)
        return enrollment

    async def resume_enrollment(self, enrollment_id: UUID) -> SequenceEnrollment:
        enrollment = await self._get_enrollment(enrollment_id)
        enrollment.status = SequenceStatus.ACTIVE.value
        enrollment.next_step_at = datetime.now(timezone.utc)
        await self.db.flush()
        logger.info("Enrollment resumed: %s", enrollment_id)
        return enrollment

    async def stop_enrollment(self, enrollment_id: UUID) -> SequenceEnrollment:
        enrollment = await self._get_enrollment(enrollment_id)
        enrollment.status = SequenceStatus.STOPPED.value
        enrollment.completed_at = datetime.now(timezone.utc)
        await self.db.flush()
        logger.info("Enrollment stopped: %s", enrollment_id)
        return enrollment

    # -- analytics -----------------------------------------------------------

    async def get_sequence_analytics(self, sequence_id: UUID) -> SequenceAnalytics:
        """Compute open/response/conversion rates for a sequence."""

        seq = (await self.db.execute(
            select(Sequence).where(Sequence.id == sequence_id)
        )).scalar_one_or_none()
        if not seq:
            raise ValueError("التسلسل غير موجود")

        # Enrollment counts
        def _count_enrollments(status: str):
            return select(func.count()).where(
                SequenceEnrollment.sequence_id == sequence_id,
                SequenceEnrollment.status == status,
            )

        total = (await self.db.execute(
            select(func.count()).where(SequenceEnrollment.sequence_id == sequence_id)
        )).scalar() or 0
        active = (await self.db.execute(_count_enrollments(SequenceStatus.ACTIVE.value))).scalar() or 0
        completed = (await self.db.execute(_count_enrollments(SequenceStatus.COMPLETED.value))).scalar() or 0
        stopped = (await self.db.execute(_count_enrollments(SequenceStatus.STOPPED.value))).scalar() or 0

        # Event counts
        base_event = (
            select(func.count())
            .select_from(SequenceEvent)
            .join(SequenceEnrollment, SequenceEnrollment.id == SequenceEvent.enrollment_id)
            .where(SequenceEnrollment.sequence_id == sequence_id)
        )

        total_sent = (await self.db.execute(base_event)).scalar() or 0
        delivered = (await self.db.execute(
            base_event.where(SequenceEvent.status.in_(["delivered", "opened", "replied"]))
        )).scalar() or 0
        opened = (await self.db.execute(
            base_event.where(SequenceEvent.status.in_(["opened", "replied"]))
        )).scalar() or 0
        replied = (await self.db.execute(
            base_event.where(SequenceEvent.status == "replied")
        )).scalar() or 0
        failed = (await self.db.execute(
            base_event.where(SequenceEvent.status == "failed")
        )).scalar() or 0

        safe_div = lambda n, d: round(n / d * 100, 2) if d else 0.0

        return SequenceAnalytics(
            sequence_id=sequence_id,
            name=seq.name,
            total_enrolled=total,
            active=active,
            completed=completed,
            stopped=stopped,
            total_sent=total_sent,
            delivered=delivered,
            opened=opened,
            replied=replied,
            failed=failed,
            open_rate=safe_div(opened, total_sent),
            reply_rate=safe_div(replied, total_sent),
            conversion_rate=safe_div(completed, total) if total else 0.0,
        )

    # -- private helpers -----------------------------------------------------

    async def _execute_next_step(
        self, enrollment: SequenceEnrollment, consent_mgr: ConsentManager,
    ) -> Optional[StepProcessResult]:
        """Execute the next step for an enrollment."""

        steps_q = await self.db.execute(
            select(SequenceStep)
            .where(SequenceStep.sequence_id == enrollment.sequence_id)
            .order_by(SequenceStep.step_order)
        )
        steps = steps_q.scalars().all()
        next_idx = enrollment.current_step
        if next_idx >= len(steps):
            enrollment.status = SequenceStatus.COMPLETED.value
            enrollment.completed_at = datetime.now(timezone.utc)
            await self.db.flush()
            return None

        # A/B test: pick variant randomly if multiple exist for same order
        candidates = [s for s in steps if s.step_order == steps[next_idx].step_order]
        step = random.choice(candidates) if len(candidates) > 1 else steps[next_idx]

        # PDPL consent check
        seq = (await self.db.execute(
            select(Sequence).where(Sequence.id == enrollment.sequence_id)
        )).scalar_one()
        consent_result = await consent_mgr.check_consent(
            contact_id=enrollment.lead_id,
            purpose="marketing",
            channel=step.channel,
        )
        if not consent_result.allowed:
            event = SequenceEvent(
                enrollment_id=enrollment.id, step_id=step.id,
                channel=step.channel, status=SequenceEventStatus.FAILED.value,
                metadata={"reason": "no_consent", "message": consent_result.message},
            )
            self.db.add(event)
            enrollment.status = SequenceStatus.STOPPED.value
            await self.db.flush()
            return StepProcessResult(
                enrollment_id=enrollment.id, step_id=step.id,
                channel=step.channel, status="failed",
                message=f"PDPL consent denied: {consent_result.message}",
            )

        # Record send event
        event = SequenceEvent(
            enrollment_id=enrollment.id, step_id=step.id,
            channel=step.channel, status=SequenceEventStatus.SENT.value,
            metadata={"variant": step.variant, "template_preview": step.template_content[:100]},
        )
        self.db.add(event)

        # Advance enrollment
        enrollment.current_step = next_idx + 1
        if enrollment.current_step >= len(steps):
            enrollment.status = SequenceStatus.COMPLETED.value
            enrollment.completed_at = datetime.now(timezone.utc)
            enrollment.next_step_at = None
        else:
            next_step = steps[enrollment.current_step]
            enrollment.next_step_at = datetime.now(timezone.utc) + timedelta(minutes=next_step.delay_minutes)

        await self.db.flush()
        return StepProcessResult(
            enrollment_id=enrollment.id, step_id=step.id,
            channel=step.channel, status="sent",
            message=f"Step {next_idx + 1} sent via {step.channel}",
        )

    async def _get_enrollment(self, enrollment_id: UUID) -> SequenceEnrollment:
        result = await self.db.execute(
            select(SequenceEnrollment).where(SequenceEnrollment.id == enrollment_id)
        )
        enrollment = result.scalar_one_or_none()
        if not enrollment:
            raise ValueError("التسجيل غير موجود")  # Enrollment not found
        return enrollment
