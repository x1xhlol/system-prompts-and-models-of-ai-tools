# Dealix — ملف الربط الشامل للتكاملات والإطلاق التجاري

**الغرض:** جدول مرجعي لكل متغيرات البيئة، الويبهوكات، وترتيب التفعيل للبيع والتشغيل الفعلي.  
**مرافق للـ API:** `GET /api/v1/autonomous-foundation/integrations/go-live-gate` و`GET .../live-readiness`.

---

## 1. آلية بوابة الإطلاق (Go-Live Gate)

- **الوضع:** `launch_mode: full_commercial` — فحوص **إلزامية** يجب أن تمر كلها حتى `launch_allowed: true`.
- **الجاهزية:** `readiness_percent` = نسبة النجاح للفحوص الإلزامية فقط.
- **إضافية:** `readiness_percent_total` تشمل فحوصاً اختيارية (HubSpot، Unifonic، إلخ).
- **التصنيف:** حقل `categories` في JSON يقسم البنود حسب: الأمان، البيانات، الذكاء، القنوات، CRM، المدفوعات، الصوت، العقود، التشغيل، تكاملات إضافية.

---

## 2. جدول المتغيرات الإلزامية (للبيع والتشغيل الكامل)

| المتغير | الفئة | ملاحظات |
|---------|--------|---------|
| `SECRET_KEY` | أمان | ليس القيمة الافتراضية `change-this...` |
| `DATABASE_URL` | بيانات | PostgreSQL + `asyncpg` |
| `GROQ_API_KEY` أو `OPENAI_API_KEY` | ذكاء | واحد على الأقل |
| `SENDGRID_API_KEY` أو `SMTP_USER` + `SMTP_PASSWORD` | بريد | للإشعارات والعروض |
| `SALESFORCE_CLIENT_ID` | CRM | Connected App |
| `SALESFORCE_CLIENT_SECRET` | CRM | |
| `SALESFORCE_REFRESH_TOKEN` | CRM | OAuth |
| `SALESFORCE_DOMAIN` | CRM | مثل `login.salesforce.com` |
| `WHATSAPP_API_TOKEN` | قنوات | Meta Graph |
| `WHATSAPP_PHONE_NUMBER_ID` | قنوات | |
| `WHATSAPP_VERIFY_TOKEN` | قنوات | **ويبهوك** التحقق من Meta |
| `WHATSAPP_MOCK_MODE=false` | قنوات | إيقاف المحاكاة للإرسال الحقيقي |
| `STRIPE_SECRET_KEY` | مدفوعات | |
| `STRIPE_WEBHOOK_SECRET` | مدفوعات | للتحقق من توقيع Stripe |
| `TWILIO_ACCOUNT_SID` | صوت | |
| `TWILIO_AUTH_TOKEN` | صوت | |
| `TWILIO_FROM_NUMBER` | صوت | E.164 |
| `DOCUSIGN_ACCESS_TOKEN` أو `ADOBE_SIGN_ACCESS_TOKEN` | عقود | أحد المزودين على الأقل |

**اختياري (لا يمنع الإطلاق):** `HUBSPOT_API_KEY`, `UNIFONIC_APP_SID`, `RAPIDAPI_KEY`, `ENVIRONMENT=production` (يُنصح)، `API_URL` / `FRONTEND_URL` للإنتاج.

**استكشاف الإيرادات / بحث مرخّص (اختياري):**

| المتغير | الفئة | ملاحظات |
|---------|--------|---------|
| `TAVILY_API_KEY` | ذكاء | بحث ويب عبر [Tavily](https://tavily.com) لمسار `POST /api/v1/dealix/enrich-exploration` عند التفعيل |
| `DEALIX_ALLOW_LICENSED_SEARCH` | ذكاء | `false` يعطّل Tavily حتى لو المفتاح موجود |
| `DEALIX_TAVILY_TENANT_ALLOWLIST` | ذكاء | قائمة `tenant_id` مفصولة بفواصل؛ إن وُجدت، فقط هذه المستأجرين يستخدمون Tavily (ضبط التكلفة) |
| `DEALIX_INTEL_RATE_LIMIT` | تشغيل | حد أقصى لطلبات الذكاء لكل نافذة زمنية (افتراضي ٦٠/ساعة لكل IP) |
| `DEALIX_INTEL_RATE_WINDOW_SEC` | تشغيل | عرض النافذة بالثواني |
| `DEALIX_INTEL_CACHE_TTL_SEC` | تشغيل | TTL للتخزين المؤقت لنتائج التوليد/الإثراء |
| `DEALIX_DEEP_ENRICH_DEFAULT` | ذكاء | توسيع ثقيل اختياري لاحقاً |
| `DEALIX_DEEP_ENRICH_TENANTS` | ذكاء | قائمة مستأجرين مسموح لهم بمسارات إثراء عميق عند التفعيل |
| `NEXT_PUBLIC_SALES_CONTACT_URL` | واجهة | رابط موحّد لـ CTA «تحدث مع المبيعات» في الواجهة العامة |
| `DEALIX_KNOWLEDGE_RAG_ENRICH` | ذكاء | `false` يعطّل حقن مقتطفات `SectorAsset` في مسار الإثراء |
| `DEALIX_ENRICH_IDEMPOTENT_DAILY` | تشغيل | تخزين مؤقت يومي لكل (شركة+قطاع+مدينة) لتقليل تكرار استدعاءات الإثراء |
| `DEALIX_ASYNC_ENRICH_JOBS` | تشغيل | `false` يعطّل `POST /dealix/enrich-exploration/async` |
| `SERPER_API_KEY` / `BRAVE_API_KEY` | ذكاء | بدائل محتملة لـ Tavily — تتطلب تكوين كود مخصص قبل الاستخدام |

---

## 3. ويبهوكات (Webhooks)

| المصدر | الغرض | نقطة الربط في Dealix |
|--------|--------|----------------------|
| **Stripe** | `invoice.paid`, `customer.subscription.updated`, إلخ | مسارك العام + `/api/v1/.../webhooks` حسب التطبيق — ربط `STRIPE_WEBHOOK_SECRET` |
| **Meta / WhatsApp** | رسائل واتساب الواردة | URL عام HTTPS؛ نفس الخادم يستقبل التحقق باستخدام `WHATSAPP_VERIFY_TOKEN` |
| **أنظمة أخرى** | `POST /api/v1/autonomous-foundation/integrations/webhook-hub/{provider}` | هيكل عام للاستقبال |

> في الإنتاج: **HTTPS** إلزامي، ولا تعرّض مفاتيح الويبهوك في الواجهة الأمامية.

---

## 4. ترتيب التنفيذ الموصى به

1. نسخ `backend/.env.phase2.example` → `backend/.env`.
2. تعبئة الأمان والقاعدة والذكاء والبريد.
3. ربط Salesforce (Connected App + OAuth).
4. تفعيل واتساب (رمز + تعطيل `WHATSAPP_MOCK_MODE` + `VERIFY_TOKEN` للويبهوك).
5. Stripe + سر الويبهوك.
6. Twilio للصوت.
7. DocuSign أو Adobe Sign.
8. استدعاء:  
   `GET /api/v1/autonomous-foundation/integrations/go-live-gate`  
   حتى `launch_allowed: true`.
9. اختبار تشغيل:  
   `POST /api/v1/autonomous-foundation/integrations/connectivity-test` (بحذر في الإنتاج).

---

## 5. الواجهة الأمامية (Next.js)

- انسخ `frontend/.env.example` إلى `.env.local`.
- `NEXT_PUBLIC_API_URL` = نفس أساس الـ API الذي يصل إليه المتصفح (CORS مضبوط في `main.py` عبر `FRONTEND_URL`).

---

## 6. المراجع في المستودع

| الملف |
|--------|
| `backend/.env.phase2.example` |
| `docs/LAUNCH_CHECKLIST.md` |
| `frontend/.env.example` |
| `openclaw/openclaw-config.yaml` |

---

*آخر تحديث: يتبع مصفوفة `app/services/go_live_matrix.py`.*
