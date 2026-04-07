"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

/** Telegram-like back: prefer history back, fall back to a known route. */
export function useRouterBack(fallbackHref: string) {
  const router = useRouter();
  return useCallback(() => {
    try {
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
        return;
      }
    } catch {
      /* ignore */
    }
    router.push(fallbackHref);
  }, [router, fallbackHref]);
}
