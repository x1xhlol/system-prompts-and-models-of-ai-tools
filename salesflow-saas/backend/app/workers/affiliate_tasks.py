from app.workers.celery_app import celery_app
from app.config import get_settings
from app.database import SessionLocal
from datetime import datetime, timezone, timedelta
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

BONUS_TIERS = [
    {"min_deals": 5, "bonus": 500},
    {"min_deals": 10, "bonus": 1500},
    {"min_deals": 15, "bonus": 3000},
]

COMMISSION_RATES = {
    "basic": {"price": 299, "rate": 0.15},
    "professional": {"price": 699, "rate": 0.20},
    "enterprise": {"price": 1499, "rate": 0.25},
}


@celery_app.task(name="app.workers.affiliate_tasks.check_monthly_targets")
def check_monthly_targets():
    """
    Check affiliate monthly targets and auto-promote to employed status.
    Runs daily at midnight.
    Target: 10 deals/month = automatic employment offer.
    """
    from app.models.affiliate import AffiliateMarketer, AffiliateStatus
    from sqlalchemy import select

    logger.info("Checking affiliate monthly targets for auto-employment...")

    with SessionLocal() as db:
        active_affiliates = db.execute(
            select(AffiliateMarketer).where(
                AffiliateMarketer.status == AffiliateStatus.ACTIVE
            )
        ).scalars().all()

        promoted = 0
        for affiliate in active_affiliates:
            if affiliate.current_month_deals >= 10:
                affiliate.status = AffiliateStatus.EMPLOYED
                affiliate.employed_at = datetime.now(timezone.utc)
                promoted += 1

                logger.info(f"Affiliate {affiliate.full_name} promoted! {affiliate.current_month_deals} deals")

                # Send congratulations via WhatsApp
                if affiliate.whatsapp or affiliate.phone:
                    phone = affiliate.whatsapp or affiliate.phone
                    message = f"""🎉 مبروك {affiliate.full_name}!

لقد حققت {affiliate.current_month_deals} صفقة هذا الشهر وأصبحت مؤهلاً للتوظيف الرسمي في Dealix!

المزايا الجديدة:
✅ راتب ثابت
✅ عمولات أعلى (20%/25%/30%)
✅ تأمين صحي
✅ إجازات مدفوعة

سيتواصل معك فريق الموارد البشرية خلال 48 ساعة لإتمام الإجراءات.

شكراً لجهودك المميزة! 🌟
—
Dealix - ديل اي اكس"""
                    from app.workers.message_tasks import send_whatsapp
                    send_whatsapp.delay(phone, message, "system")

                # Send email notification
                if affiliate.email:
                    from app.workers.message_tasks import send_email
                    send_email.delay(
                        affiliate.email,
                        "مبروك! أنت مؤهل للتوظيف الرسمي - Dealix",
                        f"مبروك {affiliate.full_name}! حققت {affiliate.current_month_deals} صفقة وأصبحت مؤهلاً للتوظيف الرسمي.",
                        "system",
                    )

        db.commit()
        logger.info(f"Monthly target check: {promoted} affiliates promoted from {len(active_affiliates)} active")

    return {"checked": len(active_affiliates), "promoted": promoted}


@celery_app.task(name="app.workers.affiliate_tasks.calculate_monthly_commissions")
def calculate_monthly_commissions():
    """
    Calculate and finalize monthly commissions for all affiliates.
    Runs on the 1st of each month.
    """
    from app.models.affiliate import AffiliateMarketer, AffiliatePerformance, AffiliateDeal, AffiliateStatus
    from sqlalchemy import select, and_, func

    logger.info("Calculating monthly commissions...")

    now = datetime.now(timezone.utc)
    current_month = now.strftime("%Y-%m")
    current_year = now.year

    with SessionLocal() as db:
        affiliates = db.execute(
            select(AffiliateMarketer).where(
                AffiliateMarketer.status.in_([AffiliateStatus.ACTIVE, AffiliateStatus.EMPLOYED])
            )
        ).scalars().all()

        for affiliate in affiliates:
            # Aggregate confirmed deals for this month
            deals = db.execute(
                select(AffiliateDeal).where(
                    and_(
                        AffiliateDeal.affiliate_id == affiliate.id,
                        AffiliateDeal.status == "confirmed",
                    )
                )
            ).scalars().all()

            total_commission = sum(d.commission_amount for d in deals)
            basic_sales = sum(1 for d in deals if d.plan_type == "basic")
            pro_sales = sum(1 for d in deals if d.plan_type == "professional")
            ent_sales = sum(1 for d in deals if d.plan_type == "enterprise")
            total_deals = len(deals)

            # Calculate bonus
            bonus = 0
            for tier in sorted(BONUS_TIERS, key=lambda t: t["min_deals"], reverse=True):
                if total_deals >= tier["min_deals"]:
                    bonus = tier["bonus"]
                    break

            # Create or update performance record
            existing = db.execute(
                select(AffiliatePerformance).where(
                    and_(
                        AffiliatePerformance.affiliate_id == affiliate.id,
                        AffiliatePerformance.month == current_month,
                    )
                )
            ).scalar_one_or_none()

            if existing:
                existing.deals_closed = total_deals
                existing.commission_earned = total_commission
                existing.bonus_earned = bonus
                existing.basic_plan_sales = basic_sales
                existing.professional_plan_sales = pro_sales
                existing.enterprise_plan_sales = ent_sales
                existing.payment_status = "pending"
            else:
                perf = AffiliatePerformance(
                    affiliate_id=affiliate.id,
                    month=current_month,
                    year=current_year,
                    deals_closed=total_deals,
                    commission_earned=total_commission,
                    bonus_earned=bonus,
                    basic_plan_sales=basic_sales,
                    professional_plan_sales=pro_sales,
                    enterprise_plan_sales=ent_sales,
                    payment_status="pending",
                )
                db.add(perf)

            # Reset monthly counter
            affiliate.current_month_deals = 0

            logger.info(f"Affiliate {affiliate.full_name}: {total_deals} deals, {total_commission} SAR commission, {bonus} SAR bonus")

        db.commit()
        logger.info(f"Monthly commissions calculated for {len(affiliates)} affiliates")

    return {"affiliates_processed": len(affiliates)}


@celery_app.task(name="app.workers.affiliate_tasks.send_affiliate_weekly_report")
def send_affiliate_weekly_report():
    """
    Send weekly performance report to all active affiliates.
    Runs every Sunday at 9 AM Riyadh time.
    """
    from app.models.affiliate import AffiliateMarketer, AffiliateStatus
    from sqlalchemy import select

    logger.info("Sending weekly reports to affiliates...")

    with SessionLocal() as db:
        affiliates = db.execute(
            select(AffiliateMarketer).where(
                AffiliateMarketer.status.in_([AffiliateStatus.ACTIVE, AffiliateStatus.EMPLOYED])
            )
        ).scalars().all()

        reports_sent = 0

        for affiliate in affiliates:
            report = f"""📊 تقريرك الأسبوعي - Dealix

مرحباً {affiliate.full_name}!

📈 أداؤك هذا الشهر:
• صفقات مغلقة: {affiliate.current_month_deals}
• إجمالي العمولات: {affiliate.total_commission_earned:,.0f} ر.س
• الهدف الشهري: 10 شركات

{'🎯 أنت على الطريق الصحيح!' if affiliate.current_month_deals >= 5 else '💪 كمّل! كل صفقة تقربك من الهدف!'}

{'🏆 مبروك! حققت الهدف!' if affiliate.current_month_deals >= 10 else f'⏳ باقي لك {10 - affiliate.current_month_deals} صفقات للوصول للهدف'}

نصيحة الأسبوع:
💡 ركز على المتابعة - 80% من الصفقات تتم بعد المتابعة الثالثة!

—
فريق Dealix - ديل اي اكس"""

            phone = affiliate.whatsapp or affiliate.phone
            if phone:
                from app.workers.message_tasks import send_whatsapp
                send_whatsapp.delay(phone, report, "system")
                reports_sent += 1

        logger.info(f"Weekly reports sent to {reports_sent} affiliates")

    return {"reports_sent": reports_sent}


@celery_app.task(name="app.workers.affiliate_tasks.ai_lead_generation_scan")
def ai_lead_generation_scan():
    """
    AI agent scans for new potential leads from various sources.
    Runs every 6 hours.
    """
    logger.info("AI lead generation scan initiated...")

    # Source scanning configuration
    scan_config = {
        "google_maps": {
            "cities": ["Riyadh", "Jeddah", "Dammam", "Khobar"],
            "industries": ["clinic", "dental", "real_estate", "restaurant", "salon", "gym"],
            "max_results_per_query": 20,
        },
        "saudi_commerce": {
            "enabled": True,
            "categories": ["healthcare", "real_estate", "food_service", "beauty"],
        },
    }

    results = {
        "sources_scanned": 0,
        "leads_found": 0,
        "leads_added": 0,
        "duplicates_skipped": 0,
    }

    # Note: Actual API calls require credentials
    # This task prepares the pipeline and logs the scan attempt
    for source, config in scan_config.items():
        results["sources_scanned"] += 1
        logger.info(f"Scanning source: {source} with config: {config}")

    logger.info(f"Lead generation scan completed: {results}")
    return results


@celery_app.task(name="app.workers.affiliate_tasks.ai_outreach_followup")
def ai_outreach_followup():
    """
    AI agent follows up with leads in active conversations.
    Runs every 30 minutes.
    """
    from app.models.ai_conversation import AIConversation, ConversationStatus
    from sqlalchemy import select, and_

    logger.info("AI outreach follow-up check...")

    with SessionLocal() as db:
        now = datetime.now(timezone.utc)
        stale_cutoff = now - timedelta(hours=24)

        # Find active conversations with no response in 24h
        stale_conversations = db.execute(
            select(AIConversation).where(
                and_(
                    AIConversation.status == ConversationStatus.ACTIVE,
                    AIConversation.last_message_at < stale_cutoff,
                    AIConversation.meeting_booked == False,
                )
            ).limit(50)
        ).scalars().all()

        followups = 0
        escalations = 0

        for conv in stale_conversations:
            # High interest + no response = escalate to human
            if conv.interest_level >= 70:
                conv.status = ConversationStatus.ESCALATED
                conv.escalated_at = now
                conv.escalation_reason = "High interest lead, no response for 24h"
                escalations += 1
            else:
                # Send follow-up message
                if conv.contact_phone:
                    followup_msg = f"مرحباً{' ' + conv.contact_name if conv.contact_name else ''}! تواصلنا معك قبل فترة بخصوص Dealix. هل عندك أي سؤال أقدر أساعدك فيه؟"
                    from app.workers.message_tasks import send_whatsapp
                    send_whatsapp.delay(conv.contact_phone, followup_msg, str(conv.tenant_id))
                    conv.messages_count += 1
                    conv.last_message_at = now
                    followups += 1

        db.commit()
        logger.info(f"Follow-up: {followups} messages sent, {escalations} escalated")

    return {"followups": followups, "escalations": escalations}


@celery_app.task(name="app.workers.affiliate_tasks.process_auto_bookings")
def process_auto_bookings():
    """
    Process and confirm auto-booked meetings.
    Runs every 15 minutes.
    """
    from app.models.ai_conversation import AutoBooking
    from sqlalchemy import select

    logger.info("Processing auto-bookings...")

    with SessionLocal() as db:
        pending_bookings = db.execute(
            select(AutoBooking).where(AutoBooking.status == "scheduled")
        ).scalars().all()

        confirmed = 0

        for booking in pending_bookings:
            # Send confirmation to client
            if booking.client_phone:
                meeting_time = booking.meeting_datetime.strftime("%H:%M")
                meeting_date = booking.meeting_datetime.strftime("%Y-%m-%d")

                confirmation = f"""✅ تأكيد اجتماع مع Dealix

مرحباً {booking.client_name}!

📅 التاريخ: {meeting_date}
⏰ الوقت: {meeting_time} (بتوقيت الرياض)
⏱ المدة: {booking.duration_minutes} دقيقة
📋 النوع: {booking.meeting_type}

نتطلع لمقابلتك!
إذا تبي تغيير الموعد، تواصل معنا.

—
Dealix - ديل اي اكس"""

                from app.workers.message_tasks import send_whatsapp
                send_whatsapp.delay(booking.client_phone, confirmation, str(booking.tenant_id))

            booking.status = "confirmed"
            booking.confirmed_at = datetime.now(timezone.utc)
            confirmed += 1

        db.commit()
        logger.info(f"Confirmed {confirmed} bookings")

    return {"confirmed": confirmed}
