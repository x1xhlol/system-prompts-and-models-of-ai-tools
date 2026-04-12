"""
Channel API Endpoints — Dealix AI Revenue OS
Unified API for all communication channels: inbound routing, outreach, campaigns, timelines.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db

router = APIRouter()


class InboundRequest(BaseModel):
    channel: str
    sender: str
    message: str


class OutreachRequest(BaseModel):
    channel: str
    lead: dict
    campaign_type: str = "cold_intro"
    language: str = "ar"


class CampaignRequest(BaseModel):
    lead: dict
    channels: list[str]
    campaign_type: str = "cold_outreach"


class ContentRequest(BaseModel):
    platform: str
    topic: str
    language: str = "ar"


@router.post("/inbound")
async def channel_inbound(req: InboundRequest, db: AsyncSession = Depends(get_db)):
    from app.services.channel_orchestrator import channel_orchestrator
    response = await channel_orchestrator.route_inbound(req.channel, req.sender, req.message, db)
    return {"channel": req.channel, "sender": req.sender, "response": response}


@router.post("/outreach")
async def channel_outreach(req: OutreachRequest, db: AsyncSession = Depends(get_db)):
    from app.services.channel_orchestrator import channel_orchestrator
    brain = channel_orchestrator._get_brain(req.channel)
    if not brain:
        raise HTTPException(status_code=400, detail=f"Channel '{req.channel}' not supported")

    if req.channel == "email":
        draft = await brain.generate_outreach(req.lead, req.campaign_type, req.language)
        return {"channel": req.channel, "subject": draft.subject, "body": draft.body}
    elif req.channel == "linkedin":
        name = req.lead.get("name", "")
        title = req.lead.get("title", "")
        company = req.lead.get("company", "")
        draft = await brain.draft_connection_request(name, title, company, "sales", req.language)
        return {"channel": req.channel, "draft": draft, "status": "pending_review"}
    elif req.channel in ("instagram", "tiktok", "twitter", "snapchat"):
        content = await brain.generate_content(req.channel, req.lead.get("topic", "sales_tips"), req.language)
        return {"channel": req.channel, "content": content.content, "hashtags": content.hashtags}

    return {"channel": req.channel, "status": "unsupported_for_outreach"}


@router.post("/campaign")
async def multi_channel_campaign(req: CampaignRequest, db: AsyncSession = Depends(get_db)):
    from app.services.channel_orchestrator import channel_orchestrator
    plan = await channel_orchestrator.generate_multi_channel_campaign(
        req.lead, req.channels, req.campaign_type, db
    )
    return {"campaign_type": plan.campaign_type, "channels": plan.channels, "steps": plan.steps}


@router.get("/timeline/{contact_id}")
async def contact_timeline(contact_id: str, db: AsyncSession = Depends(get_db)):
    from app.services.channel_orchestrator import channel_orchestrator
    events = await channel_orchestrator.get_contact_timeline(contact_id, db)
    return {"contact_id": contact_id, "events": [e.model_dump() for e in events]}


@router.post("/content")
async def generate_content(req: ContentRequest):
    from app.services.social_media_brain import social_media_brain
    draft = await social_media_brain.generate_content(req.platform, req.topic, req.language)
    return {"platform": draft.platform, "content": draft.content, "hashtags": draft.hashtags, "theme": draft.theme}


@router.get("/health")
async def channels_health():
    from app.services.channel_orchestrator import channel_orchestrator
    return {"channels": channel_orchestrator.get_channel_health()}
