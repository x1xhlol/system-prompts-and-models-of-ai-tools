# مصفوفة تنافسية — Dealix مقابل منصات الإيرادات والـ CRM

هذا المستند يقارن **قدرات المنتج كما تظهر في المستودع** (واجهة، API، تكاملات، حوكمة) مع فئات أدوات السوق الشائعة. لا تُذكر أرقام سوق أو معدلات اعتماد غير مثبتة.

## الصفوف: محاور Dealix

| المحور | Dealix (ما يُثبت في الكود) |
|--------|---------------------------|
| حوكمة وإرسال | مسارات سياسات، موافقات، سجلات؛ تكامل مع `go-live-gate` ووثائق التشغيل |
| واتساب والقنوات المحلية | مسارات بريد/واتساب في التكاملات؛ تجربة عربية RTL في الواجهة |
| شراكات B2B | `strategic-deals`، Partnership Studio، هوية وصفقات استراتيجية |
| نظام تشغيل ثلاثي | أعمدة المبيعات / الشراكات / النمو في الداشبورد و`strategy_summary` |
| تكاملات CRM | Salesforce (OAuth + refresh + push/pull)، HubSpot (token + push/pull)، حالة في `integrations/crm` و`operations` |
| ذكاء متعدد المزودين | `GET/PUT /api/v1/ai/routing` — نماذج حسب نوع المهمة دون كشف مفاتيح |

## الأعمدة: فئات منافسين (مرجعية)

| الفئة | مثال مرجعي | ملاحظة مقارنة |
|-------|------------|----------------|
| Salesforce Sales Cloud | منصة CRM عالمية واسعة | Dealix لا يستبدل كل وحدات Salesforce؛ يُغطى **التنسيق والمزامنة** مع Leads/Contacts حسب التكامل الحالي |
| HubSpot CRM | تسويق وCRM مدمج | نفس نمط **الوجهة/المصدر** عبر API HubSpot في الخدمة الموحدة |
| منصات Revenue / GTM orchestration | أدلة مشتري عامة (Fullcast، Revenue.io، إلخ) | Dealix يركّز على **سوق سعودي أولاً**، حوكمة، ومسارات شراكات B2B ضمن منتج واحد |

## فروقات قابلة للإثبات (بدون أرقام ادعائية)

1. **شفافية تقنية:** مسارات API موثقة في `docs/API-MAP.md` ومطابقة OpenAPI عبر `scripts/verify_frontend_openapi_paths.py`.
2. **تكامل CRM قابل للتشغيل:** نقاط `test` و`push` و`pull` تحت `/api/v1/integrations/crm/`.
3. **سياسة نماذج:** توجيه المهام (`discovery`, `negotiation`, …) عبر `/api/v1/ai/routing` مع بقاء الأسرار في الخادم.
4. **قصة منتج موحدة:** `docs/DEALIX_OS_PRODUCT_GUIDE_AR.md` و`/strategy/summary` يربطان الواجهة بالوثائق.

## روابط

- [دليل التكاملات](INTEGRATION_MASTER_AR.md)
- [خريطة API](API-MAP.md)
- [قائمة الإطلاق](LAUNCH_CHECKLIST.md)
