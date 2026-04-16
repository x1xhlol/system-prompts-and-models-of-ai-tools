# Dealix Deployment Guide — من الكود للإنتاج
# دليل النشر الكامل

**آخر تحديث**: 2026-04-12

---

## المتطلبات قبل البدء

### حسابات مطلوبة (سجّل فيها أولاً)

| الخدمة | الرابط | التكلفة | لماذا |
|--------|--------|---------|-------|
| **DigitalOcean/Hetzner** | digitalocean.com | ~200 ر.س/شهر | سيرفر |
| **Groq** | groq.com | مجاني | AI (primary) |
| **OpenAI** | platform.openai.com | ~$20/شهر | AI (fallback) |
| **Meta Business** | business.facebook.com | مجاني | واتساب |
| **Stripe** | stripe.com | 2.9% + 1 ر.س/معاملة | مدفوعات |
| **Sentry** | sentry.io | مجاني (10K events) | مراقبة أخطاء |
| **Cloudflare** | cloudflare.com | مجاني | DNS + SSL + CDN |
| **دومين .sa** | nic.sa | ~100 ر.س/سنة | dealix.sa |

---

## الخطوة 1: إعداد السيرفر (30 دقيقة)

```bash
# 1. سجّل VPS (Ubuntu 22.04, 4GB RAM, 2 CPU)
# DigitalOcean: $24/mo أو Hetzner: €8/mo

# 2. اتصل بالسيرفر
ssh root@YOUR_SERVER_IP

# 3. ثبّت Docker
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin -y

# 4. ثبّت Git
apt install git -y

# 5. انسخ المشروع
git clone https://github.com/VoXc2/system-prompts-and-models-of-ai-tools.git
cd system-prompts-and-models-of-ai-tools
git checkout main
cd salesflow-saas
```

---

## الخطوة 2: إعداد Environment (.env) (15 دقيقة)

```bash
cp .env.example .env
nano .env
```

**عدّل هذه القيم:**

```env
# === Database ===
DATABASE_URL=postgresql+asyncpg://dealix:YOUR_STRONG_PASSWORD@db:5432/dealix
REDIS_URL=redis://redis:6379/0

# === Security ===
JWT_SECRET_KEY=GENERATE_64_CHAR_RANDOM_STRING_HERE
JWT_ALGORITHM=HS256

# === AI Providers ===
GROQ_API_KEY=gsk_YOUR_GROQ_KEY
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY

# === WhatsApp (Meta Business API) ===
WHATSAPP_TOKEN=YOUR_META_ACCESS_TOKEN
WHATSAPP_PHONE_ID=YOUR_PHONE_NUMBER_ID
WHATSAPP_VERIFY_TOKEN=dealix-whatsapp-verify-2026

# === Stripe (Payment) ===
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET

# === Email ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@dealix.sa
SMTP_PASSWORD=YOUR_APP_PASSWORD

# === Monitoring ===
SENTRY_DSN=https://YOUR_KEY@sentry.io/YOUR_PROJECT

# === App ===
APP_NAME=Dealix
APP_URL=https://dealix.sa
API_URL=https://api.dealix.sa
DEBUG=false
```

**كيف تولّد JWT_SECRET_KEY:**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## الخطوة 3: DNS (10 دقائق)

في Cloudflare:
```
dealix.sa       → A → YOUR_SERVER_IP (Proxied)
api.dealix.sa   → A → YOUR_SERVER_IP (Proxied)
app.dealix.sa   → A → YOUR_SERVER_IP (Proxied)
```

---

## الخطوة 4: إطلاق (5 دقائق)

```bash
# 1. بناء وتشغيل كل الخدمات
docker compose build --no-cache
docker compose up -d

# 2. تشغيل Migrations
docker compose exec backend alembic upgrade head

# 3. تحميل البيانات الأولية
docker compose exec backend python -m app.seeds.run

# 4. التحقق
curl -f https://api.dealix.sa/api/v1/health
curl -f https://dealix.sa
```

---

## الخطوة 5: ربط WhatsApp (20 دقيقة)

### في Meta Business:
1. اذهب لـ developers.facebook.com
2. أنشئ App جديد → Business type
3. أضف WhatsApp product
4. أنشئ Business phone number
5. احصل على Access Token
6. اضبط Webhook URL:
   ```
   URL: https://api.dealix.sa/api/v1/webhooks/whatsapp/incoming
   Verify Token: dealix-whatsapp-verify-2026
   ```
7. اشترك في messages events

### في .env:
```env
WHATSAPP_TOKEN=YOUR_PERMANENT_TOKEN
WHATSAPP_PHONE_ID=YOUR_PHONE_ID
```

### اختبر:
```bash
# أرسل رسالة للرقم من جوالك
# يجب أن يرد تلقائياً: "أهلاً وسهلاً! أنا مساعد ديلكس الذكي..."
```

---

## الخطوة 6: ربط Stripe (15 دقيقة)

### في Stripe Dashboard:
1. أنشئ Product: "Dealix All-in-One"
2. أضف Price: 1,499 SAR/month (recurring)
3. أضف Price: 14,999 SAR/year (recurring)
4. اضبط Webhook:
   ```
   URL: https://api.dealix.sa/api/v1/webhooks/payment
   Events: checkout.session.completed, customer.subscription.updated, invoice.paid
   ```
5. ضبط Tax: Saudi Arabia VAT 15%

---

## الخطوة 7: مراقبة (5 دقائق)

### Sentry:
1. أنشئ Project (Python/FastAPI)
2. انسخ DSN لـ .env
3. ارجع وشغّل: `docker compose restart backend`

### التحقق اليومي:
```bash
# Health check
curl https://api.dealix.sa/api/v1/health

# Logs
docker compose logs -f backend --since 1h

# Celery
docker compose logs -f celery-worker --since 1h
```

---

## الخطوة 8: أول عميل (الاختبار النهائي)

1. افتح https://dealix.sa
2. اضغط "جرّب ٧ أيام مجاناً"
3. سجّل بإيميلك
4. أكمل الـ Onboarding (اختر دور + صناعة)
5. أنشئ أول عميل محتمل
6. أنشئ أول صفقة
7. جرّب الواتساب (أرسل لرقم Dealix)
8. جرّب Pipeline (اسحب صفقة بين المراحل)
9. جرّب الإعدادات (غيّر الاسم، ادعُ عضو)
10. جرّب تبديل اللغة (عربي ↔ English)

**إذا كل شي شغال = جاهز للتدشين الفعلي.**

---

## الصيانة الدورية

### يومياً (تلقائي):
- Celery Beat يشغل: follow-ups, sequences, reports, lead scoring

### أسبوعياً:
- راجع Sentry errors
- راجع WhatsApp delivery rates
- راجع تكلفة AI (Groq/OpenAI)

### شهرياً:
- حدّث dependencies: `pip install --upgrade -r requirements.txt`
- اختبر backup restore
- راجع PDPL compliance

---

## تكلفة التشغيل الشهرية

| البند | التكلفة |
|-------|---------|
| سيرفر (4GB RAM) | ~200 ر.س |
| دومين .sa | ~8 ر.س (سنوي/12) |
| Groq API | مجاني |
| OpenAI API | ~75 ر.س |
| WhatsApp Business | مجاني (أول 1000 محادثة/شهر) |
| Sentry | مجاني |
| Cloudflare | مجاني |
| **الإجمالي** | **~283 ر.س/شهر** |

**مع أول عميل واحد (1,499 ر.س) = تغطي تكاليف التشغيل + ربح.**
