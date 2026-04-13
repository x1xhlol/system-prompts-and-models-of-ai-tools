"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";

type GatePayload = {
  launch_allowed?: boolean;
  readiness_percent_total?: number;
  blocked_reasons?: string[];
};

export function GoLiveReadinessCard() {
  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    data: GatePayload | null;
  }>({ loading: true, error: null, data: null });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const r = await apiFetch("/api/v1/autonomous-foundation/integrations/go-live-gate", {
          cache: "no-store",
        });
        const json = await r.json();
        if (!active) return;
        setState({ loading: false, error: null, data: json });
      } catch (err) {
        if (!active) return;
        setState({
          loading: false,
          error: err instanceof Error ? err.message : "failed_to_load",
          data: null,
        });
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  if (state.loading) {
    return <div className="glass-card p-6">جارٍ تحميل حالة الإطلاق…</div>;
  }
  if (state.error) {
    return <div className="glass-card p-6 text-destructive">تعذر جلب go-live-gate: {state.error}</div>;
  }
  const ok = Boolean(state.data?.launch_allowed);
  const reasons = (state.data?.blocked_reasons || []).slice(0, 5);
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">جاهزية الإطلاق التجاري</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${ok ? "bg-green-500/20 text-green-300" : "bg-amber-500/20 text-amber-300"}`}>
          {ok ? "جاهز للإطلاق" : "يحتاج استكمال"}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        readiness_percent_total: {state.data?.readiness_percent_total ?? "-"}%
      </p>
      {!ok && reasons.length > 0 && (
        <ul className="list-disc pr-5 text-sm space-y-1 text-muted-foreground">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

