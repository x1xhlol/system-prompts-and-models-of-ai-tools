from app.workers.celery_app import celery_app


@celery_app.task(name="app.workers.message_tasks.send_scheduled_messages")
def send_scheduled_messages():
    """Send messages that are scheduled for delivery."""
    # TODO: Query pending messages
    # TODO: Send via appropriate channel (WhatsApp, Email, SMS)
    # TODO: Update message status
    pass


@celery_app.task(name="app.workers.message_tasks.send_whatsapp")
def send_whatsapp(phone: str, message: str, tenant_id: str):
    """Send a WhatsApp message via Business API."""
    # TODO: Call WhatsApp Business API
    # TODO: Store message record
    # TODO: Handle delivery status
    pass


@celery_app.task(name="app.workers.message_tasks.send_email")
def send_email(to_email: str, subject: str, body: str, tenant_id: str):
    """Send an email via configured provider."""
    # TODO: Send via SMTP or SendGrid
    # TODO: Store message record
    pass


@celery_app.task(name="app.workers.message_tasks.send_sms")
def send_sms(phone: str, message: str, tenant_id: str):
    """Send SMS via Unifonic."""
    # TODO: Call Unifonic API
    # TODO: Store message record
    pass
