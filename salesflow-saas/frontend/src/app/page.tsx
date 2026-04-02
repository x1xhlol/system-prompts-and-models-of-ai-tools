"use client";

import { useState } from "react";
import { 
  BarChart3, 
  Users, 
  Target, 
  MessageSquare,
  Zap,
  Bell,
  Search,
  BrainCircuit,
  Settings,
  BookOpen,
  MonitorPlay,
  FileSignature,
  ShieldCheck,
  Phone,
  Building2,
  DollarSign,
  Brain
} from "lucide-react";

import { DashboardView } from "../components/dealix/dashboard-view";
import { AffiliatesView } from "../components/dealix/affiliates-view";
import { ChatbotView } from "../components/dealix/chatbot-view";
import { PresentationsView } from "../components/dealix/presentations-view";
import { ScriptsView } from "../components/dealix/scripts-view";
import { AgreementsView } from "../components/dealix/agreements-view";
import { GuaranteesView } from "../components/dealix/guarantees-view";
import { OnboardingView } from "../components/dealix/onboarding-view";
import { LandingView } from "../components/dealix/landing-view";
import { PropertiesView } from "../components/dealix/properties-view";
import { RevenueView } from "../components/dealix/revenue-view";
import { KnowledgeView } from "../components/dealix/knowledge-view";
import { AnalyticsView } from "../components/dealix/analytics-view";
import { IntelligenceDashboard } from "../components/dealix/intelligence-dashboard";
import { LeadGeneratorView } from "../components/dealix/lead-generator-view";

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEntered, setIsEntered] = useState(false);

  if (!isEntered) {
    return <LandingView onEnterApp={() => setIsEntered(true)} />;
  }

  const NAV_ITEMS = [
    { id: "overview", label: "لوحة القيادة والمراقبة", icon: BarChart3 },
    { id: "intelligence", label: "🤖 الذكاء المستقل — Manus", icon: BrainCircuit },
    { id: "leads", label: "🎯 توليد العملاء — AI", icon: Target },
    { id: "properties", label: "إدارة المخزون العقاري", icon: Building2 },
    { id: "affiliates", label: "المسوقين والموظفين", icon: Users },
    { id: "agents", label: "الوكلاء الأذكياء", icon: BrainCircuit },
    { id: "revenue", label: "المالية والتحصيل", icon: DollarSign },
    { id: "analytics", label: "التحليلات ونبض السوق", icon: BarChart3 },
    { id: "knowledge", label: "الذكاء والمعرفة", icon: Brain },
    { id: "presentations", label: "البرزنتيشنات القطاعية", icon: MonitorPlay },
    { id: "scripts", label: "سكربتات المبيعات", icon: Phone },
    { id: "agreements", label: "الاتفاقيات واHR", icon: FileSignature },
    { id: "guarantee", label: "الضمان الذهبي", icon: ShieldCheck },
    { id: "onboarding", label: "تأهيل المسوق", icon: BookOpen },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <DashboardView />;
      case "intelligence": return <IntelligenceDashboard />;
      case "leads": return <LeadGeneratorView />;
      case "properties": return <PropertiesView />;
      case "affiliates": return <AffiliatesView />;
      case "agents": return <ChatbotView />;
      case "revenue": return <RevenueView />;
      case "analytics": return <AnalyticsView />;
      case "knowledge": return <KnowledgeView />;
      case "presentations": return <PresentationsView />;
      case "scripts": return <ScriptsView />;
      case "agreements": return <AgreementsView />;
      case "guarantee": return <GuaranteesView />;
      case "onboarding": return <OnboardingView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <aside className="w-72 hidden lg:flex flex-col border-l border-border bg-card/50 backdrop-blur-xl">
        <div className="h-20 flex items-center px-8 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Dealix OS
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? "bg-primary/10 text-primary font-bold border border-primary/20 shadow-sm" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground font-medium"
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-primary" : "opacity-70"}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-border/50 bg-secondary/10">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary/50 transition-all font-medium">
            <Settings className="w-5 h-5" />
            <span>الإعدادات المتقدمة</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-background/50">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10 transition-all">
          <div className="relative w-96">
            <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="البحث الشامل في Dealix (عميل، مسوق، صفقة)..." 
              className="w-full bg-secondary/50 border border-border rounded-full py-2.5 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary border-2 border-background rounded-full animate-pulse" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold">سالم الدوسري</p>
                <p className="text-xs text-muted-foreground">المدير العام (Founder)</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-primary p-[2px]">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center border-2 border-background">
                  <span className="text-sm font-bold text-foreground">SD</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View Injection */}
        <div className="flex-1 w-full max-w-[1600px] mx-auto pb-24 lg:pb-0">
          {renderContent()}
        </div>

        {/* ── Mobile Navigation (Bottom Bar) ───────────────────── */}
        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-card/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex items-center justify-around py-4 px-4 z-50">
          {[
            { id: "overview", icon: BarChart3 },
            { id: "agents", icon: BrainCircuit },
            { id: "presentations", icon: MonitorPlay },
            { id: "scripts", icon: Phone },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === item.id 
                  ? "text-primary scale-110" 
                  : "text-muted-foreground opacity-60"
              }`}
            >
              <item.icon className="w-6 h-6" />
              {activeTab === item.id && (
                <span className="w-1 h-1 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
