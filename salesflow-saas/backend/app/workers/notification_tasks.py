from app.workers.celery_app import celery_app


@celery_app.task(name="app.workers.notification_tasks.send_daily_report")
def send_daily_report():
    """Generate and send daily sales report to all active tenants."""
    # TODO: Query each tenant's daily stats
    # TODO: Generate report
    # TODO: Send to owner via email/WhatsApp
    pass


@celery_app.task(name="app.workers.notification_tasks.notify_user")
def notify_user(user_id: str, title: str, body: str, notification_type: str = "info"):
    """Create an in-app notification for a user."""
    # TODO: Create notification record
    # TODO: Push via WebSocket if connected
    pass
