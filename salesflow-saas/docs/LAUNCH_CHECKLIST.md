# Dealix — قائمة جاهزية الإطلاق (إنتاج / staging)

## 1. الكود والاختبارات

- [ ] **اختبارات الباكند:** من `backend/` شغّل `python -m pytest tests -q` (مثل CI على Linux) أو على ويندوز إذا الأمر `python` غير موجود: `py -3 -m pytest tests -q`.
- [ ] **بوابة موحّدة (موصى به):** من جذر `salesflow-saas`: `.\verify-launch.ps1` — يشغّل pytest + مزامنة التسويق + lint + build.
- [ ] `cd frontend && npm run lint && npm run build` (أو تُغطّى بواسطة `verify-launch.ps1`).
- [ ] من جذر `salesflow-saas`: `node scripts/sync-marketing-to-public.cjs` (يُشغَّل أيضاً تلقائياً قبل `npm run build`).
- [ ] **E2E (Playwright):** بعد `npm run build`، حرّر المنفذ **3000** ثم من `frontend/`: `CI=true npm run test:e2e`. إن ظهر «port already in use» أو timeout على `webServer`: من جذر `salesflow-saas` شغّل `.\scripts\kill-port-3000.ps1` ثم أعد المحاولة.
- [ ] (اختياري) من جذر `salesflow-saas`: `py -3 scripts/verify_frontend_openapi_paths.py` (أو `python3 scripts/...`) — يطابق مسارات `/api/v1` في الفرونت مع OpenAPI (حرفيًا وفي قوالب مثل `` `${base}/api/v1/...` ``).

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

## 3. الواجهة (Next.js)

- [ ] ضبط `NEXT_PUBLIC_API_URL` لنقطة نهاية الـ API العامة (انظر `frontend/.env.example`).
- [ ] التأكد من أن الـ backend يضمّن نطاق الواجهة في CORS (`FRONTEND_URL` / `main.py`).

## 4. الأسرار والبيئة

- [ ] نسخ `.env` من `.env.example` (جذر المشروع أو `backend/.env`) وملء المفاتيح الحرجة.
- [ ] **ملف الربط الشامل:** راجع `docs/INTEGRATION_MASTER_AR.md` ثم انسخ `backend/.env.phase2.example` إلى `backend/.env` وعبّئ **كل** الفحوص الإلزامية (أمان، قاعدة، ذكاء، بريد، Salesforce، واتساب حي، Stripe + webhook، Twilio، توقيع).

## 5. ما بعد الإطلاق

- [ ] مراقبة `/api/v1/health` و `/api/v1/ready`.
- [ ] مراجعة `go-live-gate` عند التكاملات الحقيقية (قد يعيد 403 حتى اكتمال التهيئة — متوقع).

---

*سكربت موحّد (PowerShell): `verify-launch.ps1 -HttpCheck -SoftReady` — مع `-BaseUrl` إن لزم.*
