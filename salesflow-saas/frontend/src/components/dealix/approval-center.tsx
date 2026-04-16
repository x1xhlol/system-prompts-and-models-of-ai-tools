"use client";

import { useState } from "react";

type Approval = {
  id: string; channel: string; resource_type: string;
  status: string; priority: string; category: string;
  sla_deadline_at?: string; escalation_level: number;
  note?: string; requested_by?: string; created_at?: string;
};

function SlaTimer({ deadline }: { deadline?: string }) {
  if (!deadline) return <span className="text-xs text-muted-foreground">—</span>;
  const remaining = new Date(deadline).getTime() - Date.now();
  const hours = Math.max(0, Math.floor(remaining / 3600000));
  const color = hours <= 1 ? "text-red-500" : hours <= 4 ? "text-yellow-500" : "text-emerald-500";
  return <span className={`text-sm font-bold ${color}`}>{hours}h</span>;
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-500",
  high: "bg-orange-500/20 text-orange-500",
  normal: "bg-blue-500/20 text-blue-500",
  low: "bg-gray-500/20 text-gray-400",
};

export function ApprovalCenter({ approvals = [] }: { approvals?: Approval[] }) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? approvals : approvals.filter((a) => a.category === filter);
  const categories = ["all", ...new Set(approvals.map((a) => a.category))];

  const stats = {
    pending: approvals.filter((a) => a.status === "pending").length,
    warning: approvals.filter((a) => a.escalation_level === 1).length,
    breach: approvals.filter((a) => a.escalation_level >= 2).length,
  };

  return (
    <div className="space-y-4 p-6" dir="rtl">
      <h2 className="text-xl font-bold text-right">مركز الموافقات | Approval Center</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 border border-border/40 text-center">
          <div className="text-xs text-muted-foreground">معلقة</div>
          <div className="text-xl font-bold">{stats.pending}</div>
        </div>
        <div className="glass-card p-3 border border-border/40 text-center">
          <div className="text-xs text-muted-foreground">تحذير SLA</div>
          <div className="text-xl font-bold text-yellow-500">{stats.warning}</div>
        </div>
        <div className="glass-card p-3 border border-border/40 text-center">
          <div className="text-xs text-muted-foreground">خرق SLA</div>
          <div className="text-xl font-bold text-red-500">{stats.breach}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs px-3 py-1 rounded-full border ${filter === cat ? "bg-primary text-primary-foreground" : "border-border/40"}`}
          >
            {cat === "all" ? "الكل" : cat}
          </button>
        ))}
      </div>

      {/* Approval Queue */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">لا توجد موافقات معلقة</p>
        )}
        {filtered.map((approval) => (
          <div key={approval.id} className="glass-card p-4 border border-border/40">
            <div className="flex justify-between items-start">
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1 rounded bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30">موافقة</button>
                <button className="text-xs px-3 py-1 rounded bg-red-500/20 text-red-500 hover:bg-red-500/30">رفض</button>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <SlaTimer deadline={approval.sla_deadline_at} />
                  <span className={`text-xs px-2 py-0.5 rounded ${PRIORITY_COLORS[approval.priority] || ""}`}>
                    {approval.priority}
                  </span>
                </div>
                <p className="text-sm font-medium mt-1">{approval.resource_type}</p>
                <p className="text-xs text-muted-foreground">{approval.channel} — {approval.category}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
