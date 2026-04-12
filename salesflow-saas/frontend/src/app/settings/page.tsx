'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TabId = 'account' | 'company' | 'team' | 'billing' | 'integrations' | 'notifications';

interface Tab {
  id: TabId;
  labelAr: string;
  labelEn: string;
  icon: ReactNode;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'agent';
  avatar?: string;
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const tabs: Tab[] = [
  { id: 'account', labelAr: 'الحساب', labelEn: 'Account', icon: <UserIcon /> },
  { id: 'company', labelAr: 'الشركة', labelEn: 'Company', icon: <BuildingIcon /> },
  { id: 'team', labelAr: 'الفريق', labelEn: 'Team', icon: <UsersIcon /> },
  { id: 'billing', labelAr: 'الفوترة', labelEn: 'Billing', icon: <CreditCardIcon /> },
  { id: 'integrations', labelAr: 'التكاملات', labelEn: 'Integrations', icon: <PuzzleIcon /> },
  { id: 'notifications', labelAr: 'الإشعارات', labelEn: 'Notifications', icon: <BellIcon /> },
];

const mockTeam: TeamMember[] = [
  { id: '1', name: 'أحمد الغامدي', email: 'ahmed@dealix.sa', role: 'owner' },
  { id: '2', name: 'سارة العتيبي', email: 'sara@dealix.sa', role: 'manager' },
  { id: '3', name: 'خالد المالكي', email: 'khaled@dealix.sa', role: 'agent' },
];

const roleLabels: Record<string, { ar: string; en: string; color: string }> = {
  owner: { ar: 'مالك', en: 'Owner', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  manager: { ar: 'مدير', en: 'Manager', color: 'text-primary bg-primary/10 border-primary/30' },
  agent: { ar: 'وكيل', en: 'Agent', color: 'text-slate-300 bg-white/5 border-white/10' },
};

const notificationEvents = [
  { id: 'new_lead', labelAr: 'عميل محتمل جديد', labelEn: 'New Lead' },
  { id: 'deal_won', labelAr: 'صفقة مكسوبة', labelEn: 'Deal Won' },
  { id: 'deal_lost', labelAr: 'صفقة خاسرة', labelEn: 'Deal Lost' },
  { id: 'message', labelAr: 'رسالة جديدة', labelEn: 'New Message' },
  { id: 'task_due', labelAr: 'مهمة مستحقة', labelEn: 'Task Due' },
  { id: 'approval', labelAr: 'طلب موافقة', labelEn: 'Approval Request' },
];

const channels = ['email', 'whatsapp', 'sms', 'push'] as const;

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const { isArabic } = useI18n();
  const [activeTab, setActiveTab] = useState<TabId>('account');

  const label = (ar: string, en: string) => (isArabic ? ar : en);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">
          {label('الإعدادات', 'Settings')}
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tab nav -- right side in RTL */}
          <nav className="lg:w-56 shrink-0 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
              >
                <span className="w-5 h-5 shrink-0">{tab.icon}</span>
                {label(tab.labelAr, tab.labelEn)}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'account' && <AccountTab label={label} />}
                {activeTab === 'company' && <CompanyTab label={label} />}
                {activeTab === 'team' && <TeamTab label={label} />}
                {activeTab === 'billing' && <BillingTab label={label} />}
                {activeTab === 'integrations' && <IntegrationsTab label={label} />}
                {activeTab === 'notifications' && <NotificationsTab label={label} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared                                                              */
/* ------------------------------------------------------------------ */

type L = (ar: string, en: string) => string;

function Section({ title, children, onSave, label }: { title: string; children: ReactNode; onSave?: () => void; label: L }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-5">{title}</h2>
      <div className="space-y-4">{children}</div>
      {onSave && (
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onSave}
            className="px-6 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 hover:border-primary/50 text-sm font-semibold transition-all duration-200"
          >
            {label('حفظ التغييرات', 'Save Changes')}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label: fieldLabel, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-1.5">{fieldLabel}</label>
      {children}
    </div>
  );
}

function TextInput({ placeholder, defaultValue, dir }: { placeholder?: string; defaultValue?: string; dir?: string }) {
  return (
    <input
      type="text"
      defaultValue={defaultValue}
      placeholder={placeholder}
      dir={dir}
      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
    />
  );
}

function SelectInput({ options, defaultValue }: { options: { value: string; label: string }[]; defaultValue?: string }) {
  return (
    <select
      defaultValue={defaultValue}
      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all appearance-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>
      ))}
    </select>
  );
}

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${on ? 'bg-primary' : 'bg-white/10'}`}
    >
      <span className={`absolute top-0.5 start-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-5 rtl:-translate-x-5' : ''}`} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Tabs                                                                */
/* ------------------------------------------------------------------ */

function AccountTab({ label }: { label: L }) {
  return (
    <Section title={label('معلومات الحساب', 'Account Information')} onSave={() => {}} label={label}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={label('الاسم الكامل', 'Full Name')}>
          <TextInput defaultValue="أحمد الغامدي" />
        </Field>
        <Field label={label('البريد الإلكتروني', 'Email')}>
          <TextInput defaultValue="ahmed@company.sa" dir="ltr" />
        </Field>
        <Field label={label('رقم الجوال', 'Phone')}>
          <TextInput defaultValue="+966 50 123 4567" dir="ltr" />
        </Field>
        <Field label={label('اللغة المفضلة', 'Language')}>
          <SelectInput
            defaultValue="ar"
            options={[
              { value: 'ar', label: label('العربية', 'Arabic') },
              { value: 'en', label: label('الإنجليزية', 'English') },
            ]}
          />
        </Field>
        <Field label={label('المنطقة الزمنية', 'Timezone')}>
          <SelectInput
            defaultValue="Asia/Riyadh"
            options={[
              { value: 'Asia/Riyadh', label: '(UTC+3) Riyadh' },
              { value: 'Asia/Dubai', label: '(UTC+4) Dubai' },
              { value: 'Asia/Kuwait', label: '(UTC+3) Kuwait' },
            ]}
          />
        </Field>
      </div>
    </Section>
  );
}

function CompanyTab({ label }: { label: L }) {
  return (
    <Section title={label('معلومات الشركة', 'Company Information')} onSave={() => {}} label={label}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={label('اسم الشركة (عربي)', 'Company Name (Arabic)')}>
          <TextInput defaultValue="شركة البناء المتقدم" />
        </Field>
        <Field label={label('اسم الشركة (إنجليزي)', 'Company Name (English)')}>
          <TextInput defaultValue="Advanced Construction Co." dir="ltr" />
        </Field>
        <Field label={label('المجال', 'Industry')}>
          <SelectInput
            defaultValue="construction"
            options={[
              { value: 'real_estate', label: label('عقارات', 'Real Estate') },
              { value: 'construction', label: label('مقاولات', 'Construction') },
              { value: 'automotive', label: label('سيارات', 'Automotive') },
              { value: 'healthcare', label: label('رعاية صحية', 'Healthcare') },
              { value: 'technology', label: label('تقنية', 'Technology') },
              { value: 'services', label: label('خدمات', 'Services') },
              { value: 'other', label: label('أخرى', 'Other') },
            ]}
          />
        </Field>
        <Field label={label('رقم السجل التجاري', 'CR Number')}>
          <TextInput defaultValue="1010XXXXXX" dir="ltr" />
        </Field>
      </div>
      {/* Logo upload placeholder */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-400 mb-1.5">
          {label('شعار الشركة', 'Company Logo')}
        </label>
        <div className="flex items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-xs text-slate-500">{label('اسحب الملف أو اضغط للرفع', 'Drag & drop or click to upload')}</span>
          </div>
        </div>
      </div>
    </Section>
  );
}

function TeamTab({ label }: { label: L }) {
  return (
    <>
      <Section title={label('أعضاء الفريق', 'Team Members')} label={label}>
        <div className="space-y-3">
          {mockTeam.map((m) => {
            const rl = roleLabels[m.role];
            return (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{m.name}</p>
                    <p className="text-xs text-slate-500" dir="ltr">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {m.role === 'owner' ? (
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${rl.color}`}>
                      {label(rl.ar, rl.en)}
                    </span>
                  ) : (
                    <select
                      defaultValue={m.role}
                      className={`text-xs font-semibold px-3 py-1 rounded-full border bg-transparent appearance-none cursor-pointer focus:outline-none ${rl.color}`}
                    >
                      <option value="manager" className="bg-slate-900">{label('مدير', 'Manager')}</option>
                      <option value="agent" className="bg-slate-900">{label('وكيل', 'Agent')}</option>
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <button className="mt-4 w-full py-2.5 rounded-xl border border-dashed border-white/10 hover:border-primary/30 text-sm text-slate-400 hover:text-primary transition-all">
          + {label('دعوة عضو جديد', 'Invite Team Member')}
        </button>
      </Section>
    </>
  );
}

function BillingTab({ label }: { label: L }) {
  return (
    <>
      {/* Current Plan */}
      <Section title={label('الباقة الحالية', 'Current Plan')} label={label}>
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-bl from-primary/10 via-transparent to-transparent border border-primary/20">
          <div>
            <p className="text-lg font-bold text-white">{label('الباقة الاحترافية', 'Professional Plan')}</p>
            <p className="text-sm text-slate-400">{label('١٤٩ ر.س / شهرياً', 'SAR 149 / month')}</p>
          </div>
          <button className="px-5 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-sm font-semibold transition-all">
            {label('ترقية', 'Upgrade')}
          </button>
        </div>
      </Section>

      {/* Payment method */}
      <Section title={label('طريقة الدفع', 'Payment Method')} label={label}>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="w-12 h-8 rounded bg-white/10 flex items-center justify-center text-xs text-slate-400 font-bold">VISA</div>
          <div>
            <p className="text-sm text-white" dir="ltr">**** **** **** 4242</p>
            <p className="text-xs text-slate-500">{label('تنتهي ١٢/٢٧', 'Expires 12/27')}</p>
          </div>
        </div>
      </Section>

      {/* Invoice history */}
      <Section title={label('سجل الفواتير', 'Invoice History')} label={label}>
        <div className="space-y-2">
          {[
            { date: '2026-03-01', amount: '149', status: 'paid' },
            { date: '2026-02-01', amount: '149', status: 'paid' },
            { date: '2026-01-01', amount: '149', status: 'paid' },
          ].map((inv, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-sm text-slate-400" dir="ltr">{inv.date}</span>
              <span className="text-sm text-white">{inv.amount} {label('ر.س', 'SAR')}</span>
              <span className="text-xs text-emerald-400">{label('مدفوعة', 'Paid')}</span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function IntegrationsTab({ label }: { label: L }) {
  const integrations = [
    { name: 'WhatsApp', icon: '💬', connected: true, descAr: 'متصل — رقم +966 50 XXX XXXX', descEn: 'Connected — +966 50 XXX XXXX' },
    { name: label('البريد SMTP', 'Email SMTP'), icon: '📧', connected: false, descAr: 'غير متصل', descEn: 'Not connected' },
  ];

  return (
    <>
      <Section title={label('التكاملات', 'Integrations')} label={label}>
        <div className="space-y-3">
          {integrations.map((intg, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{intg.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white">{intg.name}</p>
                  <p className="text-xs text-slate-500">{label(intg.descAr, intg.descEn)}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${intg.connected ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' : 'text-slate-400 bg-white/5 border-white/10'}`}>
                {intg.connected ? label('متصل', 'Connected') : label('غير متصل', 'Disconnected')}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* API Key */}
      <Section title={label('مفتاح API', 'API Key')} label={label}>
        <div className="flex items-center gap-3">
          <input
            type="text"
            readOnly
            value="dlx_live_sk_••••••••••••••••••••"
            dir="ltr"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-mono"
          />
          <button className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-slate-300 transition-all">
            {label('نسخ', 'Copy')}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {label('لا تشارك مفتاح API مع أي شخص. يمكنك إعادة توليده من هنا.', 'Never share your API key. You can regenerate it here.')}
        </p>
      </Section>
    </>
  );
}

function NotificationsTab({ label }: { label: L }) {
  return (
    <Section title={label('تفضيلات الإشعارات', 'Notification Preferences')} onSave={() => {}} label={label}>
      {/* Channel headers */}
      <div className="hidden sm:grid grid-cols-[1fr_repeat(4,_60px)] gap-2 mb-2 text-center">
        <span />
        {channels.map((ch) => (
          <span key={ch} className="text-xs text-slate-500 capitalize">{ch}</span>
        ))}
      </div>
      <div className="space-y-3">
        {notificationEvents.map((evt) => (
          <div key={evt.id} className="grid grid-cols-1 sm:grid-cols-[1fr_repeat(4,_60px)] gap-2 items-center p-3 rounded-xl bg-white/[0.02]">
            <span className="text-sm text-white">{label(evt.labelAr, evt.labelEn)}</span>
            {channels.map((ch) => (
              <div key={ch} className="flex items-center justify-center sm:justify-center gap-2">
                <span className="text-xs text-slate-500 sm:hidden capitalize">{ch}</span>
                <Toggle defaultChecked={ch === 'email' || ch === 'push'} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons                                                               */
/* ------------------------------------------------------------------ */

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  );
}

function PuzzleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.421 48.421 0 01-4.185-.069c-.547-.036-1.058.36-1.058.91v0c0 .381.208.716.432.957.227.246.432.574.432.965 0 1.036-1.007 1.875-2.25 1.875S1.5 10.536 1.5 9.5c0-.39.205-.719.432-.965.224-.241.432-.576.432-.957v0c0-.55-.511-.946-1.058-.91C.766 6.7.166 6.723 0 6.723v0c0 1.036 1.007 1.875 2.25 1.875S4.5 7.76 4.5 6.723" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}
