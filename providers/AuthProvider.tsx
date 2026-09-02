"use client";

import { SessionProvider } from "next-auth/react";
import { SessionWatcher } from "@/components/auth/SessionWatcher";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionWatcher />
      {children}
    </SessionProvider>
  );
}
