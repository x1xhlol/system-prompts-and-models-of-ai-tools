# Dealix — بوابة الإنتاج، المراقبة، والتراجع

**مرجع:** `docs/LAUNCH_CHECKLIST.md`، `GET /api/v1/autonomous-foundation/integrations/go-live-gate`، `GET /api/v1/autonomous-foundation/integrations/live-readiness`.

## ما قبل القطع (go-live gate)

1. دمج `main` مع CI أخضر (باكند pytest، فرونت lint/build، Playwright E2E).
2. Postgres: `make migrate` (أو ما يعادله في الاستضافة) — **لا** تعتمد على `init_db()` في SQLite للإنتاج.
3. ضبط `.env` و`frontend/.env.local` (`NEXT_PUBLIC_API_URL`، `FRONTEND_URL`، CORS).
4. توقع **403** من `go-live-gate` حتى تكتمل التكاملات الحرجة — هذا متوقع إذا كانت البيئة غير مهيأة بالكامل؛ راجع `live-readiness` للتفاصيل.

## النشر

- باكند: صورة Docker أو عملية `uvicorn` خلف reverse proxy مع TLS.
- فرونت: بناء Next.js (`npm run build`) أو منصة الاستضافة المختارة؛ نفس متغيرات الـ API العامة.

## المراقبة بعد الإطلاق

- `GET /api/v1/health` — الخدمة حية.
- `GET /api/v1/ready` — جاهزية التبعيات (قاعدة، Redis، إلخ حسب التطبيق).
- سجلات الأخطاء (مثلاً Sentry) ومراقبة معدل 5xx على المسارات الحرجة.

## التراجع (rollback)

1. **التطبيق:** إعادة نشر الإصدار السابق من صورة Docker / commit المعتمد.
2. **قاعدة البيانات:** إن وُجدت ترحيلات Alembic تسبب خللاً، نفّذ `alembic downgrade` إلى المراجعة المعروفة بالاستقرار (بعد أخذ نسخة احتياطية).
3. **الإعدادات:** أعد القيم السابقة للأسرار في مدير الأسرار إن تغيّرت أثناء القطع.

## فرع الكود للنشر

استخدم **`main`** كمصدر للإنتاج بعد الدمج؛ لا تعتمد على فروع مؤقتة قديمة في سكربتات النشر.
