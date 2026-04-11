"""
Dealix Outreach Engine — محرك الاستهداف الذكي
يرسل رسائل عبر Ultramsg، يتتبع الحالة، ويدير الحملات.
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, timezone
import httpx
import json
import asyncio
import logging
import os
import uuid

logger = logging.getLogger("dealix.outreach")
router = APIRouter(prefix="/outreach", tags=["Outreach Engine"])


# ═══ Data Store (in-memory for now, upgrade to DB later) ═══
CAMPAIGNS = {}  # campaign_id -> campaign data
LEADS_STORE = {}  # phone -> lead data
OUTREACH_LOG = []  # list of all sent messages


# ═══ Schemas ═══════════════════════════════════════════════

class OutreachTarget(BaseModel):
    phone: str
    company_name: str = ""
    contact_name: str = ""
    sector: str = "clinics"
    city: str = "الرياض"
    notes: str = ""

class SendMessageRequest(BaseModel):
    phone: str
    message: str
    company_name: str = ""

class BulkCampaignRequest(BaseModel):
    campaign_name: str = "حملة العيادات"
    sector: str = "clinics"
    targets: List[OutreachTarget]
    message_template: str = ""
    delay_seconds: int = 45  # delay between messages to avoid spam

class CampaignStatus(BaseModel):
    campaign_id: str
    name: str
    total: int
    sent: int
    replied: int
    hot: int
    warm: int
    status: str


# ═══ Saudi AI Sales Messages (عامية سعودية) ═══════════════

CLINIC_MESSAGES = [
    "السلام عليكم 🏥\nلاحظت إن عيادتكم {company} من أفضل العيادات في {city}. بس سؤال سريع: كم استفسار يجيكم باليوم وما تلحقون ترددون عليه؟\n\nعندنا نظام ذكاء اصطناعي سعودي يرد على المرضى تلقائياً ٢٤/٧ عبر الواتساب ويحجز لهم مواعيد بدون ما تشغلون موظف إضافي.\n\nتبون أشرح لكم أكثر؟ أعطيكم ١٤ يوم مجاني 💪",

    "مرحبا 👋\nأنا من شركة تقنية سعودية متخصصة بحلول الذكاء الاصطناعي للعيادات.\n\nباختصار: نظامنا يستقبل رسائل المرضى، يفهم وش يبون، يرد عليهم بلحظة، ويحجز لهم الموعد — كل هذا أوتوماتيك بدون تدخل.\n\nنتائجنا: عيادات رفعت حجوزاتها ٤٠٪ أول شهر.\n\nتحبون تشوفون عرض سريع ٥ دقايق؟ 🚀",

    "السلام عليكم ورحمة الله 🌟\nعيادتكم {company} لفتت انتباهي — تشتغلون شغل حلو ماشاءالله.\n\nسؤال واحد بس: لو في نظام يرد على كل رسالة تجيكم بالواتساب خلال ٣٠ ثانية ويحجز الموعد تلقائياً — كم تتوقعون يزيد المواعيد عندكم؟\n\nعندنا الحل، وأقدر أفعّله لكم مجاناً ١٤ يوم بدون أي التزام.\n\nوش رأيكم؟ 🎯",
]

B2B_MESSAGES = [
    "السلام عليكم 🤝\nلاحظت إن شركتكم {company} في مجال {sector} — وهذا بالضبط مجال تخصصنا.\n\nنوفر نظام AI يتابع استفسارات العملاء ويحولهم لاجتماعات تلقائياً بدل ما تضيع الفرص.\n\nشركات سعودية زيكم رفعت معدل التحويل ٣٠٠٪.\n\nعندكم ٥ دقايق لعرض سريع؟ 💼",
]

REALESTATE_MESSAGES = [
    "السلام عليكم 🏠\nفي سوق العقار السعودي، سرعة الرد على المشتري هي الفرق بين بيعة وضياعها.\n\nنظامنا AI يرد خلال ٣٠ ثانية، يفهم وش يدور المشتري عليه، ويرتب له جولة.\n\nعيادة وحدة من عملاءنا رفعت مبيعاتها ٤٥٪ أول شهر.\n\nيهمكم تعرفون أكثر؟ 🔑",
]


def _get_sector_messages(sector: str) -> list:
    if sector == "clinics":
        return CLINIC_MESSAGES
    elif sector == "b2b":
        return B2B_MESSAGES
    elif sector == "real_estate":
        return REALESTATE_MESSAGES
    return CLINIC_MESSAGES


def _format_phone(phone: str) -> str:
    """Normalize Saudi phone number."""
    phone = phone.strip().replace(" ", "").replace("-", "")
    if phone.startswith("05"):
        phone = "966" + phone[1:]
    elif phone.startswith("+966"):
        phone = phone[1:]
    elif phone.startswith("00966"):
        phone = phone[2:]
    if not phone.startswith("966"):
        phone = "966" + phone
    return phone


async def _send_via_ultramsg(phone: str, message: str) -> dict:
    """Send a message via Ultramsg API."""
    instance_id = os.getenv("ULTRAMSG_INSTANCE_ID", "instance168132")
    token = os.getenv("ULTRAMSG_TOKEN", "7azj2ss74wpg9jwp")

    if not instance_id or not token:
        return {"error": "Ultramsg not configured"}

    formatted_phone = _format_phone(phone)
    url = f"https://api.ultramsg.com/{instance_id}/messages/chat"

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(url, data={
                "token": token,
                "to": formatted_phone,
                "body": message,
            })
            result = resp.json()
            logger.info(f"Ultramsg sent to {formatted_phone}: {result}")
            return result
    except Exception as e:
        logger.error(f"Ultramsg error: {e}")
        return {"error": str(e)}


# ═══ Endpoints ═════════════════════════════════════════════

@router.post("/send")
async def send_single_message(req: SendMessageRequest):
    """Send a single outreach message to a target."""
    result = await _send_via_ultramsg(req.phone, req.message)

    # Log it
    log_entry = {
        "id": str(uuid.uuid4()),
        "phone": req.phone,
        "company": req.company_name,
        "message": req.message[:100],
        "result": result,
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "status": "sent" if "error" not in result else "failed",
    }
    OUTREACH_LOG.append(log_entry)

    # Store lead
    LEADS_STORE[req.phone] = {
        "phone": req.phone,
        "company": req.company_name,
        "status": "contacted",
        "tier": "NURTURE",
        "first_contact": log_entry["sent_at"],
    }

    return {"status": "sent", "result": result, "log": log_entry}


@router.post("/campaign/launch")
async def launch_campaign(req: BulkCampaignRequest, background_tasks: BackgroundTasks):
    """Launch a bulk outreach campaign to multiple targets."""
    import random

    campaign_id = str(uuid.uuid4())[:8]
    messages = _get_sector_messages(req.sector)

    campaign = {
        "id": campaign_id,
        "name": req.campaign_name,
        "sector": req.sector,
        "total": len(req.targets),
        "sent": 0,
        "replied": 0,
        "hot": 0,
        "warm": 0,
        "status": "running",
        "targets": [],
        "started_at": datetime.now(timezone.utc).isoformat(),
    }
    CAMPAIGNS[campaign_id] = campaign

    # Launch in background
    background_tasks.add_task(
        _run_campaign, campaign_id, req.targets, messages,
        req.message_template, req.delay_seconds, req.sector
    )

    return {
        "campaign_id": campaign_id,
        "status": "launched",
        "total_targets": len(req.targets),
        "estimated_time_minutes": round(len(req.targets) * req.delay_seconds / 60, 1),
        "message": f"🚀 حملة '{req.campaign_name}' انطلقت! {len(req.targets)} هدف",
    }


async def _run_campaign(campaign_id: str, targets: list, messages: list,
                        custom_template: str, delay: int, sector: str):
    """Background task to send campaign messages with delays."""
    import random
    campaign = CAMPAIGNS[campaign_id]

    for i, target in enumerate(targets):
        try:
            # Pick message
            if custom_template:
                msg = custom_template
            else:
                msg = random.choice(messages)

            # Personalize
            msg = msg.replace("{company}", target.company_name or "شركتكم")
            msg = msg.replace("{city}", target.city or "السعودية")
            msg = msg.replace("{sector}", sector)
            msg = msg.replace("{name}", target.contact_name or "")

            # Send
            result = await _send_via_ultramsg(target.phone, msg)

            status = "sent" if "error" not in result else "failed"
            campaign["sent"] += 1
            campaign["targets"].append({
                "phone": target.phone,
                "company": target.company_name,
                "status": status,
                "message_preview": msg[:80],
            })

            # Store lead
            LEADS_STORE[target.phone] = {
                "phone": target.phone,
                "company": target.company_name,
                "contact": target.contact_name,
                "sector": sector,
                "city": target.city,
                "status": "contacted",
                "tier": "NURTURE",
                "campaign_id": campaign_id,
            }

            logger.info(f"Campaign {campaign_id}: Sent {i+1}/{len(targets)} to {target.company_name}")

            # Delay between messages (anti-spam)
            if i < len(targets) - 1:
                await asyncio.sleep(delay)

        except Exception as e:
            logger.error(f"Campaign send error: {e}")
            campaign["targets"].append({
                "phone": target.phone,
                "company": target.company_name,
                "status": "error",
                "error": str(e),
            })

    campaign["status"] = "completed"
    logger.info(f"Campaign {campaign_id} COMPLETE: {campaign['sent']}/{campaign['total']} sent")


@router.get("/campaign/{campaign_id}")
async def get_campaign_status(campaign_id: str):
    """Get campaign status."""
    campaign = CAMPAIGNS.get(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.get("/campaigns")
async def list_campaigns():
    """List all campaigns."""
    return {
        "total": len(CAMPAIGNS),
        "campaigns": [
            {
                "id": c["id"],
                "name": c["name"],
                "status": c["status"],
                "sent": c["sent"],
                "total": c["total"],
                "started_at": c["started_at"],
            }
            for c in CAMPAIGNS.values()
        ]
    }


@router.get("/leads")
async def get_all_leads():
    """Get all leads from outreach."""
    return {
        "total": len(LEADS_STORE),
        "leads": list(LEADS_STORE.values()),
    }


@router.get("/log")
async def get_outreach_log():
    """Get recent outreach activity log."""
    return {
        "total": len(OUTREACH_LOG),
        "recent": OUTREACH_LOG[-50:],  # last 50
    }


@router.post("/test-send")
async def test_ultramsg_connection(phone: str = "966500000000"):
    """Test Ultramsg connection with a test message."""
    result = await _send_via_ultramsg(
        phone,
        "🔧 اختبار اتصال Dealix AI System — إذا وصلتك هالرسالة، النظام شغّال ١٠٠٪! 🚀"
    )
    return {"result": result, "phone": phone}


@router.get("/messages/{sector}")
async def get_sector_messages(sector: str):
    """Get pre-built outreach messages for a sector."""
    messages = _get_sector_messages(sector)
    return {"sector": sector, "messages": messages, "total": len(messages)}


@router.get("/stats")
async def get_outreach_stats():
    """Get overall outreach statistics."""
    total_leads = len(LEADS_STORE)
    contacted = sum(1 for l in LEADS_STORE.values() if l.get("status") == "contacted")
    replied = sum(1 for l in LEADS_STORE.values() if l.get("status") == "replied")
    hot = sum(1 for l in LEADS_STORE.values() if l.get("tier") == "HOT")
    warm = sum(1 for l in LEADS_STORE.values() if l.get("tier") == "WARM")

    return {
        "total_leads": total_leads,
        "contacted": contacted,
        "replied": replied,
        "hot_leads": hot,
        "warm_leads": warm,
        "campaigns_total": len(CAMPAIGNS),
        "campaigns_active": sum(1 for c in CAMPAIGNS.values() if c["status"] == "running"),
        "messages_sent": len(OUTREACH_LOG),
    }
