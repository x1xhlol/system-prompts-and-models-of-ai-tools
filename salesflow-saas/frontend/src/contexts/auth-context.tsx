"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  clearSession,
  getAccessToken,
  getStoredUser,
  persistSession,
  type StoredUser,
} from "@/lib/auth-storage";
import { loginRequest, registerRequest } from "@/lib/api-client";

type AuthContextValue = {
  user: StoredUser | null;
  loading: boolean;
  login: (email: string, password: string, redirectTo?: string | null) => Promise<void>;
  register: (data: {
    company_name: string;
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    industry?: string;
    company_name_ar?: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = getAccessToken();
    const u = getStoredUser();
    if (t && u) setUser(u);
    else setUser(null);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string, redirectTo?: string | null) => {
    const data = await loginRequest(email, password);
    const nextUser: StoredUser = {
      userId: data.user_id,
      tenantId: data.tenant_id,
      role: data.role,
      email,
    };
    persistSession(data.access_token, data.refresh_token, nextUser);
    setUser(nextUser);
    const dest = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard";
    router.replace(dest);
  }, [router]);

  const register = useCallback(
    async (body: {
      company_name: string;
      full_name: string;
      email: string;
      password: string;
      phone?: string;
      industry?: string;
      company_name_ar?: string;
    }) => {
      const data = await registerRequest(body);
      const next: StoredUser = {
        userId: data.user_id,
        tenantId: data.tenant_id,
        role: data.role,
        email: body.email,
      };
      persistSession(data.access_token, data.refresh_token, next);
      setUser(next);
      router.replace("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Call from dashboard subtree to enforce login (client-side). */
export function useRequireAuth(): AuthContextValue {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (auth.loading) return;
    if (!getAccessToken()) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      const target = `/login${next}`;
      router.replace(target);
      // Fallback for environments where app-router navigation is delayed.
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.replace(target);
      }
    }
  }, [auth.loading, router, pathname]);

  return auth;
}
