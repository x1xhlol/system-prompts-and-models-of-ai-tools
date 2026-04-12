"""Multi-channel sequence engine for Dealix CRM.
Orchestrates outreach steps across WhatsApp, email, SMS with PDPL consent checks and A/B testing.
"""
import logging
import random
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from pydantic import BaseModel as Schema
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.sequence import (
    Sequence, SequenceStep, SequenceEnrollment, SequenceEvent,
    SequenceStatus, SequenceEventStatus,
)
from app.services.pdpl.consent_manager import ConsentManager

logger = logging.getLogger(__name__)


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


class SequenceEngine:
    """Manages multi-channel outreach sequences."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_sequence(self, data: SequenceCreateInput) -> Sequence:
        """Create a new sequence with optional steps."""
        seq = Sequence(
            tenant_id=data.tenant_id, name=data.name, name_ar=data.name_ar,
            description=data.description, trigger_event=data.trigger_event,
            is_active=True, created_by=data.created_by,
        )
        self.db.add(seq)
        await self.db.flush()
        for i, sd in enumerate(data.steps):
            self.db.add(SequenceStep(
                sequence_id=seq.id, step_order=i + 1,
                channel=sd.get("channel", "email"), delay_minutes=sd.get("delay_minutes", 0),
                template_content=sd.get("template_content", ""),
                template_content_ar=sd.get("template_content_ar"),
                variant=sd.get("variant"), conditions=sd.get("conditions", {}),
            ))
        await self.db.flush()
        await self.db.refresh(seq)
        logger.info("Sequence created: id=%s name=%s", seq.id, seq.name)
        return seq

    async def enroll_lead(self, data: EnrollInput) -> SequenceEnrollment:
        """Enroll a lead into a sequence."""
        existing = (await self.db.execute(
            select(SequenceEnrollment).where(
                SequenceEnrollment.sequence_id == data.sequence_id,
                SequenceEnrollment.lead_id == data.lead_id,
                SequenceEnrollment.status == SequenceStatus.ACTIVE.value,
            )
        )).scalar_one_or_none()
        if existing:
            raise ValueError("العميل المحتمل مسجل بالفعل في هذا التسلسل")
        first_step = (await self.db.execute(
            select(SequenceStep).where(SequenceStep.sequence_id == data.sequence_id)
            .order_by(SequenceStep.step_order).limit(1)
        )).scalar_one_or_none()
        now = datetime.now(timezone.utc)
        enrollment = SequenceEnrollment(
            sequence_id=data.sequence_id, lead_id=data.lead_id, current_step=0,
            status=SequenceStatus.ACTIVE.value, enrolled_at=now,
            next_step_at=now + timedelta(minutes=first_step.delay_minutes) if first_step else None,
        )
        self.db.add(enrollment)
        await self.db.flush()
        await self.db.refresh(enrollment)
        logger.info("Lead enrolled: lead=%s sequence=%s", data.lead_id, data.sequence_id)
        return enrollment

    async def process_pending_steps(self, tenant_id: UUID) -> list[StepProcessResult]:
        """Process enrollments whose next step is due. Checks PDPL consent."""
        now = datetime.now(timezone.utc)
        consent_mgr = ConsentManager(self.db)
        results: list[StepProcessResult] = []
        rows = await self.db.execute(
            select(SequenceEnrollment)
            .join(Sequence, Sequence.id == SequenceEnrollment.sequence_id)
            .where(Sequence.tenant_id == tenant_id, Sequence.is_active == True,
                   SequenceEnrollment.status == SequenceStatus.ACTIVE.value,
                   SequenceEnrollment.next_step_at <= now)
            .limit(200)
        )
        for enrollment in rows.scalars().all():
            r = await self._execute_next_step(enrollment, consent_mgr)
            if r:
                results.append(r)
        logger.info("Processed %d pending steps for tenant=%s", len(results), tenant_id)
        return results

    async def pause_enrollment(self, enrollment_id: UUID) -> SequenceEnrollment:
        e = await self._get_enrollment(enrollment_id)
        e.status = SequenceStatus.PAUSED.value
        await self.db.flush()
        return e

    async def resume_enrollment(self, enrollment_id: UUID) -> SequenceEnrollment:
        e = await self._get_enrollment(enrollment_id)
        e.status = SequenceStatus.ACTIVE.value
        e.next_step_at = datetime.now(timezone.utc)
        await self.db.flush()
        return e

    async def stop_enrollment(self, enrollment_id: UUID) -> SequenceEnrollment:
        e = await self._get_enrollment(enrollment_id)
        e.status = SequenceStatus.STOPPED.value
        e.completed_at = datetime.now(timezone.utc)
        await self.db.flush()
        return e

    async def get_sequence_analytics(self, sequence_id: UUID) -> SequenceAnalytics:
        """Compute open/response/conversion rates for a sequence."""
        seq = (await self.db.execute(
            select(Sequence).where(Sequence.id == sequence_id))).scalar_one_or_none()
        if not seq:
            raise ValueError("التسلسل غير موجود")

        async def _enroll_count(st: str) -> int:
            return (await self.db.execute(
                select(func.count()).where(SequenceEnrollment.sequence_id == sequence_id,
                                           SequenceEnrollment.status == st))).scalar() or 0

        total = (await self.db.execute(
            select(func.count()).where(SequenceEnrollment.sequence_id == sequence_id))).scalar() or 0
        active = await _enroll_count(SequenceStatus.ACTIVE.value)
        completed = await _enroll_count(SequenceStatus.COMPLETED.value)
        stopped = await _enroll_count(SequenceStatus.STOPPED.value)

        base = (select(func.count()).select_from(SequenceEvent)
                .join(SequenceEnrollment, SequenceEnrollment.id == SequenceEvent.enrollment_id)
                .where(SequenceEnrollment.sequence_id == sequence_id))
        total_sent = (await self.db.execute(base)).scalar() or 0
        delivered = (await self.db.execute(
            base.where(SequenceEvent.status.in_(["delivered", "opened", "replied"])))).scalar() or 0
        opened = (await self.db.execute(
            base.where(SequenceEvent.status.in_(["opened", "replied"])))).scalar() or 0
        replied = (await self.db.execute(
            base.where(SequenceEvent.status == "replied"))).scalar() or 0
        failed = (await self.db.execute(
            base.where(SequenceEvent.status == "failed"))).scalar() or 0

        safe = lambda n, d: round(n / d * 100, 2) if d else 0.0
        return SequenceAnalytics(
            sequence_id=sequence_id, name=seq.name, total_enrolled=total,
            active=active, completed=completed, stopped=stopped,
            total_sent=total_sent, delivered=delivered, opened=opened,
            replied=replied, failed=failed,
            open_rate=safe(opened, total_sent), reply_rate=safe(replied, total_sent),
            conversion_rate=safe(completed, total),
        )

    async def _execute_next_step(self, enrollment: SequenceEnrollment,
                                 consent_mgr: ConsentManager) -> Optional[StepProcessResult]:
        steps = (await self.db.execute(
            select(SequenceStep).where(SequenceStep.sequence_id == enrollment.sequence_id)
            .order_by(SequenceStep.step_order))).scalars().all()
        idx = enrollment.current_step
        if idx >= len(steps):
            enrollment.status = SequenceStatus.COMPLETED.value
            enrollment.completed_at = datetime.now(timezone.utc)
            await self.db.flush()
            return None
        # A/B variant selection
        candidates = [s for s in steps if s.step_order == steps[idx].step_order]
        step = random.choice(candidates) if len(candidates) > 1 else steps[idx]
        # PDPL consent gate
        cr = await consent_mgr.check_consent(enrollment.lead_id, "marketing", step.channel)
        if not cr.allowed:
            self.db.add(SequenceEvent(
                enrollment_id=enrollment.id, step_id=step.id, channel=step.channel,
                status=SequenceEventStatus.FAILED.value,
                event_metadata={"reason": "no_consent", "detail": cr.message},
            ))
            enrollment.status = SequenceStatus.STOPPED.value
            await self.db.flush()
            return StepProcessResult(enrollment_id=enrollment.id, step_id=step.id,
                                     channel=step.channel, status="failed",
                                     message=f"PDPL consent denied: {cr.message}")
        self.db.add(SequenceEvent(
            enrollment_id=enrollment.id, step_id=step.id, channel=step.channel,
            status=SequenceEventStatus.SENT.value,
            event_metadata={"variant": step.variant, "preview": step.template_content[:80]},
        ))
        enrollment.current_step = idx + 1
        if enrollment.current_step >= len(steps):
            enrollment.status = SequenceStatus.COMPLETED.value
            enrollment.completed_at = datetime.now(timezone.utc)
            enrollment.next_step_at = None
        else:
            enrollment.next_step_at = datetime.now(timezone.utc) + timedelta(minutes=steps[enrollment.current_step].delay_minutes)
        await self.db.flush()
        return StepProcessResult(enrollment_id=enrollment.id, step_id=step.id,
                                 channel=step.channel, status="sent",
                                 message=f"Step {idx + 1} sent via {step.channel}")

    async def _get_enrollment(self, enrollment_id: UUID) -> SequenceEnrollment:
        result = await self.db.execute(
            select(SequenceEnrollment).where(SequenceEnrollment.id == enrollment_id))
        e = result.scalar_one_or_none()
        if not e:
            raise ValueError("التسجيل غير موجود")
        return e
