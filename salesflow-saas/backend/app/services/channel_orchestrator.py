"""
Channel Orchestrator — Dealix AI Revenue OS
Unified coordinator across all communication channels.
Routes inbound messages, generates multi-channel campaigns, and provides unified timelines.
"""
import logging
from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel

logger = logging.getLogger(__name__)

CHANNEL_PRIORITY = ["whatsapp", "email", "instagram", "twitter", "linkedin", "tiktok"]

CHANNEL_REGISTRY = {
    "whatsapp": {"name_ar": "واتساب", "auto_send": True, "max_daily": 1000},
    "email": {"name_ar": "إيميل", "auto_send": True, "max_daily": 500},
    "instagram": {"name_ar": "إنستغرام", "auto_send": True, "max_daily": 200},
    "twitter": {"name_ar": "تويتر", "auto_send": True, "max_daily": 100},
    "linkedin": {"name_ar": "لينكدإن", "auto_send": False, "max_daily": 50},
    "tiktok": {"name_ar": "تيك توك", "auto_send": True, "max_daily": 100},
    "snapchat": {"name_ar": "سناب شات", "auto_send": True, "max_daily": 100},
}


class TimelineEvent(BaseModel):
    channel: str
    direction: str  # inbound, outbound
    content_preview: str
    timestamp: datetime
    event_type: str = "message"  # message, campaign, note


class CampaignPlan(BaseModel):
    lead: dict
    channels: list[str]
    campaign_type: str
    steps: list[dict]
    created_at: datetime = None

    def __init__(self, **data):
        super().__init__(**data)
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)


class ChannelOrchestrator:
    """Unified coordinator routing messages to the correct channel brain."""

    def __init__(self):
        self._brains = {}

    def _get_brain(self, channel: str):
        if channel not in self._brains:
            if channel == "whatsapp":
                from app.services.whatsapp_brain import whatsapp_brain
                self._brains[channel] = whatsapp_brain
            elif channel == "email":
                from app.services.email_brain import email_brain
                self._brains[channel] = email_brain
            elif channel == "linkedin":
                from app.services.linkedin_brain import linkedin_brain
                self._brains[channel] = linkedin_brain
            elif channel in ("instagram", "tiktok", "twitter", "snapchat"):
                from app.services.social_media_brain import social_media_brain
                self._brains[channel] = social_media_brain
        return self._brains.get(channel)

    async def route_inbound(
        self, channel: str, sender: str, message: str, db: Any = None
    ) -> str:
        brain = self._get_brain(channel)
        if not brain:
            logger.warning(f"[Orchestrator] no brain for channel={channel}")
            return "شكراً لتواصلك! سيتم تحويلك لفريق الدعم."

        logger.info(f"[Orchestrator] routing {channel} from={sender}")

        if channel == "whatsapp":
            return await brain.handle_incoming(sender, message, db)
        elif channel == "email":
            draft = await brain.handle_inbound(sender, message[:50], message, db)
            return draft.body
        elif channel in ("instagram", "tiktok", "twitter", "snapchat"):
            return await brain.handle_inbound_dm(channel, sender, message, db)
        elif channel == "linkedin":
            return "تم استلام رسالتك عبر لينكدإن. فريق المبيعات بيتواصل معك قريباً."

        return "شكراً لتواصلك!"

    async def generate_multi_channel_campaign(
        self, lead: dict, channels: list[str], campaign_type: str = "cold_outreach", db: Any = None
    ) -> CampaignPlan:
        sorted_channels = sorted(channels, key=lambda c: CHANNEL_PRIORITY.index(c) if c in CHANNEL_PRIORITY else 99)
        steps = []
        day = 0

        for i, channel in enumerate(sorted_channels):
            brain = self._get_brain(channel)
            if not brain:
                continue

            if channel == "whatsapp":
                content = f"أهلاً {lead.get('name', '')}! أنا من Dealix — نظام المبيعات الذكي. تبي تعرف أكثر؟"
                steps.append({"day": day, "channel": channel, "action": "send_message", "content": content, "auto": True})
            elif channel == "email":
                draft = await brain.generate_outreach(lead, "cold_intro")
                steps.append({"day": day, "channel": channel, "action": "send_email", "subject": draft.subject, "content": draft.body, "auto": True})
            elif channel == "linkedin":
                name = lead.get("name", "")
                title = lead.get("title", "")
                company = lead.get("company", "")
                draft_text = await brain.draft_connection_request(name, title, company)
                steps.append({"day": day, "channel": channel, "action": "send_connection", "content": draft_text, "auto": False})
            elif channel in ("instagram", "tiktok", "twitter", "snapchat"):
                content = f"أهلاً! شكراً لمتابعتك. Dealix يساعد الشركات السعودية في المبيعات. تبي تعرف أكثر؟"
                steps.append({"day": day, "channel": channel, "action": "send_dm", "content": content, "auto": True})

            day += 2  # 2-day gap between channels

        plan = CampaignPlan(lead=lead, channels=sorted_channels, campaign_type=campaign_type, steps=steps)
        logger.info(f"[Orchestrator] campaign planned: {len(steps)} steps across {len(sorted_channels)} channels")
        return plan

    async def get_contact_timeline(
        self, contact_id: str, db: Any = None
    ) -> list[TimelineEvent]:
        events = []
        if not db:
            return events
        try:
            from sqlalchemy import select
            from app.models.message import Message

            result = await db.execute(
                select(Message).where(Message.contact_id == contact_id).order_by(Message.created_at.desc()).limit(100)
            )
            messages = result.scalars().all()
            for msg in messages:
                events.append(TimelineEvent(
                    channel=msg.channel or "whatsapp",
                    direction=msg.direction or "inbound",
                    content_preview=msg.body[:120] if msg.body else "",
                    timestamp=msg.created_at,
                    event_type="message",
                ))
        except Exception as e:
            logger.warning(f"[Orchestrator] timeline error for {contact_id}: {e}")

        return sorted(events, key=lambda e: e.timestamp, reverse=True)

    def get_channel_health(self) -> dict:
        health = {}
        for channel, config in CHANNEL_REGISTRY.items():
            brain = self._get_brain(channel)
            health[channel] = {
                "name_ar": config["name_ar"],
                "active": brain is not None,
                "auto_send": config["auto_send"],
                "max_daily": config["max_daily"],
            }
        return health


# Global singleton
channel_orchestrator = ChannelOrchestrator()
