'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const LAST_UPDATED = '2026-03-01';

const sections = [
  { title: 'نظرة عامة', body: 'تلتزم Dealix بحماية خصوصية مستخدميها وفقاً لنظام حماية البيانات الشخصية (PDPL) الصادر بالمرسوم الملكي رقم (م/19) بتاريخ 1443/2/9هـ. توضح هذه السياسة كيفية جمع واستخدام ومعالجة بياناتك الشخصية.', pdpl: false },
  { title: 'البيانات التي نجمعها', body: 'نجمع بيانات التسجيل (الاسم، البريد الإلكتروني، رقم الجوال)، بيانات الشركة (الاسم، السجل التجاري، المجال)، بيانات الاستخدام (سجلات الدخول، النشاط)، وبيانات الاتصال (رسائل واتساب، بريد إلكتروني) بموافقة صريحة.', pdpl: false },
  { title: 'الأساس القانوني للمعالجة (PDPL)', body: 'نعالج بياناتك بناءً على: (أ) موافقتك الصريحة، (ب) تنفيذ العقد المبرم معك، (ج) الالتزام بمتطلبات نظامية. يحق لك سحب موافقتك في أي وقت دون المساس بمشروعية المعالجة التي تمت قبل السحب.', pdpl: true },
  { title: 'حقوق صاحب البيانات (PDPL)', body: 'وفقاً لنظام PDPL، يحق لك: الوصول إلى بياناتك الشخصية، تصحيح البيانات غير الدقيقة، طلب حذف بياناتك، الحصول على نسخة من بياناتك بصيغة قابلة للقراءة، الاعتراض على المعالجة، وتقييد معالجة بياناتك.', pdpl: true },
  { title: 'نقل البيانات خارج المملكة (PDPL)', body: 'لا يتم نقل بياناتك الشخصية خارج المملكة العربية السعودية إلا وفقاً لمتطلبات المادة 29 من نظام PDPL وبعد التأكد من توفر مستوى حماية كافٍ في الدولة المستقبلة أو الحصول على موافقتك الصريحة.', pdpl: true },
  { title: 'ملفات تعريف الارتباط', body: 'نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربتك. تشمل: ملفات ضرورية لتشغيل المنصة، ملفات تحليلية لفهم الاستخدام، وملفات تفضيلات لحفظ إعداداتك. يمكنك التحكم في إعدادات الملفات من خلال المتصفح.', pdpl: false },
  { title: 'الاحتفاظ بالبيانات (PDPL)', body: 'نحتفظ ببياناتك طوال مدة اشتراكك وفترة إضافية لا تتجاوز 12 شهراً بعد إلغاء الحساب للأغراض القانونية. يتم حذف البيانات تلقائياً بعد انتهاء فترة الاحتفاظ ما لم يكن هناك التزام نظامي يقتضي خلاف ذلك.', pdpl: true },
  { title: 'أمن البيانات', body: 'نتخذ إجراءات أمنية تقنية وتنظيمية لحماية بياناتك تشمل: التشفير أثناء النقل والتخزين (TLS 1.3, AES-256)، التحكم في الوصول، المراقبة المستمرة، والنسخ الاحتياطي المنتظم.', pdpl: false },
  { title: 'الإبلاغ عن الانتهاكات (PDPL)', body: 'في حال حدوث أي انتهاك لبياناتك الشخصية، سنقوم بإخطارك والجهة المختصة خلال 72 ساعة وفقاً لمتطلبات نظام PDPL. سنوضح طبيعة الانتهاك والإجراءات المتخذة والتوصيات لتقليل الأثر.', pdpl: true },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          رجوع
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">سياسة الخصوصية</h1>
        <p className="text-sm text-slate-500 mb-10">آخر تحديث: {LAST_UPDATED}</p>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <section key={i} className={s.pdpl ? 'p-4 rounded-xl border border-primary/20 bg-primary/5' : ''}>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold text-white">{s.title}</h2>
                {s.pdpl && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                    PDPL
                  </span>
                )}
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">{s.body}</p>
            </section>
          ))}
        </div>

        {/* DPO Contact */}
        <div className="mt-12 p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white mb-2">التواصل مع مسؤول حماية البيانات (DPO)</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            لأي استفسارات تتعلق بخصوصية بياناتك أو لممارسة حقوقك وفقاً لنظام PDPL، يمكنك التواصل مع مسؤول حماية البيانات:
          </p>
          <div className="space-y-1 text-sm text-slate-400">
            <p>البريد الإلكتروني: <span className="text-primary">dpo@dealix.sa</span></p>
            <p>الهاتف: <span className="text-primary" dir="ltr">+966 11 XXX XXXX</span></p>
            <p>العنوان: الرياض، المملكة العربية السعودية</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
