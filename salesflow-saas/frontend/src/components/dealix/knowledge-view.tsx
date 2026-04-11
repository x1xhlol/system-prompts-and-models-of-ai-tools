"use client";

import { useState } from "react";
import { 
  FileUp, 
  BookOpen, 
  Search, 
  Brain, 
  Cpu, 
  Database, 
  FileText, 
  Presentation, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  ArrowRight
} from "lucide-react";

export function KnowledgeView() {
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"articles" | "assets">("articles");

  const knowledgeBase = [
    { title: "دليل المبيعات - القطاع العقاري Riyadh", type: "PDF", size: "4.2 MB", date: "2024-03-30", status: "Embedded" },
    { title: "عرض تقديمي - خدمة إدارة الأملاك", type: "PPTX", size: "12.8 MB", date: "2024-03-29", status: "Active" },
    { title: "سكربت الرد على الاعتراضات - اللهجة السعودية", type: "Doc", size: "0.8 MB", date: "2024-03-28", status: "Embedded" },
    { title: "تحليل السوق - حي النرجس والياسمين", type: "PDF", size: "2.1 MB", date: "2024-03-25", status: "Active" },
  ];

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => setIsUploading(false), 3000);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 leading-relaxed text-right rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">🧠 مركز الاستيعاب المعرفي (AI Knowledge)</h1>
          <p className="text-sm md:text-base text-muted-foreground">ارفع ملفاتك (PDF/PPT/Docs) لتدريب وكلاء المبيعات وجعلهم خبراء في مجالك.</p>
        </div>
        <div className="flex bg-secondary/50 rounded-xl p-1 border border-border">
          <button 
            onClick={() => setActiveTab("articles")}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'articles' ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
          >
            <BookOpen className="w-4 h-4" />
            المقالات المعرفية
          </button>
          <button 
            onClick={() => setActiveTab("assets")}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'assets' ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
          >
            <Presentation className="w-4 h-4" />
            الأصول القطاعية
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Hub */}
        <div className="lg:col-span-1 space-y-6">
           <div className="glass-card p-6 border-dashed border-2 border-primary/30 hover:border-primary transition-all bg-primary/5 group cursor-pointer" onClick={handleUpload}>
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                 <div className={`p-4 rounded-full bg-primary text-black shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 ${isUploading ? 'animate-spin' : ''}`}>
                   {isUploading ? <Loader2 className="w-8 h-8" /> : <FileUp className="w-8 h-8" />}
                 </div>
                 <div className="text-center">
                    <p className="font-black text-lg">ارفع الملفات لتدريب العقل</p>
                    <p className="text-xs text-muted-foreground mt-1">يدعم PDF, PPTX, DOCX, TXT</p>
                 </div>
              </div>
           </div>

           <div className="glass-card p-6 space-y-6">
              <div className="flex items-center gap-3">
                 <Brain className="w-6 h-6 text-primary" />
                 <h2 className="font-bold">حالة الذاكرة السيادية</h2>
              </div>
              <div className="space-y-4 text-xs font-medium">
                 <div className="flex justify-between items-center border-b border-border/30 pb-2">
                    <span className="opacity-60 flex items-center gap-2">
                       <Cpu className="w-3 h-3" />
                       المعالجة العصبية:
                    </span>
                    <span className="text-emerald-500 font-bold">مستقر بنسبة ٩٩٪</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-border/30 pb-2">
                    <span className="opacity-60 flex items-center gap-2">
                       <Database className="w-3 h-3" />
                       حجم قاعدة البيانات الشعاعية:
                    </span>
                    <span className="font-bold">١,٢٥٠ عنصر (Vector)</span>
                 </div>
              </div>
              <button className="w-full py-3 bg-secondary hover:bg-primary hover:text-black transition-all rounded-xl font-black text-sm flex gap-2 items-center justify-center">
                 <Sparkles className="w-4 h-4" />
                 إعادة بناء الفهارس (Re-index)
              </button>
           </div>
        </div>

        {/* Existing Content */}
        <div className="lg:col-span-2 space-y-6">
           <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="ابحث في قاعدة المعرفة المكتسبة..." 
                className="w-full bg-card border border-border rounded-2xl py-4 pr-12 pl-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
              />
           </div>

           <div className="glass-card overflow-hidden border border-border/50">
              <div className="p-4 border-b border-border/50 bg-secondary/20 flex justify-between items-center">
                 <h3 className="font-black text-sm uppercase tracking-widest">تاريخ التدريب والرفع</h3>
                 <span className="text-[10px] opacity-60 font-bold">إجمالي المصادر: {knowledgeBase.length}</span>
              </div>
              <div className="divide-y divide-border/30">
                 {knowledgeBase.map((item, i) => (
                   <div key={i} className="p-5 flex items-center justify-between hover:bg-white/5 transition-all group">
                      <div className="flex items-center gap-4">
                         <div className="p-3 rounded-xl bg-secondary group-hover:bg-primary/20 transition-colors">
                           {item.type === 'PDF' ? <FileText className="w-6 h-6 text-red-500" /> : <Presentation className="w-6 h-6 text-amber-500" />}
                         </div>
                         <div className="text-right">
                            <h4 className="font-bold text-lg leading-none mb-1">{item.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                               <span>تاريخ الرفع: {item.date}</span>
                               <span>●</span>
                               <span>الحجم: {item.size}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="flex flex-col items-end">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                               item.status === 'Embedded' ? 'bg-emerald-500 text-white' : 'bg-primary text-black'
                            }`}>
                               {item.status === 'Embedded' ? 'مدمج عصبيًا' : 'نشط'}
                            </span>
                            <span className="text-[9px] opacity-40 mt-1 flex items-center gap-1">
                               تم المسح بـ GPT-4o
                               <CheckCircle2 className="w-2 h-2 text-emerald-500" />
                            </span>
                         </div>
                         <button className="p-2 rounded-xl border border-border hover:bg-secondary transition-all">
                            <ArrowRight className="w-4 h-4 rotate-180" />
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
