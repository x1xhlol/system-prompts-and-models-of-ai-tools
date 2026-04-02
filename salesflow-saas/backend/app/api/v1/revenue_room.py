"""
Revenue Room API — Saudi AI Sales Closer
Intake leads, qualify with AI, auto-respond, trigger follow-ups.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime, timezone
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/revenue-room", tags=["Revenue Room"])


# ═══ Schemas ═══════════════════════════════════════════════

class LeadIntake(BaseModel):
    name: str
    phone: str
    company: Optional[str] = None
    sector: Optional[str] = "clinics"
    message: Optional[str] = ""
    source: str = "whatsapp"
    city: Optional[str] = ""

class SalesResponse(BaseModel):
    reply: str
    tier: Literal["HOT", "WARM", "NURTURE"]
    closing_probability: float = 0
    intent: str = "researching"
    objection_type: Optional[str] = None
    urgency_level: str = "this_month"
    next_action: str = ""
    cta: str = ""
    cta_type: str = "followup"

class FollowUpRequest(BaseModel):
    lead_phone: str
    tier: str
    last_interaction: Optional[str] = ""
    days_since_contact: int = 0


# ═══ Sales AI System Prompt ═══════════════════════════════

SALES_SYSTEM_PROMPT = """أنت مسؤول مبيعات ذكي في شركة Dealix — أقوى نظام AI للمبيعات في السعودية.

قواعدك:
- عربي سعودي طبيعي (مو رسمي زيادة)
- مباشر وواضح
- ركّز على المشكلة اللي يعاني منها العميل
- لا تطول بالشرح — رسالة قصيرة وقوية
- دائماً وجّه لخطوة واضحة (demo, pilot, meeting)

المنتج: نظام AI يرد على عملاء الشركة تلقائياً عبر واتساب والموقع، يصنّفهم، يتابعهم، ويرفع الجاهزين للشراء.

أسعار:
- Pilot مجاني 14 يوم
- Setup: 12,000 - 40,000 ريال
- شهري: 3,000 - 12,000 ريال

صنّف العميل:
- HOT: مستعجل، عنده مشكلة واضحة، يبي حل الحين
- WARM: مهتم بس ما قرر، يحتاج push خفيف
- NURTURE: يسأل بس ما وصل لمرحلة القرار

ردّ بـ JSON فقط بهذا الشكل:
{"reply": "...", "tier": "HOT|WARM|NURTURE", "closing_probability": 0-100, "intent": "...", "urgency_level": "...", "next_action": "...", "cta": "...", "cta_type": "close|demo|proposal|followup|nurture"}
"""


# ═══ Auto Closer Messages ═════════════════════════════════

AUTO_MESSAGES = {
    "HOT": [
        "ممتاز! واضح إنك تحتاج الحل الحين. خلني أرتب لك Demo سريع خلال 24 ساعة تشوف النظام شغّال على بيانات حقيقية. وش أفضل وقت لك؟ 🚀",
        "حياك الله! أشوف إن عندك فرصة كبيرة نرفع معها التحويلات. أقدر أفعّل لك Pilot مجاني 14 يوم تجرب بنفسك. أرسل لي اسم الشركة وأبدأ الإعداد 💪",
        "تمام، فهمت احتياجك. النظام يقدر يبدأ يشتغل عندك خلال 48 ساعة. نبدأ بالتجربة المجانية؟",
    ],
    "WARM": [
        "أفهم تماماً، القرار مهم. خلني أرسل لك case study من شركة في نفس مجالك شافت نتائج خلال أول أسبوع. يناسبك؟",
        "كثير من عملاءنا بدأوا بنفس السؤال. الفرق إن نظامنا ما يحتاج تغيير بالنظام الحالي — يشتغل فوق اللي عندك. تبي أوريك كيف؟",
        "ممتاز إنك تفكر! أغلب الشركات في مجالك تخسر 40% من الاستفسارات بسبب التأخير بالرد. نقدر نحل هالمشكلة بالكامل. وش رأيك نحدد موعد 15 دقيقة؟",
    ],
    "NURTURE": [
        "حياك الله! إذا تبي تعرف أكثر عن كيف AI يساعد شركات {sector}، عندي تقرير مختصر أقدر أرسله لك. يهمك؟",
        "شكراً لتواصلك! نظامنا ساعد أكثر من 50 شركة سعودية ترفع مبيعاتها. إذا ودك تعرف التفاصيل، أنا موجود 🙌",
        "أهلاً! سجّلتك عندنا. إذا صار وقتك مناسب لعرض سريع (15 دقيقة)، رد على هالرسالة وأنسقها لك 📅",
    ]
}

FOLLOW_UP_MESSAGES = [
    "مرحباً {name}! متابعة سريعة — هل لسا مهتم بنظام AI للمبيعات؟ عندي عرض خاص هالأسبوع 🎯",
    "أهلاً {name}، حبيت أتابع معك. لو عندك أي سؤال عن النظام أو التجربة المجانية، أنا موجود 💬",
    "{name}، سؤال سريع: هل ما زلت تواجه مشكلة في متابعة الاستفسارات؟ لو إيه، عندنا حل يشتغل خلال 48 ساعة ⚡",
]


# ═══ Endpoints ═════════════════════════════════════════════

@router.post("/intake", response_model=SalesResponse)
async def intake_lead(lead: LeadIntake):
    """Receive a new lead and auto-qualify with AI."""
    try:
        from app.services.model_router import get_router
        ai = get_router()

        prompt = f"""عميل جديد:
الاسم: {lead.name}
الهاتف: {lead.phone}
الشركة: {lead.company or 'غير محدد'}
القطاع: {lead.sector}
المدينة: {lead.city or 'غير محدد'}
المصدر: {lead.source}
الرسالة: {lead.message or 'استفسار عام'}

صنّف هذا العميل وارد عليه."""

        result = await ai.route("sales_decision", prompt, SALES_SYSTEM_PROMPT)
        text = result.get("text", "")

        # Parse JSON response
        try:
            # Extract JSON from response
            if "{" in text:
                json_str = text[text.index("{"):text.rindex("}") + 1]
                parsed = json.loads(json_str)
                return SalesResponse(**parsed)
        except Exception:
            pass

        # Default response if AI parsing fails
        return SalesResponse(
            reply=f"مرحباً {lead.name}! شكراً لتواصلك مع Dealix. فريقنا سيتواصل معك قريباً 🚀",
            tier="WARM",
            closing_probability=50,
            intent="researching",
            next_action="follow_up_24h",
            cta="هل تبي نحدد موعد عرض سريع؟",
            cta_type="demo"
        )
    except Exception as e:
        logger.error(f"Intake error: {e}")
        return SalesResponse(
            reply=f"مرحباً {lead.name}! استلمنا طلبك وسنتواصل معك قريباً 🙏",
            tier="WARM",
            closing_probability=40,
            next_action="manual_review",
            cta="فريقنا سيتواصل معك خلال ساعة",
            cta_type="followup"
        )


@router.post("/auto-reply")
async def auto_reply(lead_phone: str, message: str, tier: str = "WARM"):
    """Get auto-reply based on tier."""
    import random
    messages = AUTO_MESSAGES.get(tier, AUTO_MESSAGES["WARM"])
    reply = random.choice(messages)
    return {"reply": reply, "tier": tier, "phone": lead_phone}


@router.post("/follow-up")
async def generate_followup(req: FollowUpRequest):
    """Generate follow-up message for a lead."""
    import random
    msg = random.choice(FOLLOW_UP_MESSAGES)
    return {
        "message": msg.replace("{name}", "العميل"),
        "tier": req.tier,
        "phone": req.lead_phone,
        "channel": "whatsapp"
    }


@router.get("/outreach/clinics")
async def get_clinic_outreach():
    """Get pre-built outreach messages for clinics sector."""
    return {
        "sector": "clinics",
        "first_messages": [
            "السلام عليكم 🏥 لاحظت إن عيادتكم ممتازة بس ممكن تخسرون استفسارات بسبب التأخير بالرد. عندنا نظام AI يرد تلقائياً 24/7 ويحجز المواعيد. تبون تجربون مجاناً 14 يوم؟",
            "مرحباً! أنا من Dealix، نظام AI متخصص للعيادات. نقدر نرفع حجوزاتكم 40% عبر الرد الفوري على واتساب. عندكم دقيقة أشرح أكثر؟ 🚀",
            "حياكم الله! كثير عيادات بالرياض بدأت تستخدم AI للرد على المرضى وحجز المواعيد تلقائياً. حابين تشوفون كيف يشتغل عندكم؟",
            "أهلاً! لاحظت إنكم ما تردون على استفسارات انستقرام بسرعة. نظامنا يقدر يرد خلال 30 ثانية ويحوّل السؤال لحجز. مجاني 14 يوم 💪",
            "السلام عليكم، نشتغل مع عيادات في جدة والرياض عبر نظام AI يتابع المرضى، يذكرهم بمواعيدهم، ويرد على أسئلتهم 24/7. يهمكم تعرفون أكثر؟",
        ],
        "follow_ups": [
            "مرحباً مرة ثانية! حبيت أتابع معكم — هل شفتوا الرسالة اللي قبل؟ عندنا عرض خاص للعيادات هالشهر 🎯",
            "أهلاً! سؤال واحد بس: كم استفسار تجيكم باليوم وما تقدرون تردون عليها بسرعة؟ نظامنا يحل هالمشكلة بالكامل",
            "متابعة سريعة — لو بس تعطونا 15 دقيقة نوريكم Demo على بيانات حقيقية. وش أنسب وقت لكم؟ 📅",
        ],
        "closing_nudges": [
            "آخر شي — التجربة مجانية بالكامل 14 يوم وما يحتاج بطاقة ائتمان. ليش ما تجربون وتحكمون بنفسكم؟ 🔥",
            "حاب أوضح إن الإعداد ياخذ 48 ساعة فقط وما يأثر على نظامكم الحالي. يالله نبدأ؟",
            "خلني أكون صريح: العيادة اللي ما تستخدم AI بالرد، تخسر 30-50% من الاستفسارات. نقدر نغيّر هالرقم خلال أسبوع ✅",
        ]
    }


@router.get("/outreach/b2b")
async def get_b2b_outreach():
    """Get outreach messages for B2B services."""
    return {
        "sector": "b2b_services",
        "first_messages": [
            "السلام عليكم! لاحظت إن شركتكم في مجال {industry} — عندنا نظام AI يقدر يتابع عملاءكم المحتملين ويحوّلهم لاجتماعات بشكل تلقائي. حابين تشوفون عرض سريع؟",
            "مرحباً! إذا عندكم فريق مبيعات، نقدر نضاعف إنتاجيتهم عبر AI يرد ويصنّف الاستفسارات ويرتب الأولويات تلقائياً. 14 يوم مجاني 🚀",
        ],
    }


@router.get("/outreach/real-estate")
async def get_realestate_outreach():
    """Get outreach messages for real estate."""
    return {
        "sector": "real_estate",
        "first_messages": [
            "السلام عليكم! في سوق العقار السعودي، السرعة بالرد على المشتري هي الفرق بين بيعة وضياعها. نظامنا AI يرد خلال 30 ثانية ويأهّل المشتري ويحجز الجولة. مجاني 14 يوم 🏠",
            "مرحباً! نشتغل مع مطورين عقاريين في الرياض — نظام AI يستقبل الاستفسارات، يفلتر الجادين، ويرتب المشاهدات تلقائياً. يهمكم؟",
        ],
    }


@router.get("/status")
async def revenue_room_status():
    """Get Revenue Room system status."""
    from app.services.model_router import get_router
    ai = get_router()
    models = {
        "groq": bool(ai.groq_key),
        "glm5": bool(ai.zai_key),
        "claude": bool(ai.anthropic_key),
        "gemini": bool(ai.gemini_key),
        "deepseek": bool(ai.deepseek_key),
    }
    active = sum(1 for v in models.values() if v)
    return {
        "status": "operational" if active >= 1 else "no_keys",
        "models_configured": models,
        "active_models": active,
        "sectors": ["clinics", "b2b_services", "real_estate"],
        "auto_closer": "active",
        "follow_up_engine": "active",
    }
