"use client";

import { 
  FileText, 
  ShieldCheck, 
  FileSignature, 
  Download, 
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  Building
} from "lucide-react";

export function AgreementsView() {
  const agreements = [
    { id: "AG-2024-001", title: "اتفاقية وساطة عقارية (Exclusive)", type: "Brokerage", status: "Signed", date: "2024-03-20", party: "شركة الراجحي العقارية" },
    { id: "AG-2024-002", title: "عقد توظيف مسوق (Tier 2)", type: "Employment", status: "Pending", date: "2024-03-25", party: "سعد بن عبدالله" },
    { id: "AG-2024-003", title: "اتفاقية السرية وعدم الإفصاح (NDA)", type: "Legal", status: "Review", date: "2024-03-28", party: "مجموعة الشايع" },
  ];

  const templates = [
    { title: "عقد وساطة (أفراد)", icon: Building, color: "bg-blue-500/10 text-blue-500" },
    { title: "عقد وساطة (شركات)", icon: Building, color: "bg-purple-500/10 text-purple-500" },
    { title: "اتفاقية عمولة مسوق", icon: FileSignature, color: "bg-emerald-500/10 text-emerald-500" },
    { title: "عقد عمل مرن (السعودية)", icon: UserCheck, color: "bg-amber-500/10 text-amber-500" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">📑 الاتفاقيات وHR السيادي</h1>
          <p className="text-gray-400 font-bold">إدارة العقود، التواقيع الإلكترونية، والامتثال للأنظمة السعودية.</p>
        </div>
        <button className="bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-lg flex items-center gap-2">
          <FileSignature className="w-4 h-4" />
          إنشاء اتفاقية جديدة
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-yellow-400/30 transition-all cursor-pointer group">
            <div className={`w-10 h-10 rounded-lg ${template.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <template.icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm">{template.title}</h3>
            <p className="text-[10px] text-gray-500 mt-1 underline">استخدام النموذج</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agreements Table */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-white/5">
            <h2 className="font-black text-lg">أحدث الاتفاقيات</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-white/5 text-gray-400">
                <tr>
                  <th className="p-4 font-bold">المعرف</th>
                  <th className="p-4 font-bold">العنوان</th>
                  <th className="p-4 font-bold">الطرف الثاني</th>
                  <th className="p-4 font-bold">الحالة</th>
                  <th className="p-4 font-bold">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {agreements.map((ag) => (
                  <tr key={ag.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-bold text-yellow-400">{ag.id}</td>
                    <td className="p-4 font-bold">{ag.title}</td>
                    <td className="p-4 text-gray-400">{ag.party}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black inline-flex items-center gap-1 ${
                        ag.status === 'Signed' ? 'bg-emerald-500/10 text-emerald-500' : 
                        ag.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {ag.status === 'Signed' ? <CheckCircle className="w-3 h-3" /> : 
                         ag.status === 'Pending' ? <Clock className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {ag.status === 'Signed' ? 'موقّع' : ag.status === 'Pending' ? 'بانتظار التوقيع' : 'تحت المراجعة'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 rounded-lg bg-white/5 hover:bg-yellow-400/20 text-yellow-400 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-amber-500 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance Guard */}
        <div className="space-y-6">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              <h2 className="text-xl font-black">حارس الامتثال</h2>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">كافة العقود المتولدة متوافقة مع لوائح الهيئة العامة للعقار وأنظمة وزارة الموارد البشرية.</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold">تحديث قوانين العمل (2024)</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold">تكامل النفاذ الوطني (IAM)</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-black">تنبيهات قانونية</h2>
            </div>
            <ul className="text-[10px] space-y-2 text-gray-400 list-disc list-inside font-bold">
              <li>اتفاقية &quot;سعد&quot; ستنتهي صلاحيتها خلال ٣ أيام.</li>
              <li>تحديث مطلوب لنموذج وساطة الشركات (إصدار ٢.١).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
