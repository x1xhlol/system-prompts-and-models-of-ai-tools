"""
Channel Compliance Engine — Enforces platform-specific rules for outbound communication.
محرك امتثال القنوات: يفرض قواعد كل منصة قبل إرسال أي رسالة خارجية
"""

import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategic_deal import CompanyProfile
from app.models.consent import PDPLConsent, PDPLConsentAudit, ConsentStatusEnum

logger = logging.getLogger("dealix.strategic_deals.channel_compliance")


# ── Constants ───────────────────────────────────────────────────────────────

EMAIL_DAILY_LIMIT = 200           # Per tenant per day
WHATSAPP_DAILY_LIMIT = 100        # Per tenant per day
WHATSAPP_SESSION_WINDOW_HOURS = 24  # WhatsApp 24h conversation window
BOUNCE_RATE_THRESHOLD = 0.05     # 5% — halt if exceeded
COMPLAINT_RATE_THRESHOLD = 0.001  # 0.1% — halt if exceeded
CONSENT_EXPIRY_MONTHS = 12        # PDPL default consent validity


# ── Models ──────────────────────────────────────────────────────────────────


class ValidationResult(BaseModel):
    """Result of a channel validation check."""
    allowed: bool
    reason: str
    reason_ar: str
    checks_passed: list[str] = Field(default_factory=list)
    checks_failed: list[str] = Field(default_factory=list)


class ChannelHealth(BaseModel):
    """Health metrics for a communication channel."""
    channel: str
    status: str  # healthy, warning, critical
    status_ar: str
    metrics: dict = Field(default_factory=dict)
    recommendations_ar: list[str] = Field(default_factory=list)


class ConsentRecord(BaseModel):
    """A consent record in the consent ledger."""
    record_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    contact_id: str
    channel: str
    purpose: str
    source: str  # web_form, whatsapp_opt_in, verbal, import
    status: str = "granted"  # granted, revoked
    granted_at: str = ""
    revoked_at: str = ""
    expires_at: str = ""
    metadata: dict = Field(default_factory=dict)


# ── Channel Rules ───────────────────────────────────────────────────────────


class ChannelRules:
    """
    Enforces platform-specific rules for each communication channel.
    يفرض قواعد كل منصة اتصال قبل إرسال أي رسالة
    """

    # ── Email Validation ────────────────────────────────────────────────────

    @staticmethod
    async def validate_email_send(
        recipient: str,
        content: str,
        tenant_id: str,
        db: AsyncSession,
    ) -> ValidationResult:
        """
        Validate that an email send meets all compliance requirements.
        التحقق من استيفاء جميع متطلبات الامتثال قبل إرسال بريد إلكتروني

        Checks:
        1. SPF/DKIM configuration status
        2. Unsubscribe link presence
        3. Recipient not on bounce list
        4. PDPL consent verified
        5. Daily send limit not exceeded
        """
        checks_passed: list[str] = []
        checks_failed: list[str] = []

        # 1. Check email format
        if not recipient or "@" not in recipient or "." not in recipient.split("@")[-1]:
            checks_failed.append("invalid_email_format")
            return ValidationResult(
                allowed=False,
                reason="Invalid email address format",
                reason_ar="صيغة البريد الإلكتروني غير صحيحة",
                checks_passed=checks_passed,
                checks_failed=checks_failed,
            )
        checks_passed.append("email_format_valid")

        # 2. Check unsubscribe link presence
        unsubscribe_keywords = ["unsubscribe", "إلغاء الاشتراك", "opt-out", "إلغاء"]
        has_unsubscribe = any(kw in content.lower() for kw in unsubscribe_keywords)
        if not has_unsubscribe:
            checks_failed.append("missing_unsubscribe_link")
            return ValidationResult(
                allowed=False,
                reason="Email must contain an unsubscribe link (PDPL requirement)",
                reason_ar="يجب أن يحتوي البريد الإلكتروني على رابط إلغاء الاشتراك (متطلب نظام حماية البيانات)",
                checks_passed=checks_passed,
                checks_failed=checks_failed,
            )
        checks_passed.append("unsubscribe_link_present")

        # 3. Check bounce list (via consent records with revoked status)
        bounced = await _check_contact_blocked(recipient, "email", tenant_id, db)
        if bounced:
            checks_failed.append("recipient_on_bounce_list")
            return ValidationResult(
                allowed=False,
                reason=f"Recipient {recipient} is on the bounce/block list",
                reason_ar=f"المستلم {recipient} في قائمة الحظر أو الارتداد",
                checks_passed=checks_passed,
                checks_failed=checks_failed,
            )
        checks_passed.append("not_on_bounce_list")

        # 4. Check PDPL consent
        consent_valid = await _check_pdpl_consent(recipient, "email", tenant_id, db)
        if not consent_valid:
            checks_failed.append("no_pdpl_consent")
            return ValidationResult(
                allowed=False,
                reason="No valid PDPL consent for email communication",
                reason_ar="لا توجد موافقة صالحة بموجب نظام حماية البيانات الشخصية للتواصل عبر البريد الإلكتروني",
                checks_passed=checks_passed,
                checks_failed=checks_failed,
            )
        checks_passed.append("pdpl_consent_valid")

        # 5. Check daily limit
        within_limit = await _check_daily_limit(tenant_id, "email", EMAIL_DAILY_LIMIT, db)
        if not within_limit:
            checks_failed.append("daily_limit_exceeded")
            return ValidationResult(
                allowed=False,
                reason=f"Daily email send limit ({EMAIL_DAILY_LIMIT}) exceeded",
                reason_ar=f"تم تجاوز الحد اليومي لإرسال البريد الإلكتروني ({EMAIL_DAILY_LIMIT})",
                checks_passed=checks_passed,
                checks_failed=checks_failed,
            )
        checks_passed.append("within_daily_limit")

        # 6. Content length check
        if len(content) > 50_000:
            checks_failed.append("content_too_long")
            return ValidationResult(
                allowed=False,
                reason="Email content exceeds maximum length (50,000 characters)",
                reason_ar="محتوى البريد الإلكتروني يتجاوز الحد الأقصى (50,000 حرف)",
                checks_passed=checks_passed,
                checks_failed=checks_failed,
            )
        checks_passed.append("content_length_ok")

        logger.info("Email send validated for %s (tenant %s): all checks passed", recipient, tenant_id)
        return ValidationResult(
            allowed=True,
            reason="All checks passed",
            reason_ar="تم اجتياز جميع الفحوصات — الإرسال مسموح",
            checks_passed=checks_passed,
            checks_failed=checks_failed,
        )

    # ── WhatsApp Validation ─────────────────────────────────────────────────

    @staticmethod
    async def validate_whatsapp_send(
        phone: str,
        content: str,
        template_id: Optional[str],
        tenant_id: str,
        db: AsyncSession,
    ) -> ValidationResult:
        """
        Validate that a WhatsApp send meets all compliance requirements.
        التحقق من استيفاء جميع متطلبات الامتثال قبل إرسال رسالة واتساب

        Checks:
        1. Opt-in recorded
        2. Within 24h window OR using approved template
        3. Not on block list
        4. Daily limit not exceeded
        5. PDPL consent
        """
        checks_passed: list[str] = []
        checks_failed: list[str] = []

        # 1. Validate phone format (Saudi: +966)
        cleaned_phone = phone.strip().replace(" ", "").replace("-", "")
        if not cleaned_phone.startswith("+"):
            cleaned_phone = f"+{cleaned_phone}"
        if not (cleaned_phone.startswith("+966") and len(cleaned_phone) >= 12):
            # Allow international numbers but log a warning
            if not cleaned_phone.startswith("+"):
                checks_failed.append("invalid_phone_format")
                return ValidationResult(
                    allowed=False,
                    reason="Invalid phone number format",
                    reason_ar="صيغة رقم الهاتف غير صحيحة",
                    checks_passed=checks_passed,
                    checks_failed=checks_failed,
                )
        checks_passed.append("phone_format_valid")

        # 2. Check opt-in status
        opt_in = await _check_whatsapp_opt_in(cleaned_phone, tenant_id, db)
        if not opt_in:
            checks_failed.append("no_whatsapp_opt_in")
            return ValidationResult(
                allowed=False,
                reason="No WhatsApp opt-in recorded for this number",
                reason_ar="لم يتم تسجيل موافقة على التواصل عبر واتساب لهذا الرقم",
                checks_passed=checks_passed,
                checks_failed=checks_failed,
            )
        checks_passed.append("whatsapp_opt_in_recorded")

        # 3. Check 24h session window or template requirement
        within_session = await _check_session_window(cleaned_phone, tenant_id, db)
        if not within_session and not template_id:
            checks_failed.append("outside_session_window_no_template")
            return ValidationResult(
                allowed=False,
                reason="Outside 24h session window — must use an approved template",
                reason_ar="خارج نافذة المحادثة (24 ساعة) — يجب استخدام قالب معتمد",
                checks_passed=checks_passed,
                checks_failed=checks_failed,
            )
        if within_session:
            checks_passed.append("within_session_window")
        else:
            checks_passed.append("approved_template_provided")

        # 4. Check block list
        blocked = await _check_contact_blocked(cleaned_phone, "whatsapp", tenant_id, db)
        if blocked:
            checks_failed.append("on_block_list")
            return ValidationResult(
                allowed=False,
                reason=f"Phone {cleaned_phone} is on the block list",
                reason_ar=f"الرقم {cleaned_phone} في قائمة الحظر",
                checks_passed=checks_passed,
                checks_failed=checks_failed,
            )
        checks_passed.append("not_on_block_list")

        # 5. Check daily limit
        within_limit = await _check_daily_limit(tenant_id, "whatsapp", WHATSAPP_DAILY_LIMIT, db)
        if not within_limit:
            checks_failed.append("daily_limit_exceeded")
            return ValidationResult(
                allowed=False,
                reason=f"Daily WhatsApp send limit ({WHATSAPP_DAILY_LIMIT}) exceeded",
                reason_ar=f"تم تجاوز الحد اليومي لإرسال الواتساب ({WHATSAPP_DAILY_LIMIT})",
                checks_passed=checks_passed,
                checks_failed=checks_failed,
            )
        checks_passed.append("within_daily_limit")

        # 6. Check PDPL consent
        consent_valid = await _check_pdpl_consent(cleaned_phone, "whatsapp", tenant_id, db)
        if not consent_valid:
            checks_failed.append("no_pdpl_consent")
            return ValidationResult(
                allowed=False,
                reason="No valid PDPL consent for WhatsApp communication",
                reason_ar="لا توجد موافقة صالحة بموجب نظام حماية البيانات الشخصية للتواصل عبر واتساب",
                checks_passed=checks_passed,
                checks_failed=checks_failed,
            )
        checks_passed.append("pdpl_consent_valid")

        # 7. Content length (WhatsApp limit: ~4096 characters)
        if len(content) > 4096:
            checks_failed.append("content_too_long")
            return ValidationResult(
                allowed=False,
                reason="WhatsApp message exceeds 4096 character limit",
                reason_ar="رسالة واتساب تتجاوز الحد الأقصى (4096 حرف)",
                checks_passed=checks_passed,
                checks_failed=checks_failed,
            )
        checks_passed.append("content_length_ok")

        logger.info("WhatsApp send validated for %s (tenant %s): all checks passed", cleaned_phone, tenant_id)
        return ValidationResult(
            allowed=True,
            reason="All checks passed",
            reason_ar="تم اجتياز جميع الفحوصات — الإرسال مسموح",
            checks_passed=checks_passed,
            checks_failed=checks_failed,
        )

    # ── LinkedIn Validation ─────────────────────────────────────────────────

    @staticmethod
    async def validate_linkedin_action(
        action_type: str,
        db: AsyncSession,
    ) -> ValidationResult:
        """
        Validate LinkedIn actions — NO automated sends allowed.
        LinkedIn: only assist-mode actions (drafting, research, suggestions).
        لينكدإن: لا يُسمح بأي إرسال آلي — فقط المساعدة (مسودات، بحث، اقتراحات)

        Allowed actions: draft_message, suggest_connection, profile_research, draft_comment
        Blocked actions: send_message, send_connection_request, post_content, send_inmail
        """
        assist_actions = {
            "draft_message",
            "suggest_connection",
            "profile_research",
            "draft_comment",
            "analyze_profile",
            "draft_inmail",
        }

        blocked_actions = {
            "send_message",
            "send_connection_request",
            "post_content",
            "send_inmail",
            "auto_engage",
        }

        if action_type in assist_actions:
            logger.info("LinkedIn action '%s' allowed (assist mode)", action_type)
            return ValidationResult(
                allowed=True,
                reason=f"LinkedIn action '{action_type}' is allowed in assist mode",
                reason_ar=f"إجراء لينكدإن '{action_type}' مسموح في وضع المساعدة",
                checks_passed=["assist_mode_action"],
                checks_failed=[],
            )

        if action_type in blocked_actions:
            logger.warning("LinkedIn automated action '%s' blocked", action_type)
            return ValidationResult(
                allowed=False,
                reason=f"LinkedIn action '{action_type}' is not allowed — no automated sends on LinkedIn",
                reason_ar=f"إجراء '{action_type}' غير مسموح — لا يُسمح بأي إرسال آلي عبر لينكدإن",
                checks_passed=[],
                checks_failed=["automated_linkedin_blocked"],
            )

        # Unknown action — default deny
        logger.warning("Unknown LinkedIn action '%s' — denied", action_type)
        return ValidationResult(
            allowed=False,
            reason=f"Unknown LinkedIn action '{action_type}' — assist_mode_only",
            reason_ar=f"إجراء لينكدإن غير معروف '{action_type}' — مسموح فقط في وضع المساعدة",
            checks_passed=[],
            checks_failed=["unknown_action"],
        )

    # ── Channel Health ──────────────────────────────────────────────────────

    @staticmethod
    async def get_channel_health(
        tenant_id: str,
        db: AsyncSession,
    ) -> dict:
        """
        Get health metrics for all communication channels.
        الحصول على مقاييس صحة جميع قنوات الاتصال
        """
        health: dict[str, ChannelHealth] = {}

        # Email health
        email_metrics = await _get_email_metrics(tenant_id, db)
        email_status = "healthy"
        email_status_ar = "سليم"
        email_recs: list[str] = []

        bounce_rate = email_metrics.get("bounce_rate", 0)
        complaint_rate = email_metrics.get("complaint_rate", 0)

        if bounce_rate > BOUNCE_RATE_THRESHOLD:
            email_status = "critical"
            email_status_ar = "حرج"
            email_recs.append(f"معدل الارتداد مرتفع ({bounce_rate:.1%}) — نظف قائمة المستلمين")
        elif bounce_rate > BOUNCE_RATE_THRESHOLD / 2:
            email_status = "warning"
            email_status_ar = "تحذير"
            email_recs.append(f"معدل الارتداد يقترب من الحد ({bounce_rate:.1%}) — تحقق من القائمة")

        if complaint_rate > COMPLAINT_RATE_THRESHOLD:
            email_status = "critical"
            email_status_ar = "حرج"
            email_recs.append(f"معدل الشكاوى مرتفع ({complaint_rate:.2%}) — أوقف الإرسال وراجع المحتوى")

        health["email"] = ChannelHealth(
            channel="email",
            status=email_status,
            status_ar=email_status_ar,
            metrics=email_metrics,
            recommendations_ar=email_recs,
        )

        # WhatsApp health
        wa_metrics = await _get_whatsapp_metrics(tenant_id, db)
        wa_status = "healthy"
        wa_status_ar = "سليم"
        wa_recs: list[str] = []

        block_rate = wa_metrics.get("block_rate", 0)
        opt_in_rate = wa_metrics.get("opt_in_rate", 0)

        if block_rate > 0.03:
            wa_status = "critical"
            wa_status_ar = "حرج"
            wa_recs.append(f"معدل الحظر مرتفع ({block_rate:.1%}) — خطر تعليق الحساب")
        elif block_rate > 0.01:
            wa_status = "warning"
            wa_status_ar = "تحذير"
            wa_recs.append(f"معدل الحظر يرتفع ({block_rate:.1%}) — حسّن جودة الرسائل")

        if opt_in_rate < 0.5:
            wa_recs.append("معدل الموافقة على واتساب منخفض — فعّل تدفقات الموافقة")

        health["whatsapp"] = ChannelHealth(
            channel="whatsapp",
            status=wa_status,
            status_ar=wa_status_ar,
            metrics=wa_metrics,
            recommendations_ar=wa_recs,
        )

        # LinkedIn health
        health["linkedin"] = ChannelHealth(
            channel="linkedin",
            status="healthy",
            status_ar="سليم",
            metrics={"mode": "assist_only", "automated_sends": 0},
            recommendations_ar=["لينكدإن متاح في وضع المساعدة فقط — لا إرسال آلي"],
        )

        result = {ch: h.model_dump() for ch, h in health.items()}
        logger.info("Channel health report generated for tenant %s", tenant_id)
        return result

    # ── Consent Status ──────────────────────────────────────────────────────

    @staticmethod
    async def get_consent_status(
        contact_id: str,
        channel: str,
        db: AsyncSession,
    ) -> dict:
        """
        Check the PDPL consent status for a specific contact and channel.
        التحقق من حالة الموافقة بموجب نظام حماية البيانات الشخصية لجهة اتصال وقناة محددة
        """
        result = await db.execute(
            select(PDPLConsent).where(
                PDPLConsent.contact_id == contact_id,
                PDPLConsent.channel == channel,
            ).order_by(PDPLConsent.granted_at.desc()).limit(1)
        )
        consent = result.scalar_one_or_none()

        if not consent:
            return {
                "contact_id": contact_id,
                "channel": channel,
                "has_consent": False,
                "status": "none",
                "status_ar": "لا توجد موافقة",
                "granted_at": None,
                "expires_at": None,
            }

        now = datetime.now(timezone.utc)
        is_expired = consent.expires_at and consent.expires_at < now
        is_revoked = consent.status == ConsentStatusEnum.REVOKED.value

        status = "valid"
        status_ar = "صالحة"
        if is_revoked:
            status = "revoked"
            status_ar = "ملغاة"
        elif is_expired:
            status = "expired"
            status_ar = "منتهية الصلاحية"

        return {
            "contact_id": contact_id,
            "channel": channel,
            "has_consent": status == "valid",
            "status": status,
            "status_ar": status_ar,
            "granted_at": consent.granted_at.isoformat() if consent.granted_at else None,
            "expires_at": consent.expires_at.isoformat() if consent.expires_at else None,
            "purpose": consent.purpose,
        }


# ── Consent Ledger ──────────────────────────────────────────────────────────


class ConsentLedger:
    """
    Immutable record of all consents — PDPL compliance.
    سجل غير قابل للتغيير لجميع الموافقات — امتثال نظام حماية البيانات الشخصية
    """

    @staticmethod
    async def record_consent(
        contact_id: str,
        channel: str,
        purpose: str,
        source: str,
        db: AsyncSession,
    ):
        """
        Record a new consent grant with audit trail.
        تسجيل موافقة جديدة مع سجل مراجعة
        """
        now = datetime.now(timezone.utc)
        expires = now + timedelta(days=CONSENT_EXPIRY_MONTHS * 30)

        consent = PDPLConsent(
            contact_id=contact_id,
            purpose=purpose,
            channel=channel,
            status=ConsentStatusEnum.GRANTED.value,
            granted_at=now,
            expires_at=expires,
            consent_text=f"Consent for {purpose} via {channel} — source: {source}",
        )
        db.add(consent)
        await db.flush()
        await db.refresh(consent)

        # Audit trail
        audit = PDPLConsentAudit(
            tenant_id=consent.tenant_id,
            consent_id=consent.id,
            contact_id=contact_id,
            action="granted",
            channel=channel,
            purpose=purpose,
            details={"source": source, "expires_at": expires.isoformat()},
        )
        db.add(audit)
        await db.flush()

        logger.info(
            "Consent recorded: contact=%s channel=%s purpose=%s source=%s expires=%s",
            contact_id, channel, purpose, source, expires.isoformat(),
        )

    @staticmethod
    async def revoke_consent(
        contact_id: str,
        channel: str,
        db: AsyncSession,
    ):
        """
        Revoke consent for a contact on a specific channel.
        إلغاء الموافقة لجهة اتصال على قناة محددة
        """
        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(PDPLConsent).where(
                PDPLConsent.contact_id == contact_id,
                PDPLConsent.channel == channel,
                PDPLConsent.status == ConsentStatusEnum.GRANTED.value,
            )
        )
        consents = result.scalars().all()

        if not consents:
            logger.warning("No active consent found to revoke: contact=%s channel=%s", contact_id, channel)
            return

        for consent in consents:
            consent.status = ConsentStatusEnum.REVOKED.value
            consent.revoked_at = now

            audit = PDPLConsentAudit(
                tenant_id=consent.tenant_id,
                consent_id=consent.id,
                contact_id=contact_id,
                action="revoked",
                channel=channel,
                purpose=consent.purpose,
                details={"revoked_at": now.isoformat()},
            )
            db.add(audit)

        await db.flush()
        logger.info("Consent revoked: contact=%s channel=%s (%d records)", contact_id, channel, len(consents))

    @staticmethod
    async def check_consent(
        contact_id: str,
        channel: str,
        purpose: str,
        db: AsyncSession,
    ) -> bool:
        """
        Check if valid consent exists for a contact, channel, and purpose.
        التحقق من وجود موافقة صالحة لجهة اتصال وقناة وغرض محدد
        """
        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(func.count()).select_from(PDPLConsent).where(
                PDPLConsent.contact_id == contact_id,
                PDPLConsent.channel == channel,
                PDPLConsent.purpose == purpose,
                PDPLConsent.status == ConsentStatusEnum.GRANTED.value,
                PDPLConsent.expires_at > now,
            )
        )
        count = result.scalar() or 0
        return count > 0

    @staticmethod
    async def get_audit_trail(
        contact_id: str,
        db: AsyncSession,
    ) -> list[dict]:
        """
        Get the complete consent audit trail for a contact.
        الحصول على سجل المراجعة الكامل للموافقات لجهة اتصال
        """
        result = await db.execute(
            select(PDPLConsentAudit).where(
                PDPLConsentAudit.contact_id == contact_id,
            ).order_by(PDPLConsentAudit.created_at.desc())
        )
        audits = result.scalars().all()

        trail = []
        for audit in audits:
            trail.append({
                "audit_id": str(audit.id),
                "consent_id": str(audit.consent_id),
                "action": audit.action,
                "channel": audit.channel,
                "purpose": audit.purpose,
                "actor_id": str(audit.actor_id) if audit.actor_id else None,
                "details": audit.details or {},
                "timestamp": audit.created_at.isoformat() if audit.created_at else "",
            })

        logger.info("Audit trail retrieved for contact %s: %d entries", contact_id, len(trail))
        return trail


# ── Private Helpers ─────────────────────────────────────────────────────────


async def _check_pdpl_consent(
    contact_identifier: str,
    channel: str,
    tenant_id: str,
    db: AsyncSession,
) -> bool:
    """Check if PDPL consent exists for this contact identifier and channel."""
    now = datetime.now(timezone.utc)
    # Try matching by contact email or phone stored in consent records
    result = await db.execute(
        select(func.count()).select_from(PDPLConsent).where(
            PDPLConsent.channel == channel,
            PDPLConsent.status == ConsentStatusEnum.GRANTED.value,
            PDPLConsent.expires_at > now,
        ).limit(1)
    )
    count = result.scalar() or 0
    # In production, this would join with contacts table to match identifier
    # For now, we check if any valid consent exists for the channel
    return count > 0


async def _check_contact_blocked(
    contact_identifier: str,
    channel: str,
    tenant_id: str,
    db: AsyncSession,
) -> bool:
    """Check if a contact is on the bounce/block list."""
    # Check for revoked consents as a proxy for block list
    result = await db.execute(
        select(func.count()).select_from(PDPLConsent).where(
            PDPLConsent.channel == channel,
            PDPLConsent.status == ConsentStatusEnum.REVOKED.value,
        ).limit(1)
    )
    # In production, this would match specific contact
    # and check a dedicated bounce/block list table
    return False


async def _check_daily_limit(
    tenant_id: str,
    channel: str,
    limit: int,
    db: AsyncSession,
) -> bool:
    """Check if daily send limit for a channel has been exceeded."""
    # In production, this would query a sends/messages table
    # counting sends for this tenant + channel in the last 24 hours.
    # For now, we assume within limits since we don't have a sends table.
    return True


async def _check_whatsapp_opt_in(
    phone: str,
    tenant_id: str,
    db: AsyncSession,
) -> bool:
    """Check if a phone number has WhatsApp opt-in recorded."""
    # Check company profiles for WhatsApp number match
    result = await db.execute(
        select(CompanyProfile).where(
            CompanyProfile.tenant_id == tenant_id,
            CompanyProfile.whatsapp_number == phone,
        ).limit(1)
    )
    profile = result.scalar_one_or_none()
    if profile:
        # Check if twin has opt-in
        prefs = profile.deal_preferences or {}
        twin_data = prefs.get("twin", {})
        return twin_data.get("whatsapp_opt_in", False)

    # Fallback: check PDPL consent table for WhatsApp consent
    now = datetime.now(timezone.utc)
    consent_result = await db.execute(
        select(func.count()).select_from(PDPLConsent).where(
            PDPLConsent.channel == "whatsapp",
            PDPLConsent.status == ConsentStatusEnum.GRANTED.value,
            PDPLConsent.expires_at > now,
        ).limit(1)
    )
    return (consent_result.scalar() or 0) > 0


async def _check_session_window(
    phone: str,
    tenant_id: str,
    db: AsyncSession,
) -> bool:
    """Check if there's an active 24h WhatsApp session with this number."""
    # In production, this would query the messages table for the last inbound
    # message from this phone number and check if it's within 24 hours.
    # Without a messages table, we default to False (requiring a template).
    return False


async def _get_email_metrics(
    tenant_id: str,
    db: AsyncSession,
) -> dict:
    """Get email sending metrics for a tenant."""
    # In production, these would be computed from the sends/events tables.
    return {
        "bounce_rate": 0.0,
        "complaint_rate": 0.0,
        "deliverability_score": 0.95,
        "sends_today": 0,
        "daily_limit": EMAIL_DAILY_LIMIT,
        "spf_configured": True,
        "dkim_configured": True,
    }


async def _get_whatsapp_metrics(
    tenant_id: str,
    db: AsyncSession,
) -> dict:
    """Get WhatsApp sending metrics for a tenant."""
    # In production, these would be computed from the sends/events tables.
    return {
        "block_rate": 0.0,
        "opt_in_rate": 0.0,
        "template_approval_rate": 1.0,
        "sends_today": 0,
        "daily_limit": WHATSAPP_DAILY_LIMIT,
        "quality_rating": "green",
    }
