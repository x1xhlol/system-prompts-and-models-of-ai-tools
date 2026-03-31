from app.workers.celery_app import celery_app
from app.config import get_settings
from app.database import SessionLocal
from datetime import datetime, timezone, timedelta
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


@celery_app.task(name="app.workers.notification_tasks.send_daily_report")
def send_daily_report():
    """Generate and send daily sales report to all active tenants."""
    from app.models.tenant import Tenant
    from app.models.lead import Lead
    from app.models.deal import Deal
    from app.models.user import User
    from sqlalchemy import select, func, and_

    logger.info("Generating daily reports...")

    with SessionLocal() as db:
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday_start = today_start - timedelta(days=1)

        tenants = db.execute(
            select(Tenant).where(Tenant.is_active == True)
        ).scalars().all()

        reports_sent = 0

        for tenant in tenants:
            # Gather daily stats
            new_leads = db.execute(
                select(func.count(Lead.id)).where(
                    and_(Lead.tenant_id == tenant.id, Lead.created_at >= today_start)
                )
            ).scalar() or 0

            deals_closed = db.execute(
                select(func.count(Deal.id)).where(
                    and_(
                        Deal.tenant_id == tenant.id,
                        Deal.stage == "closed_won",
                        Deal.updated_at >= today_start,
                    )
                )
            ).scalar() or 0

            revenue_today = db.execute(
                select(func.sum(Deal.value)).where(
                    and_(
                        Deal.tenant_id == tenant.id,
                        Deal.stage == "closed_won",
                        Deal.updated_at >= today_start,
                    )
                )
            ).scalar() or 0

            total_pipeline = db.execute(
                select(func.sum(Deal.value)).where(
                    and_(
                        Deal.tenant_id == tenant.id,
                        Deal.stage.notin_(["closed_won", "closed_lost"]),
                    )
                )
            ).scalar() or 0

            # Build report
            report = f"""📊 تقرير Dealix اليومي - {now.strftime('%Y-%m-%d')}

🆕 عملاء جدد: {new_leads}
✅ صفقات مغلقة: {deals_closed}
💰 إيرادات اليوم: {revenue_today:,.0f} ر.س
📈 إجمالي الفرص المفتوحة: {total_pipeline:,.0f} ر.س

—
Dealix - ديل اي اكس
مبيعاتك تشتغل وأنت ترتاح"""

            # Send to tenant owner
            owner = db.execute(
                select(User).where(
                    and_(User.tenant_id == tenant.id, User.role == "owner")
                )
            ).scalars().first()

            if owner:
                # Send via WhatsApp if phone available
                if owner.phone:
                    from app.workers.message_tasks import send_whatsapp
                    send_whatsapp.delay(owner.phone, report, str(tenant.id))

                # Send via email
                if owner.email:
                    from app.workers.message_tasks import send_email
                    send_email.delay(
                        owner.email,
                        f"تقرير Dealix اليومي - {now.strftime('%Y-%m-%d')}",
                        report,
                        str(tenant.id),
                    )

                # Create in-app notification
                notify_user.delay(str(owner.id), "التقرير اليومي", report, "daily_report")
                reports_sent += 1

        logger.info(f"Daily reports sent to {reports_sent} tenants")

    return {"reports_sent": reports_sent}


@celery_app.task(name="app.workers.notification_tasks.notify_user")
def notify_user(user_id: str, title: str, body: str, notification_type: str = "info"):
    """Create an in-app notification for a user."""
    from app.models.notification import Notification

    logger.info(f"Creating notification for user {user_id}: {title}")

    with SessionLocal() as db:
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            body=body,
            is_read=False,
            metadata={"created_by": "system"},
        )
        db.add(notification)
        db.commit()

    return {"status": "created", "user_id": user_id}


@celery_app.task(name="app.workers.notification_tasks.send_meeting_reminder")
def send_meeting_reminder():
    """Send meeting reminders 1 hour before scheduled meetings."""
    from app.models.ai_conversation import AutoBooking
    from sqlalchemy import select, and_

    logger.info("Checking for upcoming meetings...")

    with SessionLocal() as db:
        now = datetime.now(timezone.utc)
        reminder_window_start = now + timedelta(minutes=55)
        reminder_window_end = now + timedelta(minutes=65)

        upcoming = db.execute(
            select(AutoBooking).where(
                and_(
                    AutoBooking.status == "scheduled",
                    AutoBooking.meeting_datetime >= reminder_window_start,
                    AutoBooking.meeting_datetime <= reminder_window_end,
                )
            )
        ).scalars().all()

        reminders_sent = 0

        for booking in upcoming:
            meeting_time = booking.meeting_datetime.strftime("%H:%M")
            meeting_date = booking.meeting_datetime.strftime("%Y-%m-%d")

            reminder = f"""⏰ تذكير باجتماع Dealix

📅 التاريخ: {meeting_date}
⏰ الوقت: {meeting_time}
👤 العميل: {booking.client_name}
🏢 الشركة: {booking.client_company or '-'}
📱 الجوال: {booking.client_phone or '-'}

نتطلع لمقابلتك!
—
Dealix"""

            # Notify assigned sales rep
            if booking.assigned_sales_rep:
                notify_user.delay(
                    str(booking.assigned_sales_rep),
                    f"تذكير: اجتماع مع {booking.client_name}",
                    reminder,
                    "meeting_reminder",
                )

            # Send WhatsApp reminder to client
            if booking.client_phone:
                from app.workers.message_tasks import send_whatsapp
                send_whatsapp.delay(
                    booking.client_phone,
                    f"مرحباً {booking.client_name}! تذكير باجتماعك مع فريق Dealix اليوم الساعة {meeting_time}. نتطلع لمقابلتك!",
                    str(booking.tenant_id),
                )

            reminders_sent += 1

        logger.info(f"Sent {reminders_sent} meeting reminders")

    return {"reminders_sent": reminders_sent}
