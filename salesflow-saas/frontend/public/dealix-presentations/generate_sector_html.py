"""Generate 10 sector presentation HTML files (Arabic, Dealix branding). Run: py generate_sector_html.py"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent

SECTORS = [
    ("01-sector-healthcare", "الرعاية الصحية والعيادات", "Healthcare & Clinics", "جذب المرضى، إدارة المواعيد، التقييمات، ومنافسة العيادات القريبة.", "اكتشاف ليدات من خرائط ومصادر متعددة، تأهيل BANT، متابعة واتساب وإيميل، تقارير للإدارة."),
    ("02-sector-realestate", "العقارات والتطوير", "Real Estate", "طول دورة البيع، تعدد العملاء المحتملين، وتكلفة الحملات.", "مسار صفقات واضح، تذكير آلي، ربط بفرص Salesforce، توقع إيرادات."),
    ("03-sector-manufacturing", "التصنيع والصناعة", "Manufacturing", "فتح أسواق B2B، الموزعون، التصدير، ومتابعة العروض الفنية.", "فرق وكلاء للاكتشاف والإغلاق، مستندات وعروض، تكامل دفع للعقود الكبيرة."),
    ("04-sector-logistics", "اللوجستيات والشحن", "Logistics & Shipping", "عروض أسعار معقدة، متابعة الشحنات، ومنافسة الأسعار.", "تأهيل سريع، تسلسل إيميل، مكالمات صوتية عند الحاجة، لوحة صفقات."),
    ("05-sector-retail", "التجزئة والبيع بالتجزئة", "Retail", "ولاء العملاء، العروض الموسمية، وتعدد الفروع.", "حملات واتساب، شرائح عملاء، تحليل سلوك، Upsell آلي."),
    ("06-sector-it", "التقنية والبرمجيات", "IT & Software", "دورات مبيعات طويلة، أمن المعلومات، وطلبات POC.", "مسارات تأهيل عميق، عروض مخصصة، دعم فني مرتبط بالصفقة."),
    ("07-sector-education", "التعليم والتدريب", "Education & Training", "التسجيل، المنافسة بين المعاهد، وجودة العرض الرقمي.", "جذب ليدات تعليمية، متابعة الحملات، تقارير تحويل."),
    ("08-sector-hospitality", "الضيافة والمطاعم", "Hospitality & F&B", "الحجوزات، تقييمات المنصات، وولاء الزوار.", "حملات سريعة، ردود ذكية، حزم عروض حسب الفرع."),
    ("09-sector-professional", "الخدمات المهنية", "Legal & Professional", "بناء الثقة، الامتثال، وبطء اتخاذ قرار العميل.", "محتوى مهني، مسار موافقات، حوكمة قبل الإرسال."),
    ("10-sector-automotive", "السيارات والنقل", "Automotive", "مخزون، تمويل، ومتابعة العملاء بين الفروع.", "تنسيق قنوات، تذكير بالعروض، ربط CRM بالمخزون."),
]


def page(slug: str, ar: str, en: str, pain: str, sol: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>Dealix — {ar}</title>
  <link rel="stylesheet" href="dealix-print.css" />
</head>
<body>
  <div class="cover">
    <div class="brand">DEALIX — ديلكس</div>
    <h1>عرض قطاع: {ar}</h1>
    <p class="tagline">{en} — نظام إيرادات ذاتي للمؤسسات السعودية · هوية موحّدة · جاهز للاستثمار والتشغيل</p>
  </div>

  <div class="section">
    <h2>لماذا هذا القطاع؟</h2>
    <p>{pain}</p>
  </div>

  <div class="section">
    <h2>كيف يخدمه Dealix؟</h2>
    <p>{sol}</p>
  </div>

  <div class="section">
    <h2>القدرات الاستراتيجية (موحّدة لكل القطاعات)</h2>
    <ul>
      <li><strong>وكلاء ذكاء متعددو الطبقات</strong> — استكشاف، تأهيل، إغلاق، ذكاء سوق، تحليل محادثات.</li>
      <li><strong>OpenClaw Durable Flows</strong> — مهام طويلة الأمد مع نقاط تفتيش ومراجعات.</li>
      <li><strong>حوكمة before_agent_reply</strong> — لا إرسال حساس بدون موافقة وسياق مستأجر.</li>
      <li><strong>تكامل Salesforce Agentforce</strong> — تزامن الصفقات والأرضية الحقيقية للبيانات.</li>
      <li><strong>قنوات:</strong> واتساب، إيميل، لينكدإن، صوت (عند التفعيل).</li>
      <li><strong>دفع واشتراكات:</strong> Stripe — فوترة وحزم.</li>
      <li><strong>مسوقون وعمولات:</strong> تتبع الإحالات والمستحقات.</li>
      <li><strong>تحسين ذاتي:</strong> حلقة مراقبة وتجارب وترقية آمنة للأداء.</li>
    </ul>
  </div>

  <div class="section">
    <h2>مؤشرات نجاح مقترحة للعميل في هذا القطاع</h2>
    <ul>
      <li>زيادة معدل التحويل من ليد إلى اجتماع.</li>
      <li>تقليل زمن الرد على العملاء المحتملين الساخنين.</li>
      <li>زيادة قيمة الصفقة المتوسطة (حسب استراتيجية التسعير).</li>
      <li>تقليل العمل اليدوي لفريق المبيعات بنسبة واضحة خلال 90 يوماً.</li>
    </ul>
  </div>

  <div class="section">
    <h2>الخطوة التالية</h2>
    <p>اطلب عرضاً مخصصاً للقطاع مع ربط تجريبي ببيئة CRM — ثم تفعيل Go-Live Gate بعد اكتمال متغيرات التكامل.</p>
  </div>

  <p style="text-align:center;color:#64748b;font-size:0.85rem;">© Dealix · {slug} · للطباعة كـ PDF: Ctrl+P → حفظ كـ PDF</p>
</body>
</html>
"""


def main() -> None:
    for slug, ar, en, pain, sol in SECTORS:
        path = ROOT / f"{slug}-ar.html"
        path.write_text(page(slug, ar, en, pain, sol), encoding="utf-8")
        print("Wrote", path.name)


if __name__ == "__main__":
    main()
