"""
Notification Service — Multi-channel delivery (in-app, WhatsApp, email, SMS).
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.integrations.whatsapp import send_whatsapp_message
import logging

logger = logging.getLogger("dealix.services.notifications")


class NotificationService:
    """Manages notifications across all channels."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def send(
        self,
        tenant_id: str,
        user_id: str,
        title: str,
        body: str,
        notification_type: str = "info",
        channel: str = "in_app",
        data: dict = None,
    ) -> dict:
        from app.models.notification import Notification

        notif = Notification(
            id=uuid.uuid4(),
            tenant_id=uuid.UUID(tenant_id),
            user_id=uuid.UUID(user_id),
            type=notification_type,
            title=title,
            body=body,
            channel=channel,
            is_read=False,
        )
        self.db.add(notif)
        await self.db.flush()

        # Dispatch to external channels
        if channel == "whatsapp":
            await self._send_whatsapp(user_id, body)
        elif channel == "email":
            await self._send_email(user_id, title, body)
        elif channel == "sms":
            await self._send_sms(user_id, body)

        return {
            "id": str(notif.id),
            "channel": channel,
            "status": "sent",
        }

    async def send_bulk(
        self,
        tenant_id: str,
        user_ids: list,
        title: str,
        body: str,
        notification_type: str = "info",
        channel: str = "in_app",
    ) -> dict:
        results = []
        for uid in user_ids:
            result = await self.send(tenant_id, uid, title, body, notification_type, channel)
            results.append(result)
        return {"sent": len(results), "results": results}

    async def get_unread(self, tenant_id: str, user_id: str) -> list:
        from app.models.notification import Notification

        result = await self.db.execute(
            select(Notification)
            .where(
                Notification.tenant_id == uuid.UUID(tenant_id),
                Notification.user_id == uuid.UUID(user_id),
                Notification.is_read == False,
            )
            .order_by(Notification.created_at.desc())
            .limit(50)
        )
        return [self._to_dict(n) for n in result.scalars().all()]

    async def get_all(
        self, tenant_id: str, user_id: str, page: int = 1, per_page: int = 20
    ) -> dict:
        from app.models.notification import Notification

        query = select(Notification).where(
            Notification.tenant_id == uuid.UUID(tenant_id),
            Notification.user_id == uuid.UUID(user_id),
        ).order_by(Notification.created_at.desc())

        count_q = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_q)).scalar() or 0

        query = query.offset((page - 1) * per_page).limit(per_page)
        result = await self.db.execute(query)

        return {
            "items": [self._to_dict(n) for n in result.scalars().all()],
            "total": total,
            "unread_count": await self._count_unread(tenant_id, user_id),
        }

    async def mark_read(self, tenant_id: str, notification_id: str) -> bool:
        from app.models.notification import Notification

        result = await self.db.execute(
            select(Notification).where(
                Notification.id == uuid.UUID(notification_id),
                Notification.tenant_id == uuid.UUID(tenant_id),
            )
        )
        notif = result.scalar_one_or_none()
        if not notif:
            return False

        notif.is_read = True
        notif.read_at = datetime.now(timezone.utc)
        await self.db.flush()
        return True

    async def mark_all_read(self, tenant_id: str, user_id: str) -> int:
        from app.models.notification import Notification

        result = await self.db.execute(
            update(Notification)
            .where(
                Notification.tenant_id == uuid.UUID(tenant_id),
                Notification.user_id == uuid.UUID(user_id),
                Notification.is_read == False,
            )
            .values(is_read=True, read_at=datetime.now(timezone.utc))
        )
        return result.rowcount

    # ── Alert Templates ───────────────────────────

    async def notify_new_lead(self, tenant_id: str, agent_id: str, lead_name: str):
        await self.send(
            tenant_id, agent_id,
            title="عميل محتمل جديد 🔔",
            body=f"تم تعيين عميل جديد لك: {lead_name}",
            notification_type="lead",
            channel="in_app",
        )

    async def notify_meeting_booked(self, tenant_id: str, agent_id: str, lead_name: str, time: str):
        await self.send(
            tenant_id, agent_id,
            title="موعد جديد مؤكد 📅",
            body=f"تم حجز موعد مع {lead_name} في {time}",
            notification_type="meeting",
            channel="in_app",
        )

    async def notify_deal_won(self, tenant_id: str, agent_id: str, deal_title: str, value: float):
        await self.send(
            tenant_id, agent_id,
            title="صفقة ناجحة! 🎉",
            body=f"تم إغلاق صفقة {deal_title} بقيمة {value:,.0f} ريال",
            notification_type="deal",
            channel="in_app",
        )

    async def notify_commission_earned(self, tenant_id: str, affiliate_id: str, amount: float):
        await self.send(
            tenant_id, affiliate_id,
            title="عمولة جديدة 💰",
            body=f"تم إضافة عمولة {amount:,.0f} ريال إلى حسابك",
            notification_type="commission",
            channel="in_app",
        )

    async def notify_escalation(self, tenant_id: str, manager_id: str, reason: str):
        await self.send(
            tenant_id, manager_id,
            title="تصعيد يتطلب انتباهك ⚠️",
            body=reason,
            notification_type="escalation",
            channel="in_app",
        )

    # ── Channel Dispatchers ───────────────────────

    async def _send_whatsapp(self, user_id: str, message: str):
        # In a real scenario, we'd fetch the user's phone from the DB
        # For the empire simulation, we use the configured admin phone or lead phone
        await send_whatsapp_message("966500000000", message)

    async def _send_email(self, user_id: str, subject: str, body: str):
        logger.info(f"[EMAIL DISPATCH] Subject: {subject} | Body: {body[:50]}...")

    async def _send_sms(self, user_id: str, message: str):
        # Will be implemented with SMS integration
        pass

    async def _count_unread(self, tenant_id: str, user_id: str) -> int:
        from app.models.notification import Notification

        q = select(func.count()).where(
            Notification.tenant_id == uuid.UUID(tenant_id),
            Notification.user_id == uuid.UUID(user_id),
            Notification.is_read == False,
        )
        return (await self.db.execute(q)).scalar() or 0

    @staticmethod
    def _to_dict(notif) -> dict:
        if not notif:
            return {}
        return {
            "id": str(notif.id),
            "type": notif.type,
            "title": notif.title,
            "body": notif.body,
            "channel": notif.channel,
            "is_read": notif.is_read,
            "read_at": notif.read_at.isoformat() if notif.read_at else None,
            "created_at": notif.created_at.isoformat() if notif.created_at else None,
        }
