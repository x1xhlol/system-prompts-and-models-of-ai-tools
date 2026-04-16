# Operational severity model (V0–V3)

**Canonical:** [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md).  
**Related:** [approval-policy.md](approval-policy.md) (A/R/S), [`RELEASE_READINESS_MATRIX_AR.md`](../RELEASE_READINESS_MATRIX_AR.md).

Use this scale for **policy violations**, **ledger contradictions**, **connector health**, **workflow failures**, and **release gate** items so dashboards and runbooks speak one language.

| Level | Name (EN) | تعريف مختصر (AR) | أمثلة | تأثير على الإصدار |
|-------|-----------|------------------|--------|---------------------|
| **V0** | Informational | ملاحظة تشغيلية بلا تأثير مباشر على العميل | تحذيرات deprecated، drift توثيقي | لا يعطل RC |
| **V1** | Operational | يتطلب إجراءًا داخليًا في SLA قصير | فشل مهمة خلفية مع إعادة محاولة، انحراف مقياس داخلي | لا يعطل RC إن وُجدت آلية تعويض |
| **V2** | Customer-impacting | يؤثر على تجربة عميل أو بيانات حساسة | فشل موصل حرج، تأخير موافقة Class B، تعارض أدلة جزئي | **يمنع** ترقية canary→prod حتى التخفيف أو الاستثناء المسجل |
| **V3** | Regulatory / release-blocking | يعطل الإصدار أو يرفع مخاطر امتثال | تسريب محتمل، تعارض أدلة على مسار R2/R3، غياب بوابة أمان | **Stop ship**؛ راجع [`trust-fabric.md`](trust-fabric.md) و[`github-and-release.md`](github-and-release.md) |

## Wiring (target)

- اربط كل حدث حوكمة بـ `severity` (V0–V3) في السجلات واللوحات.  
- صفوف [`RELEASE_READINESS_MATRIX_AR.md`](../RELEASE_READINESS_MATRIX_AR.md) تلخص أعلى خطورة مفتوحة لكل مرشح إصدار.
