import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import get_settings

settings = get_settings()


async def send_email(to_email: str, subject: str, body_html: str, from_name: str = None) -> dict:
    """Send email via SMTP."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        return {"status": "error", "detail": "Email not configured"}

    sender_name = from_name or settings.APP_NAME
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{sender_name} <{settings.SMTP_USER}>"
    msg["To"] = to_email

    msg.attach(MIMEText(body_html, "html", "utf-8"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        return {"status": "sent"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}
