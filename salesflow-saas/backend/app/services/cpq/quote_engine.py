"""
Dealix CPQ Quote Engine — Configure, Price, Quote
عروض أسعار احترافية مع ضريبة القيمة المضافة والعملات المتعددة
"""

import uuid
import logging
from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.proposal import Proposal

logger = logging.getLogger("dealix.cpq.quote")

SAR_VAT_RATE = Decimal("0.15")
DEFAULT_VALIDITY_DAYS = 30
USD_TO_SAR_RATE = Decimal("3.75")

_FOOTER = "العرض ساري لمدة {validity} يوم من تاريخه"
INDUSTRY_TEMPLATES = {
    "real_estate": {"header_ar": "عرض سعر عقاري", "footer_ar": "هذا " + _FOOTER, "terms_ar": [
        "الأسعار شاملة ضريبة القيمة المضافة ما لم يُذكر خلاف ذلك",
        "يتم الدفع حسب خطة السداد المتفق عليها",
        "العرض قابل للتعديل حسب توفر الوحدات"]},
    "healthcare": {"header_ar": "عرض سعر طبي", "footer_ar": _FOOTER + " — صحتكم أولويتنا", "terms_ar": [
        "الأسعار شاملة ضريبة القيمة المضافة",
        "التأمين الطبي قد يغطي جزءاً من التكاليف",
        "يرجى إحضار بطاقة التأمين عند الزيارة"]},
    "services": {"header_ar": "عرض سعر خدمات", "footer_ar": _FOOTER, "terms_ar": [
        "الأسعار شاملة ضريبة القيمة المضافة 15%",
        "مدة التنفيذ تبدأ من تاريخ الموافقة على العرض",
        "الدفع: 50% مقدم و50% عند التسليم ما لم يُتفق على خلاف ذلك"]},
    "contracting": {"header_ar": "عرض سعر مقاولات", "footer_ar": _FOOTER + " — شاملاً المواد والعمالة", "terms_ar": [
        "الأسعار شاملة ضريبة القيمة المضافة 15%",
        "التسعير مبني على المعاينة الميدانية",
        "أي تغييرات في النطاق تستوجب ملحق عقد منفصل",
        "الضمان حسب بنود العقد"]},
}


class QuoteStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    VIEWED = "viewed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"


class LineItemInput(BaseModel):
    description_ar: str
    description_en: str = ""
    quantity: int = Field(ge=1, default=1)
    unit_price: Decimal = Field(ge=0)
    unit: str = "وحدة"


class DiscountInput(BaseModel):
    type: str = Field(pattern=r"^(percentage|fixed)$")
    value: Decimal = Field(ge=0)
    reason_ar: str = ""


class QuoteCreate(BaseModel):
    tenant_id: str
    deal_id: Optional[str] = None
    lead_id: Optional[str] = None
    title: str
    currency: str = "SAR"
    industry: str = "services"
    validity_days: int = DEFAULT_VALIDITY_DAYS
    vat_registration_number: Optional[str] = None
    client_name: str = ""
    client_company: str = ""
    notes_ar: str = ""


class QuoteEngine:
    """Full CPQ lifecycle: create, price, send, track."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_quote(self, data: QuoteCreate) -> dict:
        """Create a new quote in draft status."""
        template = INDUSTRY_TEMPLATES.get(data.industry, INDUSTRY_TEMPLATES["services"])
        valid_until = datetime.now(timezone.utc) + timedelta(days=data.validity_days)

        content = {
            "line_items": [],
            "discounts": [],
            "subtotal": "0",
            "discount_total": "0",
            "vat_amount": "0",
            "total": "0",
            "currency": data.currency,
            "industry": data.industry,
            "header_ar": template["header_ar"],
            "footer_ar": template["footer_ar"].format(validity=data.validity_days),
            "terms_ar": template["terms_ar"],
            "vat_registration_number": data.vat_registration_number or "",
            "client_name": data.client_name,
            "client_company": data.client_company,
            "notes_ar": data.notes_ar,
        }

        proposal = Proposal(
            id=uuid.uuid4(),
            tenant_id=uuid.UUID(data.tenant_id),
            deal_id=uuid.UUID(data.deal_id) if data.deal_id else None,
            lead_id=uuid.UUID(data.lead_id) if data.lead_id else None,
            title=data.title,
            content=content,
            total_amount=Decimal("0"),
            currency=data.currency,
            status=QuoteStatus.DRAFT.value,
            valid_until=valid_until.date(),
        )
        self.db.add(proposal)
        await self.db.flush()
        logger.info("Quote %s created for tenant %s", proposal.id, data.tenant_id)
        return self._to_dict(proposal)

    async def add_line_item(self, tenant_id: str, quote_id: str, item: LineItemInput) -> dict:
        """Add a line item and recalculate totals."""
        proposal = await self._get_quote(tenant_id, quote_id)
        if not proposal:
            raise ValueError("عرض السعر غير موجود")

        content: dict = dict(proposal.content)
        line_items: list = list(content.get("line_items", []))
        line_total = item.unit_price * item.quantity
        line_items.append({
            "id": str(uuid.uuid4())[:8], "description_ar": item.description_ar,
            "description_en": item.description_en, "quantity": item.quantity,
            "unit_price": str(item.unit_price), "unit": item.unit, "total": str(line_total),
        })
        content["line_items"] = line_items
        proposal.content = content
        await self._recalculate(proposal)
        await self.db.flush()
        return self._to_dict(proposal)

    async def apply_discount(self, tenant_id: str, quote_id: str, discount: DiscountInput) -> dict:
        """Apply a percentage or fixed discount."""
        proposal = await self._get_quote(tenant_id, quote_id)
        if not proposal:
            raise ValueError("عرض السعر غير موجود")

        content: dict = dict(proposal.content)
        discounts: list = list(content.get("discounts", []))
        discounts.append({
            "type": discount.type,
            "value": str(discount.value),
            "reason_ar": discount.reason_ar,
        })
        content["discounts"] = discounts
        proposal.content = content
        await self._recalculate(proposal)
        await self.db.flush()
        return self._to_dict(proposal)

    async def calculate_totals(self, tenant_id: str, quote_id: str) -> dict:
        """Force recalculation of quote totals."""
        proposal = await self._get_quote(tenant_id, quote_id)
        if not proposal:
            raise ValueError("عرض السعر غير موجود")
        await self._recalculate(proposal)
        await self.db.flush()
        return {
            "subtotal": proposal.content.get("subtotal", "0"),
            "discount_total": proposal.content.get("discount_total", "0"),
            "vat_amount": proposal.content.get("vat_amount", "0"),
            "total": str(proposal.total_amount),
            "currency": proposal.currency,
        }

    async def send_quote(
        self, tenant_id: str, quote_id: str, channel: str = "whatsapp", recipient: str = ""
    ) -> dict:
        """Mark quote as sent and dispatch via channel."""
        proposal = await self._get_quote(tenant_id, quote_id)
        if not proposal:
            raise ValueError("عرض السعر غير موجود")

        proposal.status = QuoteStatus.SENT.value
        proposal.sent_at = datetime.now(timezone.utc)
        await self.db.flush()

        dispatch_result = {"channel": channel, "recipient": recipient, "status": "queued"}
        if channel == "whatsapp":
            from app.services.whatsapp_service import WhatsAppService
            wa = WhatsAppService()
            msg = (
                f"مرحباً {proposal.content.get('client_name', '')}،\n"
                f"مرفق عرض السعر: {proposal.title}\n"
                f"الإجمالي: {proposal.total_amount} {proposal.currency}\n"
                f"ساري حتى: {proposal.valid_until}"
            )
            dispatch_result = await wa.send_message(recipient, msg)
        elif channel == "email":
            from app.services.email_service import EmailService
            es = EmailService()
            dispatch_result = await es.send_email(
                to=recipient,
                subject=f"عرض سعر — {proposal.title}",
                body=f"عرض سعر بمبلغ {proposal.total_amount} {proposal.currency}",
            )

        logger.info("Quote %s sent via %s to %s", quote_id, channel, recipient)
        return {"quote_id": str(proposal.id), "status": "sent", "dispatch": dispatch_result}

    async def get_quote_status(self, tenant_id: str, quote_id: str) -> dict:
        """Return current quote status and lifecycle timestamps."""
        proposal = await self._get_quote(tenant_id, quote_id)
        if not proposal:
            raise ValueError("عرض السعر غير موجود")

        now = datetime.now(timezone.utc).date()
        is_expired = proposal.valid_until and proposal.valid_until < now
        if is_expired and proposal.status not in (QuoteStatus.ACCEPTED.value, QuoteStatus.REJECTED.value):
            proposal.status = QuoteStatus.EXPIRED.value
            await self.db.flush()

        return {
            "quote_id": str(proposal.id),
            "status": proposal.status,
            "sent_at": proposal.sent_at.isoformat() if proposal.sent_at else None,
            "viewed_at": proposal.viewed_at.isoformat() if proposal.viewed_at else None,
            "valid_until": proposal.valid_until.isoformat() if proposal.valid_until else None,
            "is_expired": is_expired,
        }

    # ── Internal helpers ─────────────────────────────

    async def _get_quote(self, tenant_id: str, quote_id: str) -> Optional[Proposal]:
        result = await self.db.execute(
            select(Proposal).where(
                Proposal.id == uuid.UUID(quote_id),
                Proposal.tenant_id == uuid.UUID(tenant_id),
            )
        )
        return result.scalar_one_or_none()

    async def _recalculate(self, proposal: Proposal) -> None:
        content: dict = dict(proposal.content)
        line_items = content.get("line_items", [])
        discounts = content.get("discounts", [])

        subtotal = sum(Decimal(li["total"]) for li in line_items)

        discount_total = Decimal("0")
        for d in discounts:
            if d["type"] == "percentage":
                discount_total += (subtotal * Decimal(d["value"]) / Decimal("100")).quantize(
                    Decimal("0.01"), rounding=ROUND_HALF_UP
                )
            else:
                discount_total += Decimal(d["value"])

        after_discount = max(subtotal - discount_total, Decimal("0"))
        vat_amount = (after_discount * SAR_VAT_RATE).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        total = after_discount + vat_amount

        if content.get("currency") == "USD":
            content["total_sar"] = str((total * USD_TO_SAR_RATE).quantize(Decimal("0.01")))

        content["subtotal"] = str(subtotal)
        content["discount_total"] = str(discount_total)
        content["vat_amount"] = str(vat_amount)
        content["total"] = str(total)
        proposal.content = content
        proposal.total_amount = total

    @staticmethod
    def _to_dict(proposal: Proposal) -> dict:
        return {
            "id": str(proposal.id),
            "tenant_id": str(proposal.tenant_id),
            "deal_id": str(proposal.deal_id) if proposal.deal_id else None,
            "lead_id": str(proposal.lead_id) if proposal.lead_id else None,
            "title": proposal.title,
            "content": proposal.content,
            "total_amount": str(proposal.total_amount) if proposal.total_amount else "0",
            "currency": proposal.currency,
            "status": proposal.status,
            "valid_until": proposal.valid_until.isoformat() if proposal.valid_until else None,
            "sent_at": proposal.sent_at.isoformat() if proposal.sent_at else None,
            "viewed_at": proposal.viewed_at.isoformat() if proposal.viewed_at else None,
            "created_at": proposal.created_at.isoformat() if proposal.created_at else None,
        }
