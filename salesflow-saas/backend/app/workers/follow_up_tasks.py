from app.workers.celery_app import celery_app
from app.config import get_settings
from app.database import SessionLocal
from datetime import datetime, timezone, timedelta
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


@celery_app.task(name="app.workers.follow_up_tasks.process_pending_followups")
def process_pending_followups():
    """Check for leads that need follow-up and trigger automated messages."""
    from app.models.lead import Lead
    from app.models.message import Message
    from app.models.activity import Activity
    from sqlalchemy import select, and_

    logger.info("Processing pending follow-ups...")

    with SessionLocal() as db:
        now = datetime.now(timezone.utc)
        cutoff_24h = now - timedelta(hours=24)
        cutoff_72h = now - timedelta(hours=72)

        # Find leads with no activity in 24+ hours that are in active stages
        active_stages = ["new", "contacted", "qualified", "meeting_booked"]
        leads = db.execute(
            select(Lead).where(
                and_(
                    Lead.status.in_(active_stages),
                    Lead.updated_at < cutoff_24h,
                )
            ).limit(100)
        ).scalars().all()

        followups_sent = 0
        for lead in leads:
            # Check last message sent
            last_msg = db.execute(
                select(Message)
                .where(
                    and_(
                        Message.lead_id == lead.id,
                        Message.direction == "outbound",
                    )
                )
                .order_by(Message.created_at.desc())
                .limit(1)
            ).scalar_one_or_none()

            # Determine follow-up type based on time since last contact
            if last_msg and last_msg.created_at < cutoff_72h:
                template_name = "no_response_followup"
                followup_type = "72h_no_response"
            elif last_msg and last_msg.created_at < cutoff_24h:
                template_name = "gentle_reminder"
                followup_type = "24h_reminder"
            elif not last_msg:
                template_name = "welcome"
                followup_type = "first_contact"
            else:
                continue

            # Create follow-up activity
            activity = Activity(
                tenant_id=lead.tenant_id,
                lead_id=lead.id,
                type="follow_up",
                subject=f"Auto follow-up: {followup_type}",
                description=f"Automated {followup_type} follow-up triggered",
                is_automated=True,
                completed_at=now,
            )
            db.add(activity)

            # Queue message for sending
            send_scheduled_messages.delay()
            followups_sent += 1

        db.commit()
        logger.info(f"Processed {followups_sent} follow-ups for {len(leads)} leads")

    return {"followups_sent": followups_sent}


@celery_app.task(name="app.workers.follow_up_tasks.execute_workflow")
def execute_workflow(workflow_id: str, lead_id: str):
    """Execute a specific automation workflow for a lead."""
    from app.models.lead import Lead
    from app.models.template import IndustryTemplate

    logger.info(f"Executing workflow {workflow_id} for lead {lead_id}")

    with SessionLocal() as db:
        lead = db.get(Lead, lead_id)
        if not lead:
            logger.warning(f"Lead {lead_id} not found")
            return {"status": "error", "reason": "lead_not_found"}

        # Load workflow from industry template
        template = db.execute(
            select(IndustryTemplate).where(
                IndustryTemplate.id == workflow_id
            )
        ).scalar_one_or_none()

        if not template:
            logger.warning(f"Workflow template {workflow_id} not found")
            return {"status": "error", "reason": "template_not_found"}

        # Execute workflow actions from template
        actions_executed = []
        workflow_templates = template.workflow_templates or []

        for action in workflow_templates:
            action_type = action.get("type", "")

            if action_type == "send_message":
                channel = action.get("channel", "whatsapp")
                content = action.get("content_ar", "")
                # Replace placeholders
                content = content.replace("{name}", lead.name or "")
                content = content.replace("{company}", "Dealix")

                if channel == "whatsapp" and lead.phone:
                    from app.workers.message_tasks import send_whatsapp
                    send_whatsapp.delay(lead.phone, content, str(lead.tenant_id))
                elif channel == "email" and lead.email:
                    from app.workers.message_tasks import send_email
                    send_email.delay(lead.email, action.get("subject", "Dealix"), content, str(lead.tenant_id))

                actions_executed.append(action_type)

            elif action_type == "create_task":
                # Create task for assigned user
                actions_executed.append("create_task")

            elif action_type == "update_stage":
                new_stage = action.get("stage")
                if new_stage:
                    lead.status = new_stage
                    actions_executed.append(f"update_stage:{new_stage}")

        db.commit()
        logger.info(f"Workflow {workflow_id} executed: {actions_executed}")

    return {"status": "completed", "actions": actions_executed}


# Import for cross-task reference
from app.workers.message_tasks import send_scheduled_messages
