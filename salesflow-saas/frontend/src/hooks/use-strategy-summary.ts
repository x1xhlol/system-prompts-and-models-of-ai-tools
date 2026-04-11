"use client";

import { useEffect, useState } from "react";
import type { StrategySummary } from "@/lib/strategy-summary";
import { fetchStrategySummary } from "@/lib/strategy-summary";
import { STRATEGY_SUMMARY_FALLBACK } from "@/lib/strategy-fallback";

export type StrategySummarySource = "live" | "embedded";

export function useStrategySummary() {
  const [data, setData] = useState<StrategySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<StrategySummarySource>("embedded");

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    fetchStrategySummary(ac.signal)
      .then((d) => {
        if (ac.signal.aborted) return;
        if (d) {
          setData(d);
          setSource("live");
        } else {
          setData(STRATEGY_SUMMARY_FALLBACK);
          setSource("embedded");
        }
      })
      .catch(() => {
        if (ac.signal.aborted) return;
        setData(STRATEGY_SUMMARY_FALLBACK);
        setSource("embedded");
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    return () => ac.abort();
  }, []);

  return { data, loading, source };
}
