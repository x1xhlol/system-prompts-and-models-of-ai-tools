from celery import Celery
from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "salesmatic",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.workers.follow_up_tasks",
        "app.workers.message_tasks",
        "app.workers.notification_tasks",
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
}
