# تقييم جودة مخرجات الذكاء — Dealix

**الغرض:** إطار عمل خفيف للمراجعة البشرية واختبارات الانحدار دون كشف أسرار أو PII في السجلات.

---

## 1) سجل التدقيق (`ai_audit`)

- تُسجَّل العمليات الحساسة عبر `dealix.intelligence_plane` بصيغة JSON: `op`, `tenant_id`, `user_id` (عند توفر JWT), `model_id`, وبيانات إضافية غير حساسة.
- **لا** تُسجَّل نصوص المسودات الكاملة أو مفاتيح API.

---

## 2) مجموعة ذهبية (Golden / Rubric)

- الملف المرجعي: `backend/app/data/ai_eval_golden.json`
- نقطة القراءة: `GET /api/v1/dealix/ai-eval/golden`
- يحدد مفاتيحاً مطلوبة في استجابات مثل `channel-drafts` و`enrich-exploration` لاستخدامها في اختبارات CI أو مراجعات يدوية.
- بوابة فحص سريعة: `py -3 scripts/ai_quality_gate.py` (تفشل عند غياب الملف/صيغة غير صالحة/فشل endpoint).

---

## 3) مراجعة بشرية مقترحة

- **التكرار:** أسبوعيًا لعينة عشوائية من مخرجات الإثراء ومسودات القنوات.
- **التركيز:** تطابق `provenance` مع الادعاء؛ عدم وجود وعود أسعار علنية؛ التزام مسار LinkedIn (موافقة بشرية).
- **المالكون:** RevOps + الامتثال — يُفضَّل ربط السجلات بأداة SIEM لاحقًا.

**لوحة جودة تشغيلية (أسبوعية):**

- `draft_accept_rate`
- `crm_sync_success_rate`
- `time_to_qualified_meeting`
- `opportunity_utility_score` (تقييم داخلي من الفريق)

> هذه المؤشرات هي بوابة القرار قبل التوسع القطاعي أو تفعيل أتمتة أعمق.

---

## 4) مهام الإثراء غير المتزامنة

- `POST /api/v1/dealix/enrich-exploration/async` ثم `GET .../jobs/{job_id}` لتفادي انقطاع HTTP الطويل.
- يُعطّل عبر `DEALIX_ASYNC_ENRICH_JOBS=false` عند الحاجة.

---

*مرافق لـ `docs/LAUNCH_CHECKLIST.md` و`verify-launch.ps1`.*
