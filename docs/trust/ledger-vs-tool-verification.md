# سجل التحقق (`VerificationLedger`) مقابل `tool_verification`

**الغرض:** توضيح متى تُستخدم كل طبقة لتفادي ازدواجية «تناقض» بدون تكامل.

## `VerificationLedger` ([`verification_ledger.py`](../../salesflow-saas/backend/app/services/core_os/verification_ledger.py))

- **نموذج:** إثبات لكل استدعاء أداة: intended / claimed / actual + `contradiction_flag` + `verification_status`.
- **تخزين:** ملفات JSON تحت مسار قابل للتكوين (مناسب لـ pilot أحادي العقدة).
- **استخدمه عندما:** تريد **سجل تدقيق** بسيط لمسار وكيل أو أداة قبل/بعد التنفيذ.

## `tool_verification` / `tool_receipts` ([`tool_verification.py`](../../salesflow-saas/backend/app/services/tool_verification.py))

- **نموذج:** تجميع مكالمات أدوات مع `contradiction_flags` على مستوى الدورة.
- **استخدمه عندما:** تقيس **جودة تشغيل الوكيل** أو معدل تناقض عبر مهام متعددة.

## مسار الدمج المستهدف (Tier-1)

1. كتابة إثبات في `VerificationLedger` عند بدء أداة حساسة.  
2. تحديث الإثبات بعد التنفيذ مع `side_effects` و`evidence_paths`.  
3. تغذية ملخص المخالفات في واجهة «Policy violations» من حالة `contradicted` + أعلام `tool_verification`.  
4. نقل التخزين إلى DB/API عند تعدد العقد (انظر [`tool-verification-ledger-v1-completion.md`](tool-verification-ledger-v1-completion.md)).

## مركز الموافقات

حقول [`ApprovalPacket`](../../salesflow-saas/backend/app/services/core_os/decision_plane_contracts.py) تُرفق باستجابات `/api/v1/approval-center/class-b-decision-bundle` كجزء من حزمة القرار الموحّدة.
