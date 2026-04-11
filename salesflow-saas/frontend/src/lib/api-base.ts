/** Base URL for Dealix FastAPI (browser + server). */
export function getApiBaseUrl(): string {
  const fromEnv =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || "";
  return fromEnv.replace(/\/$/, "") || "http://127.0.0.1:8000";
}
