"use client";

import { useEffect } from "react";
import {
  getTelegramWebAppFull,
  type TelegramWebAppFull,
} from "@/lib/telegram-webapp";

function applySafeTop(
  tw: TelegramWebAppFull,
  root: HTMLElement,
) {
  const safe = tw.safeAreaInset;
  const content = tw.contentSafeAreaInset;
  const top = Math.max(safe?.top ?? 0, content?.top ?? 0);
  root.style.setProperty("--ravonak-tg-safe-top", `${top}px`);
}

/**
 * Pushes Telegram Mini App safe-area values into CSS variables so layout stays
 * below the client header / system insets (env() alone is often 0 in TWA).
 */
export function TelegramSafeAreaSync() {
  useEffect(() => {
    const tg = getTelegramWebAppFull();
    if (!tg) return;
    const webApp = tg;

    const root = document.documentElement;

    function apply() {
      applySafeTop(webApp, root);
    }

    apply();

    const onChange = () => apply();
    tg.onEvent?.("viewportChanged", onChange);
    tg.onEvent?.("safeAreaChanged", apply);
    tg.onEvent?.("contentSafeAreaChanged", apply);

    return () => {
      tg.offEvent?.("viewportChanged", onChange);
      tg.offEvent?.("safeAreaChanged", apply);
      tg.offEvent?.("contentSafeAreaChanged", apply);
      root.style.removeProperty("--ravonak-tg-safe-top");
    };
  }, []);

  return null;
}
