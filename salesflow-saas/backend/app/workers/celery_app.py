from celery import Celery
from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "dealix",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.workers.follow_up_tasks",
        "app.workers.message_tasks",
        "app.workers.notification_tasks",
        "app.workers.affiliate_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Riyadh",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

celery_app.conf.beat_schedule = {
    "check-pending-followups": {
        "task": "app.workers.follow_up_tasks.process_pending_followups",
        "schedule": 300.0,  # every 5 minutes
    },
    "send-scheduled-messages": {
        "task": "app.workers.message_tasks.send_scheduled_messages",
        "schedule": 60.0,  # every minute
    },
    "daily-report": {
        "task": "app.workers.notification_tasks.send_daily_report",
        "schedule": {
            "hour": 8,
            "minute": 0,
        },
    },
    "check-affiliate-targets": {
        "task": "app.workers.affiliate_tasks.check_monthly_targets",
        "schedule": 86400.0,  # daily
    },
    "affiliate-weekly-report": {
        "task": "app.workers.affiliate_tasks.send_affiliate_weekly_report",
        "schedule": 604800.0,  # weekly
    },
    "ai-lead-generation": {
        "task": "app.workers.affiliate_tasks.ai_lead_generation_scan",
        "schedule": 21600.0,  # every 6 hours
    },
    "ai-outreach-followup": {
        "task": "app.workers.affiliate_tasks.ai_outreach_followup",
        "schedule": 1800.0,  # every 30 minutes
    },
    "process-auto-bookings": {
        "task": "app.workers.affiliate_tasks.process_auto_bookings",
        "schedule": 900.0,  # every 15 minutes
    },
}
