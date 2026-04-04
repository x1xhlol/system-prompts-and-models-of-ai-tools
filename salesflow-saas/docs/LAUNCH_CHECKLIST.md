# Dealix — قائمة جاهزية الإطلاق (إنتاج / staging)

## 1. الكود والاختبارات

- [ ] `cd backend && py -m pytest tests -q` — يجب أن تمر كل الاختبارات.
- [ ] `cd frontend && npm run lint && npm run build`.
- [ ] من جذر `salesflow-saas`: `node scripts/sync-marketing-to-public.cjs` (يُشغَّل أيضاً تلقائياً قبل `npm run build`).

## 2. الخادم (API)

- [ ] تشغيل من **أحدث** كود في المستودع:  
  `cd backend && py -m uvicorn app.main:app --host 0.0.0.0 --port 8000`
- [ ] إذا ظهر **404** على `/api/v1/marketing/hub` أو `/api/v1/strategy/summary` فالعملية غالباً **قديمة** — أعد تشغيل `uvicorn` بعد `git pull`.
- [ ] اختبار HTTP:  
  `py scripts/full_stack_launch_test.py --http-only --soft-ready`  
  أو:  
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
