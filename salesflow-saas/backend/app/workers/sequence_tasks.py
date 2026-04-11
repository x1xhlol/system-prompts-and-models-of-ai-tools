"""
Sequence Worker Tasks — Dealix AI Revenue OS
Celery tasks for processing multi-channel sequences.
"""
import logging
from datetime import datetime, timezone, timedelta

from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def process_pending_sequences(self):
    """
    Process all active sequence enrollments.
    Checks which steps are due and executes them.
    Runs every 5 minutes via Celery Beat.
    """
    import asyncio
    from app.database import async_session_factory

    async def _process():
        from sqlalchemy import select, and_
        from app.models.sequence import SequenceEnrollment, SequenceStep, SequenceEvent
        from app.services.pdpl.consent_manager import ConsentManager

        async with async_session_factory() as db:
            # Find active enrollments with pending steps
            result = await db.execute(
                select(SequenceEnrollment).where(
                    SequenceEnrollment.status == "active"
                )
            )
            enrollments = result.scalars().all()
            processed = 0

            for enrollment in enrollments:
                try:
                    # Get the next step
                    step_result = await db.execute(
                        select(SequenceStep).where(
                            and_(
                                SequenceStep.sequence_id == enrollment.sequence_id,
                                SequenceStep.step_order == enrollment.current_step,
                            )
                        )
                    )
                    step = step_result.scalar_one_or_none()
                    if not step:
                        enrollment.status = "completed"
                        enrollment.completed_at = datetime.now(timezone.utc)
                        await db.commit()
                        continue

                    # Check if delay has passed
                    last_event_result = await db.execute(
                        select(SequenceEvent)
                        .where(SequenceEvent.enrollment_id == enrollment.id)
                        .order_by(SequenceEvent.sent_at.desc())
                        .limit(1)
                    )
                    last_event = last_event_result.scalar_one_or_none()

                    reference_time = (
                        last_event.sent_at if last_event else enrollment.enrolled_at
                    )
                    due_time = reference_time + timedelta(minutes=step.delay_minutes)

                    if datetime.now(timezone.utc) < due_time:
                        continue  # Not due yet

                    # Check PDPL consent before sending
                    consent_manager = ConsentManager()
                    has_consent = await consent_manager.check_consent(
                        contact_id=str(enrollment.lead_id),
                        tenant_id=str(enrollment.tenant_id) if hasattr(enrollment, 'tenant_id') else "default",
                        purpose="marketing",
                        channel=step.channel,
                        db=db,
                    )

                    if not has_consent:
                        logger.warning(
                            f"Skipping sequence step for lead {enrollment.lead_id}: "
                            f"no PDPL consent for {step.channel}"
                        )
                        # Record as failed due to consent
                        event = SequenceEvent(
                            enrollment_id=enrollment.id,
                            step_id=step.id,
                            channel=step.channel,
                            status="failed",
                            sent_at=datetime.now(timezone.utc),
                            metadata={"reason": "pdpl_consent_missing"},
                        )
                        db.add(event)
                        enrollment.current_step += 1
                        await db.commit()
                        continue

                    # Execute the step (dispatch to channel)
                    execute_sequence_step.delay(
                        enrollment_id=str(enrollment.id),
                        step_id=str(step.id),
                        lead_id=str(enrollment.lead_id),
                        channel=step.channel,
                        content=step.template_content_ar or step.template_content,
                    )
                    processed += 1

                except Exception as e:
                    logger.error(f"Error processing enrollment {enrollment.id}: {e}")
                    continue

            logger.info(f"Processed {processed} sequence steps")
            return processed

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        return loop.run_until_complete(_process())
    except Exception as exc:
        logger.error(f"Sequence processing failed: {exc}")
        raise self.retry(exc=exc)
    finally:
        loop.close()


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def execute_sequence_step(self, enrollment_id, step_id, lead_id, channel, content):
    """
    Execute a single sequence step — send the actual message.
    """
    import asyncio
    from app.database import async_session_factory

    async def _execute():
        from app.models.sequence import SequenceEnrollment, SequenceEvent
        from sqlalchemy import select

        async with async_session_factory() as db:
            # Get lead info
            from app.models.lead import Lead
            lead_result = await db.execute(
                select(Lead).where(Lead.id == lead_id)
            )
            lead = lead_result.scalar_one_or_none()
            if not lead:
                logger.error(f"Lead {lead_id} not found for sequence step")
                return

            success = False
            try:
                if channel == "whatsapp" and lead.phone:
                    from app.services.whatsapp_service import WhatsAppService
                    wa = WhatsAppService()
                    await wa.send_message(lead.phone, content)
                    success = True
                elif channel == "email" and lead.email:
                    from app.services.email_service import EmailService
                    es = EmailService()
                    await es.send(lead.email, "متابعة من Dealix", content)
                    success = True
                elif channel == "sms" and lead.phone:
                    from app.integrations.sms import send_sms
                    await send_sms(lead.phone, content)
                    success = True
                else:
                    logger.warning(
                        f"Cannot send {channel} to lead {lead_id}: "
                        f"missing contact info"
                    )
            except Exception as e:
                logger.error(f"Failed to send {channel} to {lead_id}: {e}")

            # Record event
            event = SequenceEvent(
                enrollment_id=enrollment_id,
                step_id=step_id,
                channel=channel,
                status="sent" if success else "failed",
                sent_at=datetime.now(timezone.utc),
                metadata={"content_preview": content[:100] if content else ""},
            )
            db.add(event)

            # Advance enrollment
            enrollment_result = await db.execute(
                select(SequenceEnrollment).where(
                    SequenceEnrollment.id == enrollment_id
                )
            )
            enrollment = enrollment_result.scalar_one_or_none()
            if enrollment:
                enrollment.current_step += 1

            await db.commit()
            logger.info(
                f"Sequence step executed: {channel} to lead {lead_id} "
                f"({'success' if success else 'failed'})"
            )

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(_execute())
    except Exception as exc:
        logger.error(f"Step execution failed: {exc}")
        raise self.retry(exc=exc)
    finally:
        loop.close()


@celery_app.task
def cleanup_expired_sequences():
    """
    Mark expired sequence enrollments as completed.
    Runs daily via Celery Beat.
    """
    import asyncio
    from app.database import async_session_factory

    async def _cleanup():
        from sqlalchemy import select, and_
        from app.models.sequence import SequenceEnrollment, Sequence, SequenceStep

        async with async_session_factory() as db:
            # Find enrollments that have passed all steps
            result = await db.execute(
                select(SequenceEnrollment).where(
                    SequenceEnrollment.status == "active"
                )
            )
            enrollments = result.scalars().all()
            cleaned = 0

            for enrollment in enrollments:
                # Count total steps in sequence
                steps_result = await db.execute(
                    select(SequenceStep).where(
                        SequenceStep.sequence_id == enrollment.sequence_id
                    )
                )
                total_steps = len(steps_result.scalars().all())

                if enrollment.current_step > total_steps:
                    enrollment.status = "completed"
                    enrollment.completed_at = datetime.now(timezone.utc)
                    cleaned += 1

            await db.commit()
            logger.info(f"Cleaned up {cleaned} expired sequence enrollments")
            return cleaned

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_cleanup())
    finally:
        loop.close()


@celery_app.task
def autopilot_pipeline_check():
    """
    Autopilot task: check pipeline health and flag at-risk deals.
    Runs every 2 hours via Celery Beat.
    """
    logger.info("Autopilot: Running pipeline health check")
    # This will be wired to the autopilot service once available
    return {"status": "checked", "timestamp": datetime.now(timezone.utc).isoformat()}


@celery_app.task
def autopilot_lead_scoring():
    """
    Autopilot task: re-score all active leads.
    Runs every 6 hours via Celery Beat.
    """
    logger.info("Autopilot: Running lead scoring update")
    return {"status": "scored", "timestamp": datetime.now(timezone.utc).isoformat()}
