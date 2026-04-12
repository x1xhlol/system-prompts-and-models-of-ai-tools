# Dealix — قائمة تهيئة بيئة Staging

استخدم هذا الملف مع [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) و [INTEGRATION_MASTER_AR.md](INTEGRATION_MASTER_AR.md).

## 1) ملفات البيئة

| الملف | الإجراء |
|--------|---------|
| جذر `salesflow-saas` | انسخ [`.env.staging.example`](../.env.staging.example) إلى `.env` واستبدل القيم |
| `frontend/` | انسخ [`frontend/.env.staging.example`](../frontend/.env.staging.example) إلى `frontend/.env.local` |
| تكاملات موسعة | راجع `backend/.env.phase2.example` واملأ الأقسام التي ستفعّلها فقط |

## 2) CORS

- `FRONTEND_URL` في `.env` يجب أن يطابق أصل الواجهة (مثلاً `https://app-staging.example.com`).
- إن تغيّر النطاق، حدّث إعدادات CORS في الباكند إن لزم.

## 3) بعد التشغيل

- `GET /api/v1/health` و `GET /api/v1/ready`
- سكربت اختياري: `python scripts/full_stack_launch_test.py --http-only --soft-ready` مع `DEALIX_BASE_URL`
- جولة يدوية سريعة للواجهة (RTL): `/`، `/landing`، `/marketers`، `/strategy`، `/login`، `/register`، `/dashboard`، `/settings`، `/privacy`، `/terms`

## 4) قنوات حقيقية

لا تفعّل واتساب/بريد إنتاجي حتى اكتمال فحوص PDPL والموافقات. للـ staging اختبر عنواناً داخلياً أو رقم sandbox.
