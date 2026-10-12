"use client";

import { useCallback, useEffect, useState } from "react";
import type { SessionInfo } from "@/lib/types";

const EVENT = "amd:session-changed";

/** Call after login/logout/alert changes so every useSession() refetches. */
export function notifySessionChanged() {
  window.dispatchEvent(new Event(EVENT));
}

export function useSession() {
  const [session, setSession] = useState<SessionInfo | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      setSession(await res.json());
    } catch {
      setSession({ user: null, alertCount: 0 });
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(EVENT, load);
    return () => window.removeEventListener(EVENT, load);
  }, [load]);

  return { session, loading: session === null, reload: load };
}
