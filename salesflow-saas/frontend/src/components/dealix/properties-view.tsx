"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2, MapPin, Tag, Plus, Search, Home, LayoutGrid, List as ListIcon, Trash2, Edit3, ExternalLink } from "lucide-react";

export function PropertiesView() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const properties = [
    { 
      id: 1, 
      title: "فيلا مودرن - حي النرجس", 
      type: "Villa", 
      price: "3,200,000 ر.س", 
      area: "350m²", 
      status: "Available", 
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=60",
      location: "الرياض، حي النرجس"
    },
    { 
      id: 2, 
      title: "شقة استثمارية - مجمع الماجدية", 
      type: "Apartment", 
      price: "1,150,000 ر.س", 
      area: "145m²", 
      status: "Reserved", 
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60",
      location: "الرياض، حي الياسمين"
    },
    { 
      id: 3, 
      title: "أرض تجارية - طريق الملك فهد", 
      type: "Land", 
      price: "12,000,000 ر.س", 
      area: "1200m²", 
      status: "Available", 
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60",
      location: "الرياض، العقيق"
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="text-right">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">🏠 إدارة المخزون العقاري</h1>
          <p className="text-sm md:text-base text-muted-foreground">أضف وِراقب العقارات التي يقوم وكلاء الذكاء الاصطناعي بتسويقها حالياً.</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="flex bg-secondary/50 rounded-xl p-1 border border-border">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
          <button className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            إضافة عقار جديد
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="ابحث بالحي، السعر، أو نوع العقار..." 
          className="w-full bg-card border border-border rounded-2xl py-4 pr-12 pl-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
        />
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <div key={prop.id} className="glass-card group overflow-hidden border border-border/50 hover:border-primary/30 transition-all">
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={prop.image}
                  alt={prop.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform group-hover:scale-110 duration-700"
                />
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                  prop.status === 'Available' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {prop.status === 'Available' ? 'متاح' : 'محجوز'}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                   <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{prop.title}</h3>
                   <span className="text-xs font-bold text-muted-foreground bg-secondary px-2 py-1 rounded-lg">ID: #{prop.id}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  {prop.location}
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/30">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold">السعر المطلوب</span>
                    <span className="font-black text-primary">{prop.price}</span>
                  </div>
                  <div className="flex flex-col border-r border-border/30 pr-4">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold">المساحة</span>
                    <span className="font-black">{prop.area}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-xs font-bold">
                    <Edit3 className="w-4 h-4" />
                    تعديل
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-border hover:bg-destructive hover:text-white transition-all text-muted-foreground">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card overflow-hidden border border-border/50">
           <table className="w-full text-right text-sm">
             <thead className="bg-secondary/50 text-muted-foreground border-b border-border/50">
               <tr>
                 <th className="p-4 font-bold">العقار</th>
                 <th className="p-4 font-bold">النوع</th>
                 <th className="p-4 font-bold">السعر</th>
                 <th className="p-4 font-bold">الموقع</th>
                 <th className="p-4 font-bold">الحالة</th>
                 <th className="p-4 font-bold">الإجراءات</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-border/30">
               {properties.map((prop) => (
                 <tr key={prop.id} className="hover:bg-white/5 transition-colors">
                   <td className="p-4 font-bold">{prop.title}</td>
                   <td className="p-4">{prop.type}</td>
                   <td className="p-4 font-mono text-primary font-bold">{prop.price}</td>
                   <td className="p-4 text-muted-foreground">{prop.location}</td>
                   <td className="p-4">
                     <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                       prop.status === 'Available' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                     }`}>
                       {prop.status === 'Available' ? 'متاح' : 'محجوز'}
                     </span>
                   </td>
                   <td className="p-4 flex gap-2">
                      <button className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors"><Edit3 className="w-4 h-4" /></button>
                      <button className="p-2 rounded-lg bg-secondary hover:bg-blue-500/20 text-blue-500 transition-colors"><ExternalLink className="w-4 h-4" /></button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}
    </div>
  );
}
