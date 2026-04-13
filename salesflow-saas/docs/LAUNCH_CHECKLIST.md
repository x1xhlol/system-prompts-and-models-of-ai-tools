# Dealix — قائمة جاهزية الإطلاق (إنتاج / staging)

## 1. الكود والاختبارات

- [ ] **اختبارات الباكند:** من `backend/` شغّل `python -m pytest tests -q` (مثل CI على Linux) أو على ويندوز إذا الأمر `python` غير موجود: `py -3 -m pytest tests -q`.
- [ ] **بوابة موحّدة (موصى به):** من جذر `salesflow-saas`: `.\verify-launch.ps1` — يشغّل pytest + مزامنة التسويق + lint + build.
- [ ] `cd frontend && npm run lint && npm run build` (أو تُغطّى بواسطة `verify-launch.ps1`).
- [ ] من جذر `salesflow-saas`: `node scripts/sync-marketing-to-public.cjs` (يُشغَّل أيضاً تلقائياً قبل `npm run build`).
- [ ] **E2E (Playwright):** بعد `npm run build`، حرّر المنفذ **3000** ثم من `frontend/`: `CI=true npm run test:e2e`. إن ظهر «port already in use» أو timeout على `webServer`: من جذر `salesflow-saas` شغّل `.\scripts\kill-port-3000.ps1` ثم أعد المحاولة.
- [ ] (موصى به) من جذر `salesflow-saas`: `py -3 scripts/verify_frontend_openapi_paths.py` (أو `python3 scripts/...`) — يطابق مسارات `/api/v1` في الفرونت مع OpenAPI (حرفيًا وفي قوالب مثل `` `${base}/api/v1/...` ``). يشمل استدعاءات `strategic-deals` و`integrations/crm` و`ai/routing` عند إضافتها في الواجهة.
- [ ] مراجعة [`docs/API-MAP.md`](API-MAP.md) مقابل OpenAPI الفعلي (`/docs` على الخادم) بعد أي إصدار يضيف مسارات جديدة.
- [ ] قراءة سريعة لـ [`docs/DEALIX_OS_PRODUCT_GUIDE_AR.md`](DEALIX_OS_PRODUCT_GUIDE_AR.md) للتأكد من توافق قصة المنتج مع الداشبورد.
- [ ] (موصى به) تشغيل سيناريو محاكاة الإطلاق في [`docs/LAUNCH_SIMULATION.md`](LAUNCH_SIMULATION.md) وتسجيل نتيجة `go-live-gate` لكل بيئة.

## 2. الخادم (API)

- [ ] تشغيل من **أحدث** كود في المستودع:  
  `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000`  
  (ويندوز: `py -3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000`)
- [ ] إذا ظهر **404** على `/api/v1/marketing/hub` أو `/api/v1/strategy/summary` فالعملية غالباً **قديمة** — أعد تشغيل `uvicorn` بعد `git pull`.
- [ ] اختبار HTTP (من مجلد `backend/`):  
  `py -3 scripts/full_stack_launch_test.py --http-only --soft-ready`  
  أو من جذر `salesflow-saas`:  
  `.\scripts\grand_launch_verify.ps1 -HttpCheck -SoftReady`  
  مع `DEALIX_BASE_URL` إذا لم يكن الـ API على `http://127.0.0.1:8000`.

### 2.1 بوابة الجاهزية التجارية (`go-live-gate`)

- [ ] مع تشغيل الـ API وبعد ضبط `.env` الحقيقي (staging أو إنتاج): استدعِ  
  `GET /api/v1/autonomous-foundation/integrations/go-live-gate`
- [ ] **200** + `launch_allowed: true` يعني اجتياز الفحوص الحاسمة حسب [`go_live_matrix.py`](../backend/app/services/go_live_matrix.py). **403** مع نفس شكل JSON يعني وجود فحوص معطّلة — راجع `blocked_reasons` و`blocking`.
- [ ] من الطرفية (خادم على 8000):  
  `curl -sS http://127.0.0.1:8000/api/v1/autonomous-foundation/integrations/go-live-gate`
- [ ] ملخص سريع بدون uvicorn (يحمّل التطبيق داخل العملية، مثل الاختبارات): من جذر `salesflow-saas`:  
  `py -3 scripts/check_go_live_gate.py`  
  (للطباعة الكاملة: `py -3 scripts/check_go_live_gate.py --json`)

## 3. الواجهة (Next.js)

- [ ] ضبط **`NEXT_PUBLIC_API_URL`** لعنوان الـ API الذي يصل إليه المتصفح فعليًا (HTTPS في الإنتاج). مرجع: [`frontend/.env.example`](../frontend/.env.example).
- [ ] **CORS:** في الباكند عرّف **`FRONTEND_URL`** (أصل الواجهة الافتراضي، مثل `https://app.dealix.sa`) في `backend/.env` — يُستخدم في [`main.py`](../backend/app/main.py) مع أصول ثابتة إضافية. لأصول إضافية (معاينة، دومين قديم): **`CORS_EXTRA_ORIGINS`** قائمة مفصولة بفواصل — انظر [`app/config.py`](../backend/app/config.py).
- [ ] تحقق من أن قيمة `NEXT_PUBLIC_API_URL` على الواجهة **تطابق** المخطط والشهادة (لا خلط `http`/`https` أو دومين خاطئ) حتى لا تفشل طلبات `fetch` / `apiFetch`.

## 4. الأسرار والبيئة

- [ ] نسخ `.env` من `.env.example` (جذر المشروع أو `backend/.env`) وملء المفاتيح الحرجة.
- [ ] **ملف الربط الشامل:** راجع `docs/INTEGRATION_MASTER_AR.md` ثم انسخ `backend/.env.phase2.example` إلى `backend/.env` وعبّئ **كل** الفحوص الإلزامية (أمان، قاعدة، ذكاء، بريد، Salesforce، واتساب حي، Stripe + webhook، Twilio، توقيع).

## 5. ما بعد الإطلاق

- [ ] مراقبة `/api/v1/health` و `/api/v1/ready`.
- [ ] إعادة فحص **`go-live-gate`** بعد أي تغيير على أسرار الطرف الثالث (Stripe، البريد، CRM، إلخ).

## 6. أمان `DEALIX_INTERNAL_API_TOKEN` (إنتاج)

عند تعيين **`DEALIX_INTERNAL_API_TOKEN`** في الباكند، يُطلب `Authorization: Bearer <التوكن>` على معظم مسارات `/api/v1`، مع **قائمة إعفاءات** واسعة للمسارات العامة والتسويق والديمو — التنفيذ في [`app/middleware/internal_api.py`](../backend/app/middleware/internal_api.py).

- [ ] **Staging / ديمو:** الإعفاءات الحالية تسمح للواجهة بجلب محتوى عام ولوحات ديمو دون التوكن الداخلي؛ هذا متعمد لتجربة المطوّر.
- [ ] **إنتاج صارم:** راجع ما إذا كانت مسارات الإعفاء (مثل أجزاء من التسويق أو `dealix/generate-leads`) مقبولة لسياسة المنتج؛ يمكن لاحقًا تقييد الإعفاءات حسب `ENVIRONMENT` أو إلزام **`apiFetch` + JWT** لمسارات حساسة بدل الإعفاء.
- [ ] إن لم تُضبط المتغير (فارغ)، الميدلوير لا يفرض التوكن — مناسب للتطوير المحلي فقط.

---

*سكربت موحّد (PowerShell): `verify-launch.ps1 -HttpCheck -SoftReady` — مع `-BaseUrl` إن لزم.*
