"use client";

import { useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Users,
  Target,
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
  Brain,
  LineChart,
  ClipboardList,
  Receipt,
  Layers,
  LogOut,
  MousePointerClick,
  UserCheck,
  TrendingUp,
  Crosshair,
  SlidersHorizontal,
  Activity,
  BookMarked,
  Handshake,
  Share2,
  Rocket,
  Megaphone,
} from "lucide-react";

import { DashboardView } from "../../components/dealix/dashboard-view";
import { AffiliatesView } from "../../components/dealix/affiliates-view";
import { ChatbotView } from "../../components/dealix/chatbot-view";
import { PresentationsView } from "../../components/dealix/presentations-view";
import { ScriptsView } from "../../components/dealix/scripts-view";
import { AgreementsView } from "../../components/dealix/agreements-view";
import { GuaranteesView } from "../../components/dealix/guarantees-view";
import { OnboardingView } from "../../components/dealix/onboarding-view";
import { PropertiesView } from "../../components/dealix/properties-view";
import { RevenueView } from "../../components/dealix/revenue-view";
import { KnowledgeView } from "../../components/dealix/knowledge-view";
import { AnalyticsView } from "../../components/dealix/analytics-view";
import { BusinessImpactView } from "../../components/dealix/business-impact-view";
import { CustomerOnboardingJourneyView } from "../../components/dealix/customer-onboarding-journey-view";
import { IntelligenceDashboard } from "../../components/dealix/intelligence-dashboard";
import { LeadGeneratorView } from "../../components/dealix/lead-generator-view";
import { SalesOsView } from "../../components/dealix/sales-os-view";
import { FullOpsView } from "../../components/dealix/full-ops-view";
import { PipelineKanban } from "../../components/dealix/pipeline-kanban";
import { UnifiedInbox } from "../../components/dealix/unified-inbox";
import { LeadScoreCard } from "../../components/dealix/lead-score-card";
import { GoLiveReadinessCard } from "../../components/dealix/go-live-readiness-card";
import { OperatingModelView } from "../../components/dealix/operating-model-view";
import { PartnershipStudioView } from "../../components/dealix/partnership-studio-view";
import { GrowthPlaybookView } from "../../components/dealix/growth-playbook-view";
import { GovernanceMetricsView } from "../../components/dealix/governance-metrics-view";
import { IdentityGraphView } from "../../components/dealix/identity-graph-view";
import { VerticalPlaybooksView } from "../../components/dealix/vertical-playbooks-view";
import { AgentQualityView } from "../../components/dealix/agent-quality-view";
import { MarketerHubView } from "../../components/dealix/marketer-hub-view";

const dashboardLeadScoreDemo = {
  score: 82,
  breakdown: [
    { key: "engagement", label: "التفاعل", value: 24, icon: MousePointerClick },
    { key: "profile", label: "الملف الشخصي", value: 20, icon: UserCheck },
    { key: "behavior", label: "السلوك", value: 22, icon: TrendingUp },
    { key: "intent", label: "نية الشراء", value: 16, icon: Crosshair },
  ],
  recommendation: "عميل واعد — تابع خلال ٢٤ ساعة",
};

const HUB_ORDER = ["platform", "sales", "partnerships", "growth"] as const;
type HubId = (typeof HUB_ORDER)[number];

const HUB_LABELS: Record<HubId, string> = {
  platform: "المنصة والحوكمة",
  sales: "محرك المبيعات",
  partnerships: "الشراكات الاستراتيجية",
  growth: "النمو والاستراتيجية",
};

const NAV_ITEMS = [
  { id: "overview", label: "لوحة القيادة والمراقبة", icon: BarChart3, hub: "platform" as const },
  { id: "go-live", label: "جاهزية الإطلاق", icon: ShieldCheck, hub: "platform" as const },
  { id: "operating-model", label: "نموذج التشغيل OS", icon: SlidersHorizontal, hub: "platform" as const },
  { id: "governance-metrics", label: "الحوكمة والمؤشرات", icon: ShieldCheck, hub: "platform" as const },
  { id: "agent-quality", label: "جودة الوكلاء", icon: Activity, hub: "platform" as const },
  { id: "onboarding", label: "تأهيل المسوق", icon: BookOpen, hub: "platform" as const },
  { id: "agreements", label: "الاتفاقيات واHR", icon: FileSignature, hub: "platform" as const },
  { id: "guarantee", label: "الضمان الذهبي", icon: ShieldCheck, hub: "platform" as const },
  { id: "leads", label: "توليد العملاء — AI", icon: Target, hub: "sales" as const },
  { id: "pipeline", label: "مسار الصفقات", icon: Target, hub: "sales" as const },
  { id: "inbox", label: "صندوق الوارد الموحد", icon: Bell, hub: "sales" as const },
  { id: "scoring", label: "تقييم العملاء AI", icon: Zap, hub: "sales" as const },
  { id: "scripts", label: "سكربتات المبيعات", icon: Phone, hub: "sales" as const },
  { id: "presentations", label: "البرزنتيشنات القطاعية", icon: MonitorPlay, hub: "sales" as const },
  { id: "properties", label: "إدارة المخزون العقاري", icon: Building2, hub: "sales" as const },
  { id: "marketer-hub", label: "مركز المسوق", icon: Megaphone, hub: "sales" as const },
  { id: "affiliates", label: "المسوقين والموظفين", icon: Users, hub: "sales" as const },
  { id: "agents", label: "الوكلاء الأذكياء", icon: BrainCircuit, hub: "sales" as const },
  { id: "revenue", label: "المالية والتحصيل", icon: DollarSign, hub: "sales" as const },
  { id: "sales-os", label: "دفتر العمولة (Sales OS)", icon: Receipt, hub: "sales" as const },
  { id: "full-ops", label: "التشغيل الشامل (Full Ops)", icon: Layers, hub: "sales" as const },
  { id: "analytics", label: "التحليلات ونبض السوق", icon: BarChart3, hub: "sales" as const },
  { id: "knowledge", label: "الذكاء والمعرفة", icon: Brain, hub: "sales" as const },
  { id: "partnership-studio", label: "Partnership Studio", icon: Handshake, hub: "partnerships" as const },
  { id: "identity-graph", label: "طبقة الكيان الموحّد", icon: Share2, hub: "partnerships" as const },
  { id: "vertical-playbooks", label: "Playbooks قطاعية", icon: BookMarked, hub: "partnerships" as const },
  { id: "growth-playbook", label: "نمو واستعداد استحواذ", icon: Rocket, hub: "growth" as const },
  { id: "intelligence", label: "الذكاء المستقل — Manus", icon: BrainCircuit, hub: "growth" as const },
  { id: "business-impact", label: "القيمة للشركات", icon: LineChart, hub: "growth" as const },
  { id: "customer-journey", label: "مسار التشغيل مع العميل", icon: ClipboardList, hub: "growth" as const },
] as const;
type DashboardTabId = (typeof NAV_ITEMS)[number]["id"];

export default function DashboardPage() {
  const auth = useRequireAuth();
  const router = useRouter();
  const allowedTabs = useMemo(() => new Set<DashboardTabId>(NAV_ITEMS.map((n) => n.id)), []);
  const [activeTab, setActiveTabState] = useState<DashboardTabId>("overview");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("section") || "overview";
    if (allowedTabs.has(requested as DashboardTabId)) {
      setActiveTabState(requested as DashboardTabId);
    }
  }, [allowedTabs]);

  const setActiveTab = (tab: DashboardTabId) => {
    const next = new URLSearchParams(window.location.search);
    next.set("section", tab);
    setActiveTabState(tab);
    router.push(`/dashboard?${next.toString()}`);
  };

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        جاري التحقق من الجلسة…
      </div>
    );
  }
  if (!auth.user) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <DashboardView />;
      case "business-impact":
        return <BusinessImpactView />;
      case "go-live":
        return <GoLiveReadinessCard />;
      case "operating-model":
        return <OperatingModelView />;
      case "governance-metrics":
        return <GovernanceMetricsView />;
      case "agent-quality":
        return <AgentQualityView />;
      case "partnership-studio":
        return <PartnershipStudioView />;
      case "identity-graph":
        return <IdentityGraphView />;
      case "vertical-playbooks":
        return <VerticalPlaybooksView />;
      case "growth-playbook":
        return <GrowthPlaybookView />;
      case "customer-journey":
        return <CustomerOnboardingJourneyView />;
      case "intelligence":
        return <IntelligenceDashboard />;
      case "leads":
        return <LeadGeneratorView />;
      case "properties":
        return <PropertiesView />;
      case "marketer-hub":
        return <MarketerHubView />;
      case "affiliates":
        return <AffiliatesView />;
      case "agents":
        return <ChatbotView />;
      case "revenue":
        return <RevenueView />;
      case "sales-os":
        return <SalesOsView />;
      case "full-ops":
        return <FullOpsView />;
      case "analytics":
        return <AnalyticsView />;
      case "knowledge":
        return <KnowledgeView />;
      case "presentations":
        return <PresentationsView />;
      case "scripts":
        return <ScriptsView />;
      case "agreements":
        return <AgreementsView />;
      case "guarantee":
        return <GuaranteesView />;
      case "pipeline":
        return <PipelineKanban />;
      case "inbox":
        return <UnifiedInbox />;
      case "scoring":
        return <LeadScoreCard data={dashboardLeadScoreDemo} />;
      case "onboarding":
        return <OnboardingView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex w-full">
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

        <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
          {HUB_ORDER.map((hub) => (
            <div key={hub} className="space-y-0.5">
              <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground/90 font-bold">
                {HUB_LABELS[hub]}
              </p>
              {NAV_ITEMS.filter((item) => item.hub === hub).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-primary/10 text-primary font-bold border border-primary/20 shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground font-medium"
                  }`}
                >
                  <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? "text-primary" : "opacity-70"}`} />
                  <span className="text-sm text-right leading-snug">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-border/50 bg-secondary/10">
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary/50 transition-all font-medium"
          >
            <Settings className="w-5 h-5" />
            <span>الإعدادات المتقدمة</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-background/50">
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
            <button type="button" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary border-2 border-background rounded-full animate-pulse" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <button
                type="button"
                onClick={() => auth.logout()}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg border border-border/60"
              >
                <LogOut className="w-3.5 h-3.5" />
                خروج
              </button>
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold truncate max-w-[200px]">{auth.user.email || "مستخدم"}</p>
                <p className="text-xs text-muted-foreground">{auth.user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-primary p-[2px]">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center border-2 border-background">
                  <span className="text-sm font-bold text-foreground">
                    {(auth.user.email || "?").slice(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 w-full max-w-[1600px] mx-auto pb-24 lg:pb-0">{renderContent()}</div>

        <nav className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-card/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl py-3 px-3 z-50 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === item.id ? "text-primary bg-primary/10" : "text-muted-foreground opacity-70"
              }`}
              aria-label={item.label}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] whitespace-nowrap">{item.label}</span>
            </button>
          ))}
          </div>
        </nav>
      </main>
    </div>
  );
}
