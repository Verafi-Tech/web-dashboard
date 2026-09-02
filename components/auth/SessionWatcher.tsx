"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

/**
 * auth.ts sets session.error when a refresh-token exchange fails (expired,
 * revoked, or the backend session was otherwise invalidated). Auth.js never
 * acts on that by itself — without this watcher the app keeps running with
 * a session that's already dead server-side until an API call happens to
 * 401, which the access token's ~30min lifetime means might never happen
 * before it naturally expires.
 */
export function SessionWatcher() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ redirectTo: "/login" });
    }
  }, [session?.error]);

  return null;
}
