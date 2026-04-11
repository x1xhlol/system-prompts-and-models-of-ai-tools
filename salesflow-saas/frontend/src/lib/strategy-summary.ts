import { getApiBaseUrl } from "./api-base";

export type AuditableTarget = {
  id: string;
  label_ar: string;
  target: string;
  unit: string;
};

export type DesignPrinciple = {
  id: string;
  title_ar: string;
  summary: string;
};

export type StrategySummary = {
  product: string;
  blueprint_version: string;
  positioning: string;
  vision: { tagline_ar: string; tagline_en: string };
  moat_pillars: string[];
  competitive_moat: Record<string, string>;
  auditable_targets: AuditableTarget[];
  design_principles: DesignPrinciple[];
  phases: Array<{ id: number; name: string; horizon_days?: number; horizon_months?: string }>;
  execution_phases_detail: Array<{
    id: number;
    name_ar: string;
    window: string;
    deliverables: string[];
  }>;
  kpis: Array<{ axis: string; metric: string }>;
  doc_paths: Record<string, string>;
  repo_paths: Record<string, string>;
  market_frame?: string;
};

export async function fetchStrategySummary(signal?: AbortSignal): Promise<StrategySummary | null> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/v1/strategy/summary`, {
      signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as StrategySummary;
  } catch {
    return null;
  }
}
