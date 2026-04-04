import { getApiBaseUrl } from "@/lib/api-base";
import { clearSession, getAccessToken, getRefreshToken, persistSession, getStoredUser } from "@/lib/auth-storage";

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  user_id: string;
  tenant_id: string;
  role: string;
};

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  const rt = getRefreshToken();
  if (!rt) return false;
  refreshPromise = (async () => {
    try {
      const base = getApiBaseUrl();
      const r = await fetch(`${base}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (!r.ok) {
        clearSession();
        return false;
      }
      const data = (await r.json()) as TokenResponse;
      const prev = getStoredUser();
      persistSession(data.access_token, data.refresh_token, {
        userId: data.user_id,
        tenantId: data.tenant_id,
        role: data.role,
        email: prev?.email,
      });
      return true;
    } catch {
      clearSession();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

/**
 * Fetch against Dealix API. Sends Bearer when a token exists.
 * On 401, attempts one refresh then retries the request once.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const base = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  let res = await fetch(url, { ...init, headers });
  if (res.status === 401 && getRefreshToken()) {
    const ok = await tryRefresh();
    if (ok) {
      const t2 = getAccessToken();
      const h2 = new Headers(init.headers);
      if (t2) h2.set("Authorization", `Bearer ${t2}`);
      res = await fetch(url, { ...init, headers: h2 });
    }
  }
  return res;
}

export async function loginRequest(email: string, password: string): Promise<TokenResponse> {
  const base = getApiBaseUrl();
  const r = await fetch(`${base}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || `Login failed (${r.status})`);
  }
  return r.json() as Promise<TokenResponse>;
}

export async function registerRequest(body: {
  company_name: string;
  company_name_ar?: string;
  industry?: string;
  full_name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<TokenResponse> {
  const base = getApiBaseUrl();
  const r = await fetch(`${base}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || `Register failed (${r.status})`);
  }
  return r.json() as Promise<TokenResponse>;
}
