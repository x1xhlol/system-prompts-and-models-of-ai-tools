# 🏰 Dealix — إمبراطورية المبيعات الذكية

> **"من أول رسالة واتساب... إلى توقيع العقد"**

## الهدف النهائي

```
عميل محتمل → بحث تلقائي → تأهيل → واتساب مخصص → حجز اجتماع → عرض احترافي → تقرير تنفيذي
```

## بنية النظام: Manus-Style Multi-Agent

- **Orchestrator** (llama-3.3-70b): ينسق جميع الوكلاء
- **Researcher**: يحلل الشركات والسوق السعودي
- **Qualifier**: يعطي كل عميل درجة 0-100
- **Outreach**: يكتب رسائل واتساب بالعربية
- **Closer**: يفاوض ويغلق الصفقات
- **Compliance**: يضمن التوافق مع ZATCA
- **Analytics**: يتتبع الأداء ويقدم التقارير

## Pipeline الكامل

1. **Lead Capture** - WhatsApp / Web / LinkedIn
2. **Company Research** - AI تحليل الشركة
3. **Qualification** - درجة 0-100
4. **WhatsApp Outreach** - رسائل مخصصة
5. **Meeting Booking** - Cal.com integration
6. **Sales Team Alert** - إشعار فوري
7. **Pre-Meeting Presentation** - عرض مخصص
8. **Executive Report** - تقرير بعد الاجتماع

## الأدوات المدمجة (Best of March 2026)

- **Groq** - LLM اللهجة العربية السريع
- **Manus Architecture** - Multi-agent orchestration
- **OpenClaw** - Autonomous WhatsApp messaging
- **CrewAI** - Role-based agent crews
- **LangGraph** - Stateful workflows
- **Cal.com** - Meeting booking
- **Playwright** - Company web research
- **PostgreSQL + pgvector** - Vector search
- **ZATCA API** - Tax compliance
