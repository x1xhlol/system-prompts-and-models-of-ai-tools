---
version: "1.0"
owner: "Platform + Release"
status: "canonical"
review_cadence: "مع كل pilot أو تغيير بيئة عميل"
last_updated: "2026-04-16"
related:
  - "GO_LIVE_REVENUE_ACTIVATION_SYSTEM_AR.md"
  - "TIER1_REAL_PRODUCTION_PLAYBOOK_AR.md"
  - "LAUNCH_CHECKLIST (salesflow-saas/docs)"
---

# دليل النشر الحي عند عميل (Pilot / Prod)

دليل **خطوة بخطوة** لتركيب Dealix في بيئة عميل (staging أو إنتاج محدود) مع الإشارة إلى الملفات القائمة في المستودع. لا يغني عن runbooks الداخلة لدى العميل.

---

## 0) نطاق الـ pilot (قبل أي أمر)

| بند | قرار |
|-----|------|
| Tenant / حسابات | من يملك المستخدم الإداري؟ |
| موصلات مفعّلة | بريد، WhatsApp، CRM، توقيع — **قائمة صريحة** |
| بيانات حساسة | نعم/لا → تفعيل حقول PDPL على المسارات الخارجية |
| نافذة الصيانة | تاريخ + تراجع إن لزم |

---

## 1) المتطلبات والتحقق المحلي (Repo)

من **جذر المستودع**:

```bash
python scripts/architecture_brief.py
python scripts/check_docs_links.py
```

من **`salesflow-saas/backend`**:

```bash
py -3 -m pytest tests -q
```

من **`salesflow-saas`** (موصى به):

```powershell
.\verify-launch.ps1
```

المرجع الكامل: [`salesflow-saas/docs/LAUNCH_CHECKLIST.md`](../salesflow-saas/docs/LAUNCH_CHECKLIST.md).

---

## 2) الخادم (API)

* نسخ البيئة: [`salesflow-saas/backend/.env.phase2.example`](../salesflow-saas/backend/.env.phase2.example) → `backend/.env` وملء الحقول حسب [`INTEGRATION_MASTER_AR.md`](../salesflow-saas/docs/INTEGRATION_MASTER_AR.md).
* **PostgreSQL** للإنتاج (ليس SQLite الاعتماد الدائم) — انظر قسم قاعدة البيانات في قائمة الإطلاق.
* التشغيل:

```bash
cd salesflow-saas/backend
py -3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

* فحص جاهزية التكامل التجاري:

```bash
cd salesflow-saas
py -3 scripts/check_go_live_gate.py
```

توقع **403** مع `blocked_reasons` حتى اكتمال المتغيرات — هذا سلوك **بوابة** لا خللًا بالضرورة.

---

## 3) الواجهة (Next.js)

* [`salesflow-saas/frontend/.env.example`](../salesflow-saas/frontend/.env.example): `NEXT_PUBLIC_API_URL` يطابق أصل الـ API الفعلي (HTTPS).
* الباكند: `FRONTEND_URL` و`CORS_EXTRA_ORIGINS` في الإعدادات — انظر [`LAUNCH_CHECKLIST.md`](../salesflow-saas/docs/LAUNCH_CHECKLIST.md) §3.

---

## 4) الأمن والوصول

* رموز داخلية / JWT حسب نموذجكم؛ لا تُخزَّن أسرار في الوثائق.
* حدود معدل الطلبات (إن وُجدت) على مسارات الـ outreach عند التفعيل.

---

## 5) المراقبة والاسترجاع

* صحة: `GET /api/v1/health` و`GET /api/v1/ready`.
* بعد أي تغيير على أسرار الطرف الثالث: إعادة `go-live-gate`.
* سياسة التراجع: راجع [`salesflow-saas/memory/runbooks/production-deployment-guide.md`](../salesflow-saas/memory/runbooks/production-deployment-guide.md)؛ وإلا وثّقوا خطوة rollback (صورة سابقة + تعطيل flags).

---

## 6) تسليم للعميل (Handoff)

| المخرج | الوصف |
|--------|--------|
| قائمة متغيرات مملوءة | بدون قيم سرية في البريد — استخدم قنوات آمنة |
| مستخدم إداري | بيانات الدخول عبر قناة آمنة |
| مسار demo مسجّل | روابط + خطوات من [`golden-path-partner-intake-runbook.md`](golden-path-partner-intake-runbook.md) |
| جهة اتصال دعم | SLA من الاتفاق |

---

## 7) بعد Go-Live

* [`salesflow-saas/docs/DEALIX_POST_LAUNCH_OPS_AR.md`](../salesflow-saas/docs/DEALIX_POST_LAUNCH_OPS_AR.md) إن وُجد.
* إعادة فحص [`RELEASE_READINESS_MATRIX_AR.md`](RELEASE_READINESS_MATRIX_AR.md) لصف RC التالي.

---

*الدليل تقني؛ الالتزامات القانونية والتعاقدية مع العميل خارج نطاق هذا الملف.*
