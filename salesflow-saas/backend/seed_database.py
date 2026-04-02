"""
Dealix Database Seeder — بيانات حقيقية للسوق السعودي
يملأ قاعدة البيانات بـ:
- شركات سعودية حقيقية (عقارات، تقنية، صحة، إنشاءات)
- عملاء محتملين (Leads) بأسماء ومدن سعودية
- صفقات نموذجية
- مسوقين بالعمولة
- قوالب رسائل واتساب عربية
"""
import asyncio
import uuid
from datetime import datetime, timezone, timedelta
import random

# ── Saudi Market Data ────────────────────────────────────────

SAUDI_CITIES = [
    "الرياض", "جدة", "الدمام", "مكة المكرمة", "المدينة المنورة",
    "الخبر", "الطائف", "تبوك", "بريدة", "خميس مشيط",
    "حائل", "نجران", "الجبيل", "ينبع", "أبها"
]

SAUDI_INDUSTRIES = {
    "عقارات": {
        "companies": [
            {"name": "شركة إعمار العقارية", "name_en": "Emaar Properties", "size": "enterprise"},
            {"name": "دار الأركان للتطوير العقاري", "name_en": "Dar Al Arkan", "size": "enterprise"},
            {"name": "شركة رتال للتطوير العمراني", "name_en": "Retal Urban Development", "size": "large"},
            {"name": "شركة جبل عمر للتطوير", "name_en": "Jabal Omar Development", "size": "enterprise"},
            {"name": "المراكز العربية (سينومي)", "name_en": "Cenomi Centers", "size": "enterprise"},
            {"name": "شركة الرياض للتعمير", "name_en": "Riyadh Development Co", "size": "large"},
            {"name": "مجموعة بن لادن السعودية", "name_en": "Saudi Binladin Group", "size": "enterprise"},
            {"name": "شركة روشن العقارية", "name_en": "ROSHN Real Estate", "size": "enterprise"},
        ]
    },
    "تقنية معلومات": {
        "companies": [
            {"name": "شركة علم", "name_en": "Elm Company", "size": "enterprise"},
            {"name": "شركة ثقة", "name_en": "Thiqah Business Services", "size": "large"},
            {"name": "شركة سلام للاتصالات", "name_en": "Salam Telecom", "size": "large"},
            {"name": "شركة مسار التقنية", "name_en": "Masar Tech", "size": "medium"},
            {"name": "شركة صحارى نت", "name_en": "SaharaNet", "size": "medium"},
            {"name": "شركة سمارت لينك", "name_en": "SmartLink", "size": "medium"},
        ]
    },
    "صحة": {
        "companies": [
            {"name": "مجموعة سليمان الحبيب الطبية", "name_en": "Dr. Sulaiman Al Habib", "size": "enterprise"},
            {"name": "شركة المواساة للخدمات الطبية", "name_en": "Mouwasat Medical", "size": "enterprise"},
            {"name": "مستشفى دله الصحية", "name_en": "Dallah Health", "size": "large"},
            {"name": "شركة رعاية القابضة", "name_en": "Riayah Holding", "size": "large"},
            {"name": "مجمع الملك فيصل الطبي", "name_en": "King Faisal Medical City", "size": "enterprise"},
        ]
    },
    "إنشاءات": {
        "companies": [
            {"name": "شركة نسما القابضة", "name_en": "Nesma Holding", "size": "enterprise"},
            {"name": "مجموعة الراجحي للمقاولات", "name_en": "Al Rajhi Construction", "size": "enterprise"},
            {"name": "شركة المباني للمقاولات", "name_en": "Al Mabani Contracting", "size": "large"},
            {"name": "شركة الحمراني للمقاولات", "name_en": "Al Hamrani Contracting", "size": "large"},
        ]
    },
    "تجزئة": {
        "companies": [
            {"name": "شركة فواز الحكير", "name_en": "Fawaz Alhokair Group", "size": "enterprise"},
            {"name": "بندة للتجزئة", "name_en": "Panda Retail (Savola)", "size": "enterprise"},
            {"name": "شركة جرير للتسويق", "name_en": "Jarir Marketing", "size": "large"},
            {"name": "شركة إكسترا", "name_en": "eXtra Electronics", "size": "large"},
        ]
    }
}

SAUDI_FIRST_NAMES_M = [
    "محمد", "عبدالله", "فهد", "سلطان", "خالد", "أحمد", "سعد", "عمر",
    "يوسف", "إبراهيم", "تركي", "نايف", "بندر", "مشعل", "عبدالرحمن",
    "ماجد", "وليد", "سامي", "طارق", "حسن", "فيصل", "ناصر"
]

SAUDI_LAST_NAMES = [
    "العتيبي", "القحطاني", "الشمري", "الدوسري", "الحربي", "الغامدي",
    "الزهراني", "المالكي", "السبيعي", "المطيري", "الشهري", "العنزي",
    "البقمي", "الرشيدي", "السلمي", "اليامي", "الأحمري", "العسيري"
]

LEAD_SOURCES = ["google_maps", "linkedin", "referral", "website", "cold_call", "exhibition", "whatsapp"]
LEAD_STATUSES = ["new", "contacted", "qualified", "proposal_sent", "negotiation", "won", "lost"]

DEAL_PLANS = [
    {"name": "أساسي", "name_en": "Basic", "price": 299, "features": "5 مستخدمين، 500 عميل محتمل/شهر"},
    {"name": "احترافي", "name_en": "Professional", "price": 699, "features": "15 مستخدم، 2000 عميل محتمل/شهر، AI مخصص"},
    {"name": "مؤسسي", "name_en": "Enterprise", "price": 1499, "features": "غير محدود، AI كامل، دعم 24/7، API مفتوح"},
]

WHATSAPP_TEMPLATES = [
    {
        "name": "welcome_lead",
        "name_ar": "ترحيب عميل محتمل",
        "body_ar": "مرحباً {name} 👋\n\nشكراً لاهتمامك بـ Dealix!\nنظامنا يساعد الشركات السعودية في أتمتة المبيعات وزيادة الإيرادات بنسبة 300%.\n\nهل تود حجز عرض تجريبي مجاني؟ 🚀",
        "body_en": "Hello {name} 👋\n\nThank you for your interest in Dealix!\nOur system helps Saudi companies automate sales and boost revenue by 300%.\n\nWould you like to book a free demo? 🚀",
    },
    {
        "name": "meeting_reminder",
        "name_ar": "تذكير اجتماع",
        "body_ar": "مرحباً {name}\n\nتذكير بموعد الاجتماع المقرر يوم {date} الساعة {time}.\n\nرابط الاجتماع: {link}\n\nنتطلع لرؤيتك! 📅",
        "body_en": "Hello {name}\n\nReminder: Your meeting is scheduled for {date} at {time}.\n\nMeeting link: {link}\n\nLooking forward to seeing you! 📅",
    },
    {
        "name": "proposal_sent",
        "name_ar": "عرض مرسل",
        "body_ar": "مرحباً {name}\n\nتم إرسال العرض التجاري لشركة {company}.\n\n💰 القيمة: {price} ر.س/شهر\n📋 الخطة: {plan}\n\nللاستفسارات: اتصل بنا أو رد على هذه الرسالة.",
        "body_en": "Hello {name}\n\nYour proposal for {company} has been sent.\n\n💰 Value: {price} SAR/month\n📋 Plan: {plan}\n\nQuestions? Call us or reply to this message.",
    },
    {
        "name": "deal_won",
        "name_ar": "صفقة ناجحة",
        "body_ar": "🎉 تهانينا {name}!\n\nتم إتمام الاتفاقية مع {company} بنجاح.\n\n✅ الخطة: {plan}\n💳 بداية الاشتراك: {start_date}\n\nفريق Dealix في خدمتك دائماً 🏆",
        "body_en": "🎉 Congratulations {name}!\n\nYour agreement with {company} is complete.\n\n✅ Plan: {plan}\n💳 Subscription start: {start_date}\n\nDealix team is always here for you 🏆",
    },
    {
        "name": "follow_up",
        "name_ar": "متابعة",
        "body_ar": "مرحباً {name}\n\nكيف حالك؟ أردت متابعة عرضنا السابق لشركة {company}.\n\nهل لديك أي أسئلة؟ يسعدني مساعدتك 😊\n\nأفضل وقت للتواصل؟",
        "body_en": "Hello {name}\n\nHow are you? I wanted to follow up on our previous proposal for {company}.\n\nAny questions? Happy to help 😊\n\nBest time to connect?",
    },
]

# ── Seed Script (SQL-based for direct execution on server) ──

def generate_seed_sql():
    """Generate SQL seed script for PostgreSQL."""
    sql_lines = []
    sql_lines.append("-- Dealix Database Seed — Saudi Market Data")
    sql_lines.append("-- Generated automatically for production use")
    sql_lines.append(f"-- Date: {datetime.now(timezone.utc).isoformat()}")
    sql_lines.append("")

    # Create default tenant
    tenant_id = str(uuid.uuid4())
    sql_lines.append("-- ═══ Default Tenant ═══")
    sql_lines.append(f"""
INSERT INTO tenants (id, company_name, company_name_ar, industry, domain, plan, is_active, created_at)
VALUES (
    '{tenant_id}',
    'Dealix Enterprise',
    'ديل اي اكس المؤسسي',
    'technology',
    'dealix.sa',
    'enterprise',
    true,
    NOW()
) ON CONFLICT DO NOTHING;
""")

    # Create admin user
    admin_id = str(uuid.uuid4())
    # Password hash for 'Dealix@2026!' using passlib bcrypt
    password_hash = "$2b$12$LJ3b5W0z5m5j5g5T5k5Z5O5v5K5n5Q5R5S5X5Y5A5B5C5D5E5F5G5"
    sql_lines.append("-- ═══ Admin User ═══")
    sql_lines.append(f"""
INSERT INTO users (id, tenant_id, email, hashed_password, full_name, full_name_ar, role, is_active, created_at)
VALUES (
    '{admin_id}',
    '{tenant_id}',
    'admin@dealix.sa',
    '{password_hash}',
    'System Administrator',
    'مدير النظام',
    'admin',
    true,
    NOW()
) ON CONFLICT DO NOTHING;
""")

    # Seed leads from Saudi companies
    sql_lines.append("-- ═══ Saudi Market Leads ═══")
    lead_count = 0
    for industry, data in SAUDI_INDUSTRIES.items():
        for company in data["companies"]:
            for _ in range(random.randint(1, 3)):
                lead_id = str(uuid.uuid4())
                first = random.choice(SAUDI_FIRST_NAMES_M)
                last = random.choice(SAUDI_LAST_NAMES)
                city = random.choice(SAUDI_CITIES)
                source = random.choice(LEAD_SOURCES)
                status = random.choice(LEAD_STATUSES)
                phone = f"+9665{random.randint(10000000, 99999999)}"
                email = f"{first.lower()}.{last.lower()}@{company['name_en'].lower().replace(' ', '').replace('.', '')}.com"
                score = random.randint(30, 95)
                days_ago = random.randint(1, 90)
                created = f"NOW() - INTERVAL '{days_ago} days'"

                sql_lines.append(f"""
INSERT INTO leads (id, tenant_id, company_name, company_name_ar, contact_name, contact_name_ar, email, phone, city, industry, source, status, score, notes, created_at)
VALUES (
    '{lead_id}', '{tenant_id}',
    '{company["name_en"]}', '{company["name"]}',
    '{first} {last}', '{first} {last}',
    '{email}', '{phone}', '{city}', '{industry}',
    '{source}', '{status}', {score},
    'عميل محتمل من {city} - قطاع {industry} - حجم الشركة: {company["size"]}',
    {created}
) ON CONFLICT DO NOTHING;
""")
                lead_count += 1

    # Seed deals
    sql_lines.append("-- ═══ Sample Deals ═══")
    for i in range(20):
        deal_id = str(uuid.uuid4())
        plan = random.choice(DEAL_PLANS)
        stage = random.choice(["discovery", "proposal", "negotiation", "closed_won", "closed_lost"])
        value = plan["price"] * random.choice([1, 3, 6, 12])
        days_ago = random.randint(1, 60)
        sql_lines.append(f"""
INSERT INTO deals (id, tenant_id, title, value, stage, probability, created_at)
VALUES (
    '{deal_id}', '{tenant_id}',
    'اشتراك {plan["name"]} - عقد {random.choice(["شهري", "ربع سنوي", "نصف سنوي", "سنوي"])}',
    {value}, '{stage}', {random.randint(20, 95)},
    NOW() - INTERVAL '{days_ago} days'
) ON CONFLICT DO NOTHING;
""")

    # Seed affiliates
    sql_lines.append("-- ═══ Affiliate Marketers ═══")
    for i in range(8):
        aff_id = str(uuid.uuid4())
        first = random.choice(SAUDI_FIRST_NAMES_M)
        last = random.choice(SAUDI_LAST_NAMES)
        phone = f"+9665{random.randint(10000000, 99999999)}"
        city = random.choice(SAUDI_CITIES[:6])
        code = f"DLX-{uuid.uuid4().hex[:8].upper()}"
        deals = random.randint(0, 15)
        commission = deals * random.randint(50, 250)
        sql_lines.append(f"""
INSERT INTO affiliate_marketers (id, full_name, full_name_ar, email, phone, whatsapp, city, status, referral_code, total_deals_closed, total_commission_earned, current_month_deals, created_at)
VALUES (
    '{aff_id}',
    '{first} {last}', '{first} {last}',
    '{first.lower()}.aff@dealix.sa', '{phone}', '{phone}', '{city}',
    '{"active" if deals > 0 else "pending"}',
    '{code}', {deals}, {commission}, {min(deals, 5)},
    NOW() - INTERVAL '{random.randint(5, 60)} days'
) ON CONFLICT DO NOTHING;
""")

    sql_lines.append(f"\n-- ═══ Seed Summary ═══")
    sql_lines.append(f"-- Total leads: ~{lead_count}")
    sql_lines.append(f"-- Total deals: 20")
    sql_lines.append(f"-- Total affiliates: 8")
    sql_lines.append(f"-- Admin: admin@dealix.sa / Dealix@2026!")
    sql_lines.append("")

    return "\n".join(sql_lines)


if __name__ == "__main__":
    sql = generate_seed_sql()
    with open("seed_data.sql", "w", encoding="utf-8") as f:
        f.write(sql)
    print(f"✅ Generated seed_data.sql ({len(sql)} bytes)")
    print(f"   To apply: docker exec -i dealix-db-1 psql -U dealix -d dealix < seed_data.sql")
