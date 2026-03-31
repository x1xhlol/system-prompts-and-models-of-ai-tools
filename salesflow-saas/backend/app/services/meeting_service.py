"""
Meeting Service — AI-driven scheduling, calendar sync, preparation packages.
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession


class MeetingService:
    """Manages meeting lifecycle: schedule, confirm, prepare, remind."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_meeting(
        self,
        tenant_id: str,
        lead_id: str,
        agent_id: str,
        proposed_time: str,
        channel: str = "whatsapp",
        notes: str = "",
    ) -> dict:
        from app.models.ai_conversation import AutoBooking

        booking = AutoBooking(
            id=uuid.uuid4(),
            tenant_id=uuid.UUID(tenant_id),
            lead_id=uuid.UUID(lead_id),
            agent_id=uuid.UUID(agent_id),
            proposed_time=datetime.fromisoformat(proposed_time),
            status="proposed",
            channel=channel,
        )
        self.db.add(booking)
        await self.db.flush()
        return self._to_dict(booking)

    async def confirm_meeting(
        self, tenant_id: str, meeting_id: str, confirmed_time: str = None
    ) -> Optional[dict]:
        from app.models.ai_conversation import AutoBooking

        result = await self.db.execute(
            select(AutoBooking).where(
                AutoBooking.id == uuid.UUID(meeting_id),
                AutoBooking.tenant_id == uuid.UUID(tenant_id),
            )
        )
        booking = result.scalar_one_or_none()
        if not booking:
            return None

        booking.status = "confirmed"
        if confirmed_time:
            booking.confirmed_time = datetime.fromisoformat(confirmed_time)
        else:
            booking.confirmed_time = booking.proposed_time
        booking.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return self._to_dict(booking)

    async def cancel_meeting(
        self, tenant_id: str, meeting_id: str, reason: str = ""
    ) -> Optional[dict]:
        from app.models.ai_conversation import AutoBooking

        result = await self.db.execute(
            select(AutoBooking).where(
                AutoBooking.id == uuid.UUID(meeting_id),
                AutoBooking.tenant_id == uuid.UUID(tenant_id),
            )
        )
        booking = result.scalar_one_or_none()
        if not booking:
            return None

        booking.status = "cancelled"
        booking.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return self._to_dict(booking)

    async def reschedule_meeting(
        self, tenant_id: str, meeting_id: str, new_time: str
    ) -> Optional[dict]:
        from app.models.ai_conversation import AutoBooking

        result = await self.db.execute(
            select(AutoBooking).where(
                AutoBooking.id == uuid.UUID(meeting_id),
                AutoBooking.tenant_id == uuid.UUID(tenant_id),
            )
        )
        booking = result.scalar_one_or_none()
        if not booking:
            return None

        booking.proposed_time = datetime.fromisoformat(new_time)
        booking.confirmed_time = None
        booking.status = "rescheduled"
        booking.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return self._to_dict(booking)

    async def list_meetings(
        self,
        tenant_id: str,
        agent_id: str = None,
        status: str = None,
        from_date: str = None,
        to_date: str = None,
        page: int = 1,
        per_page: int = 25,
    ) -> dict:
        from app.models.ai_conversation import AutoBooking

        query = select(AutoBooking).where(
            AutoBooking.tenant_id == uuid.UUID(tenant_id)
        )

        if agent_id:
            query = query.where(AutoBooking.agent_id == uuid.UUID(agent_id))
        if status:
            query = query.where(AutoBooking.status == status)
        if from_date:
            query = query.where(AutoBooking.proposed_time >= datetime.fromisoformat(from_date))
        if to_date:
            query = query.where(AutoBooking.proposed_time <= datetime.fromisoformat(to_date))

        count_q = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_q)).scalar() or 0

        query = query.order_by(AutoBooking.proposed_time.asc())
        query = query.offset((page - 1) * per_page).limit(per_page)
        result = await self.db.execute(query)
        meetings = [self._to_dict(m) for m in result.scalars().all()]

        return {"items": meetings, "total": total, "page": page, "per_page": per_page}

    async def get_availability(
        self,
        tenant_id: str,
        agent_id: str,
        date: str,
        slot_duration_minutes: int = 30,
    ) -> list:
        """Get available time slots for an agent on a given date."""
        from app.models.ai_conversation import AutoBooking

        target_date = datetime.fromisoformat(date).date()
        start = datetime.combine(target_date, datetime.min.time().replace(hour=8))
        end = datetime.combine(target_date, datetime.min.time().replace(hour=18))

        # Get booked slots
        booked_q = select(AutoBooking.proposed_time, AutoBooking.confirmed_time).where(
            AutoBooking.tenant_id == uuid.UUID(tenant_id),
            AutoBooking.agent_id == uuid.UUID(agent_id),
            AutoBooking.status.in_(["proposed", "confirmed"]),
            AutoBooking.proposed_time >= start,
            AutoBooking.proposed_time < end,
        )
        booked = (await self.db.execute(booked_q)).all()
        booked_times = set()
        for b in booked:
            t = b.confirmed_time or b.proposed_time
            booked_times.add(t.replace(minute=(t.minute // slot_duration_minutes) * slot_duration_minutes, second=0))

        # Generate slots
        slots = []
        current = start.replace(tzinfo=timezone.utc)
        end = end.replace(tzinfo=timezone.utc)
        while current < end:
            if current not in booked_times:
                slots.append({
                    "time": current.isoformat(),
                    "available": True,
                })
            current += timedelta(minutes=slot_duration_minutes)

        return slots

    async def prepare_meeting_package(
        self, tenant_id: str, meeting_id: str
    ) -> dict:
        """Generate a meeting preparation package (AI-powered)."""
        from app.models.ai_conversation import AutoBooking

        result = await self.db.execute(
            select(AutoBooking).where(
                AutoBooking.id == uuid.UUID(meeting_id),
                AutoBooking.tenant_id == uuid.UUID(tenant_id),
            )
        )
        booking = result.scalar_one_or_none()
        if not booking:
            return {}

        # Get lead info for context
        from app.services.lead_service import LeadService
        lead_svc = LeadService(self.db)
        lead = await lead_svc.get_lead(tenant_id, str(booking.lead_id))

        return {
            "meeting_id": str(booking.id),
            "lead": lead,
            "prep_items": {
                "company_brief": f"Prepare brief for {lead.get('company_name', 'Unknown')}",
                "sector": lead.get("sector", ""),
                "talking_points": [],  # AI will fill this
                "predicted_objections": [],  # AI will fill this
                "recommended_presentation": None,  # Will match to sector
            },
            "status": "pending_ai_enrichment",
        }

    async def get_today_schedule(self, tenant_id: str, agent_id: str) -> list:
        today = datetime.now(timezone.utc).date()
        tomorrow = today + timedelta(days=1)
        data = await self.list_meetings(
            tenant_id,
            agent_id=agent_id,
            from_date=datetime.combine(today, datetime.min.time()).isoformat(),
            to_date=datetime.combine(tomorrow, datetime.min.time()).isoformat(),
            per_page=50,
        )
        return data["items"]

    @staticmethod
    def _to_dict(booking) -> dict:
        if not booking:
            return {}
        return {
            "id": str(booking.id),
            "tenant_id": str(booking.tenant_id),
            "lead_id": str(booking.lead_id),
            "agent_id": str(booking.agent_id),
            "proposed_time": booking.proposed_time.isoformat() if booking.proposed_time else None,
            "confirmed_time": booking.confirmed_time.isoformat() if booking.confirmed_time else None,
            "status": booking.status,
            "channel": booking.channel,
            "calendar_event_id": booking.calendar_event_id,
            "created_at": booking.created_at.isoformat() if booking.created_at else None,
        }
