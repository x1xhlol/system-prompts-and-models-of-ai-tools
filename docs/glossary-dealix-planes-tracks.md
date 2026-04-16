# قاموس مصطلحات Dealix — Planes / Tracks / Fabrics

**الغرض:** توحيد الأسماء عبر الوثائق والكود. المصدر التفصيلي للطائرات: [`governance/planes-and-runtime.md`](governance/planes-and-runtime.md). المصدر للمسارات الستة: [`dealix-six-tracks.md`](dealix-six-tracks.md).

| المصطلح | المعنى المقصود | ملاحظة |
|---------|----------------|--------|
| **Decision plane** | إدراك، تحليل، مذكرات قرار، مخرجات منظمة — لا التزامات خارجية مباشرة | يقابل «استكشاف ذكاء» في الدستور |
| **Execution plane** | سير عمل حتمي، Celery/LangGraph، التزامات خارجية بعد بوابات | Temporal = هدف Tier-1 حسب ADR-0001 |
| **Trust / Control plane** | موافقات، سياسة، تدقيق، تحقق من أدوات، أدلة | لا سياسة حرجة داخل prompts فقط |
| **Data plane** | بيانات تشغيلية، موصلات، مقاييس دلالية، سلسلة بيانات | واجهات موصل versioned |
| **Operating plane** | تسليم: GitHub، CI/CD، بيئات، OIDC، احتفاظ سجلات | مذكور صراحة في `planes-and-runtime` |
| **Six tracks** | مسارات منتج Dealix (إيراد، شراكة، M&A، توسّع، PMI، ثقة/تنفيذي) | ليست نفس «الطائرات» — الطائرات عبرية |
| **Fabric** | طبقة تشغيل كاملة (مثلاً trust fabric = سياسة + IAM + audit + ledger) | يُستخدم في الرادار والـ ADR |

عند إضافة مصطلح جديد: حدّث هذا الملف ثم [`TIER1_MASTER_CLOSURE_CHECKLIST_AR.md`](TIER1_MASTER_CLOSURE_CHECKLIST_AR.md) §1.4.
