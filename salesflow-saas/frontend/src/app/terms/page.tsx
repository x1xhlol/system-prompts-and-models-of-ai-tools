'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const LAST_UPDATED = '2026-03-01';

const sections = [
  { title: 'المقدمة', body: 'مرحباً بكم في منصة Dealix ("المنصة"). باستخدامك للمنصة، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل استخدام خدماتنا.' },
  { title: 'تعريفات', body: '"المنصة" تعني تطبيق Dealix وجميع خدماته. "المستخدم" يعني أي شخص أو كيان يستخدم المنصة. "الخدمات" تشمل جميع الميزات والأدوات المتاحة عبر المنصة بما في ذلك إدارة العملاء والصفقات والتواصل.' },
  { title: 'الأهلية', body: 'يجب أن يكون عمرك 18 عاماً على الأقل لاستخدام المنصة. باستخدامك للمنصة، تؤكد أنك تملك الأهلية القانونية لإبرام هذه الاتفاقية وأنك مفوّض من قبل الشركة التي تمثلها.' },
  { title: 'الحساب والأمان', body: 'أنت مسؤول عن الحفاظ على سرية بيانات حسابك وكلمة المرور. يجب إخطارنا فوراً عند اكتشاف أي استخدام غير مصرح به لحسابك. لا تتحمل Dealix مسؤولية أي خسارة ناتجة عن استخدام غير مصرح به.' },
  { title: 'الاستخدام المقبول', body: 'تلتزم باستخدام المنصة للأغراض التجارية المشروعة فقط. يُحظر استخدام المنصة في أي نشاط مخالف للأنظمة السعودية أو لإرسال رسائل غير مرغوبة (spam) أو لجمع بيانات بطرق غير مشروعة.' },
  { title: 'حماية البيانات', body: 'نلتزم بنظام حماية البيانات الشخصية (PDPL) في المملكة العربية السعودية. تتم معالجة البيانات وفقاً لسياسة الخصوصية الخاصة بنا وبموافقة صريحة من أصحاب البيانات.' },
  { title: 'الملكية الفكرية', body: 'جميع حقوق الملكية الفكرية للمنصة وبرامجها وتصاميمها وعلاماتها التجارية مملوكة لشركة Dealix. لا يحق لك نسخ أو تعديل أو توزيع أي جزء من المنصة دون إذن كتابي مسبق.' },
  { title: 'الإنهاء', body: 'يحق لنا تعليق أو إنهاء حسابك في حال مخالفة هذه الشروط. يمكنك إلغاء حسابك في أي وقت من خلال إعدادات الحساب. عند الإنهاء، سيتم حذف بياناتك وفقاً لسياسة الاحتفاظ بالبيانات.' },
  { title: 'القانون الحاكم', body: 'تخضع هذه الشروط لأنظمة المملكة العربية السعودية. أي نزاع ينشأ عن استخدام المنصة يخضع لاختصاص المحاكم المختصة في المملكة العربية السعودية.' },
];

export default function TermsPage() {
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

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">الشروط والأحكام</h1>
        <p className="text-sm text-slate-500 mb-10">آخر تحديث: {LAST_UPDATED}</p>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold text-white mb-2">{s.title}</h2>
              <p className="text-slate-300 leading-relaxed text-sm">{s.body}</p>
            </section>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
