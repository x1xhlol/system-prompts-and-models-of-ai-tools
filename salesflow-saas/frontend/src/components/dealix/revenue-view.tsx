"use client";

import { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  FileText, 
  Download, 
  ShieldCheck, 
  Wallet, 
  History, 
  BarChart2, 
  PieChart 
} from "lucide-react";

export function RevenueView() {
  const [activeRange, setActiveRange] = useState("month");

  const financialStats = [
    { label: "إجمالي الإيرادات", value: "1,245,000 ر.س", trend: "+18.2%", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "عمولات المسوقين", value: "185,000 ر.س", trend: "+12.5%", icon: Wallet, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "صافي الأرباح", value: "1,060,000 ر.س", trend: "+20.1%", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { label: "ضريبة القيمة المضافة", value: "163,000 ر.س", trend: "+18.2%", icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const recentTransactions = [
    { id: "INV-8923", client: "شركة الأفق", amount: "125,000 ر.س", date: "2024-03-28", status: "Paid", method: "Mada" },
    { id: "INV-8924", client: "مجموعة الرواد", amount: "450,000 ر.س", date: "2024-03-27", status: "Paid", method: "Apple Pay" },
    { id: "INV-8925", client: "فيصل خالد", amount: "85,000 ر.س", date: "2024-03-26", status: "Pending", method: "STC Pay" },
    { id: "INV-8926", client: "مؤسسة النور", amount: "12,500 ر.س", date: "2024-03-25", status: "Paid", method: "Transfer" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 leading-relaxed text-right rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">💰 خزينة الإمبراطورية (Revenue Control)</h1>
          <p className="text-sm md:text-base text-muted-foreground">مراقبة التدفقات المالية، العمولات، والامتثال الضريبي (ZATCA).</p>
        </div>
        <div className="flex bg-secondary/50 rounded-xl p-1 border border-border">
          {["day", "week", "month", "year"].map((r) => (
            <button 
              key={r}
              onClick={() => setActiveRange(r)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeRange === r ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
            >
              {r === 'day' ? 'يومي' : r === 'week' ? 'أسبوعي' : r === 'month' ? 'شهري' : 'سنوي'}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Stats Overlays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialStats.map((stat, i) => (
          <div key={i} className="glass-card p-6 border border-border/50 group hover:shadow-xl hover:shadow-primary/5 transition-all">
             <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-1 text-emerald-500 font-black text-xs bg-emerald-500/10 px-2 py-1 rounded-full">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.trend}
                </div>
             </div>
             <p className="text-xs font-bold text-muted-foreground uppercase mb-1">{stat.label}</p>
             <h3 className="text-2xl md:text-3xl font-black">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Transactions List */}
        <div className="lg:col-span-2 glass-card border border-border/50 overflow-hidden">
           <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <History className="w-5 h-5 text-primary" />
                 <h2 className="font-bold">أحدث المعاملات المالية</h2>
              </div>
              <button className="text-xs font-bold bg-primary text-black px-4 py-1.5 rounded-xl flex gap-2 items-center hover:scale-105 transition-all">
                <BarChart2 className="w-4 h-4" />
                تحليل معمق
              </button>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-right text-sm">
               <thead className="bg-secondary/20 text-muted-foreground border-b border-border/50">
                 <tr>
                   <th className="p-4 font-bold">المعرف</th>
                   <th className="p-4 font-bold">العميل</th>
                   <th className="p-4 font-bold">المبلغ</th>
                   <th className="p-4 font-bold">طريقة الدفع</th>
                   <th className="p-4 font-bold">الحالة</th>
                   <th className="p-4 font-bold">الفاتورة</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/30">
                 {recentTransactions.map((tx) => (
                   <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                     <td className="p-4 font-mono font-bold text-primary">{tx.id}</td>
                     <td className="p-4 font-bold">{tx.client}</td>
                     <td className="p-4 font-black">{tx.amount}</td>
                     <td className="p-4 opacity-70">{tx.method}</td>
                     <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black ${
                          tx.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {tx.status === 'Paid' ? 'مدفوعة' : 'معلقة'}
                        </span>
                     </td>
                     <td className="p-4">
                        <button className="p-2 rounded-lg bg-secondary hover:bg-primary/20 text-primary transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        {/* ZATCA Compliance Summary */}
        <div className="space-y-6">
           <div className="glass-card p-6 border border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-4">
                 <ShieldCheck className="w-5 h-5 text-amber-500" />
                 <h2 className="font-bold text-lg">الامتثال الضريبي (ZATCA)</h2>
              </div>
              <div className="space-y-4">
                 <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                       <span className="opacity-60">حالة الربط مع الفوترة الإلكترونية:</span>
                       <span className="text-emerald-500 font-bold">نشط ●</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="opacity-60">المرحلة الحالية:</span>
                       <span className="font-bold">المرحلة الثانية (Integration)</span>
                    </div>
                 </div>
                 <button className="w-full py-2.5 rounded-xl border border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-black transition-all text-sm font-bold flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    توليد الإقرار الضريبي للموسم
                 </button>
              </div>
           </div>

           <div className="glass-card p-6 border-primary/20 bg-primary/5">
              <h3 className="font-black mb-4">توزيع العمولات (Commissions)</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <div className="text-right">
                       <p className="text-[10px] text-muted-foreground font-bold uppercase">العمولات المستحقة</p>
                       <p className="text-xl font-black">٤٥,٢٠٠ ر.س</p>
                    </div>
                    <PieChart className="w-8 h-8 text-primary opacity-50" />
                 </div>
                 <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="w-[65%] h-full bg-primary rounded-full" />
                 </div>
                 <p className="text-[10px] opacity-40 text-center font-bold">تم تمويل ٦٥٪ من المحفظة الاستراتيجية للمسوقين</p>
                 <button className="w-full py-2.5 bg-primary text-black rounded-xl font-black text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                    صرف العمولات المعتمدة
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
