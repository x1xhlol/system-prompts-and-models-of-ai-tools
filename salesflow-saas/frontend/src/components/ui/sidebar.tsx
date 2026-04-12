'use client';

import { useState, createContext, useContext, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Users, MessageSquare, TrendingUp,
  Brain, Bot, Sparkles, Settings, ChevronLeft, ChevronRight,
  X, Menu, Phone, BarChart3, Shield,
} from 'lucide-react';

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

interface NavItem {
  label: string;
  icon: ReactNode;
  href: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: 'الرئيسية',
    items: [
      { label: 'لوحة التحكم', icon: <LayoutDashboard className="h-5 w-5" />, href: '/dashboard' },
      { label: 'التحليلات', icon: <BarChart3 className="h-5 w-5" />, href: '/analytics' },
    ],
  },
  {
    title: 'إدارة العملاء',
    items: [
      { label: 'العملاء المحتملين', icon: <Users className="h-5 w-5" />, href: '/leads', badge: '12' },
      { label: 'الصفقات', icon: <TrendingUp className="h-5 w-5" />, href: '/deals' },
      { label: 'المحادثات', icon: <MessageSquare className="h-5 w-5" />, href: '/conversations', badge: '3' },
      { label: 'المكالمات', icon: <Phone className="h-5 w-5" />, href: '/calls' },
    ],
  },
  {
    title: 'الذكاء الاصطناعي',
    items: [
      { label: 'مساعد الذكاء', icon: <Brain className="h-5 w-5" />, href: '/ai-assistant' },
      { label: 'الأتمتة', icon: <Bot className="h-5 w-5" />, href: '/automation' },
      { label: 'التوصيات', icon: <Sparkles className="h-5 w-5" />, href: '/recommendations' },
    ],
  },
  {
    title: 'الإعدادات',
    items: [
      { label: 'الإعدادات', icon: <Settings className="h-5 w-5" />, href: '/settings' },
      { label: 'الخصوصية', icon: <Shield className="h-5 w-5" />, href: '/privacy' },
    ],
  },
];

function SidebarItem({ item, collapsed, active }: { item: NavItem; collapsed: boolean; active: boolean }) {
  return (
    <a
      href={item.href}
      className={clsx(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        'hover:bg-white/10',
        active
          ? 'bg-teal-500/15 text-teal-400 shadow-[inset_0_0_12px_rgba(20,184,166,0.1)]'
          : 'text-slate-400 hover:text-white',
        collapsed && 'justify-center px-2',
      )}
    >
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-xs text-teal-400">
              {item.badge}
            </span>
          )}
        </>
      )}
    </a>
  );
}

function SidebarContent({ collapsed, activePath }: { collapsed: boolean; activePath: string }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      {navigation.map((section) => (
        <div key={section.title}>
          {!collapsed && (
            <p className="mb-2 ps-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {section.title}
            </p>
          )}
          <div className="space-y-1">
            {section.items.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                collapsed={collapsed}
                active={activePath === item.href}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

interface SidebarProps {
  activePath?: string;
  children?: ReactNode;
}

function Sidebar({ activePath = '/dashboard', children }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{ collapsed, toggle: () => setCollapsed((v) => !v), mobileOpen, setMobileOpen }}
    >
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <motion.aside
          animate={{ width: collapsed ? 72 : 280 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className={clsx(
            'hidden lg:flex flex-col fixed end-0 top-0 bottom-0 z-40',
            'bg-slate-900/80 backdrop-blur-xl border-s border-white/10',
          )}
        >
          <div className={clsx('flex items-center border-b border-white/10 h-16', collapsed ? 'justify-center px-2' : 'justify-between px-4')}>
            {!collapsed && <span className="text-lg font-bold text-teal-400">Dealix</span>}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
            >
              {collapsed ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          </div>
          <SidebarContent collapsed={collapsed} activePath={activePath} />
        </motion.aside>

        {/* Mobile trigger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 end-4 z-50 lg:hidden rounded-lg bg-slate-800/90 backdrop-blur p-2.5 text-white border border-white/10"
          aria-label="فتح القائمة"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="fixed end-0 top-0 bottom-0 z-50 w-72 bg-slate-900/95 backdrop-blur-xl border-s border-white/10 lg:hidden"
              >
                <div className="flex items-center justify-between border-b border-white/10 h-16 px-4">
                  <span className="text-lg font-bold text-teal-400">Dealix</span>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="إغلاق القائمة"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <SidebarContent collapsed={false} activePath={activePath} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content area */}
        <motion.main
          animate={{ marginInlineEnd: collapsed ? 72 : 280 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="flex-1 lg:me-0"
        >
          {children}
        </motion.main>
      </div>
    </SidebarContext.Provider>
  );
}

export { Sidebar };
export type { SidebarProps, NavItem, NavSection };
