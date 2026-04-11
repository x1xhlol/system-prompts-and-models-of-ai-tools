"use client";

type RoiSnapshot = {
  revenue_lift_percent: number;
  win_rate: number;
  pipeline_velocity_days: number;
  manual_work_reduction_percent: number;
  summary: string;
};

export function ExecutiveRoiDashboard({ snapshot }: { snapshot: RoiSnapshot }) {
  return (
    <section className="glass-card p-6 border border-border/40">
      <h2 className="text-xl font-bold mb-4 text-right">Executive ROI Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-right">
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs text-muted-foreground">Revenue Lift</div>
          <div className="text-lg font-bold">{snapshot.revenue_lift_percent}%</div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs text-muted-foreground">Win Rate</div>
          <div className="text-lg font-bold">{snapshot.win_rate}</div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs text-muted-foreground">Velocity (days)</div>
          <div className="text-lg font-bold">{snapshot.pipeline_velocity_days}</div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs text-muted-foreground">Manual Work Reduction</div>
          <div className="text-lg font-bold">{snapshot.manual_work_reduction_percent}%</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-4 text-right">{snapshot.summary}</p>
    </section>
  );
}
