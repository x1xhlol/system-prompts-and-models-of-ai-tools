"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/auth-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
