"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getTelegramWebAppFull } from "@/lib/telegram-webapp";
import { useAppSheets } from "@/hooks/useAppSheets";

/** Pages that are considered "root" — BackButton should be hidden on them. */
const ROOT_PATHS = new Set(["/", "/market"]);

/**
 * Drives Telegram native chrome (BackButton, SettingsButton) for the whole app.
 *
 * Rules:
 *  - BackButton is VISIBLE whenever:
 *      a) a sheet/modal is open, OR
 *      b) the current pathname is not a root path
 *  - BackButton tap:
 *      a) if a sheet is open → close/step-back in the sheet flow
 *      b) otherwise → router.back()
 *  - SettingsButton is shown on root pages as the "⋮" action; hidden elsewhere.
 */
export function TelegramChromeSync() {
  const { sheet, closeSheet, replaceSheet, isOpen } = useAppSheets();
  const pathname = usePathname();
  const router = useRouter();

  // Keep a stable ref so the onClick handler always sees fresh values.
  const stateRef = useRef({ sheet, isOpen, pathname });
  stateRef.current = { sheet, isOpen, pathname };

  useEffect(() => {
    const tw = getTelegramWebAppFull();
    const BB = tw?.BackButton;
    const SB = tw?.SettingsButton;
    if (!BB) return;

    const isRootPage = ROOT_PATHS.has(pathname);
    const shouldShowBack = isOpen || !isRootPage;

    function onBack() {
      const { sheet: s, isOpen: o } = stateRef.current;
      if (o) {
        if (s === "auth-sms") { replaceSheet("auth-phone"); return; }
        if (s === "checkout") { replaceSheet("cart"); return; }
        closeSheet();
        return;
      }
      router.back();
    }

    function onSettings() {
      // SettingsButton tap — placeholder: navigate to a settings page when it exists.
    }

    if (shouldShowBack) {
      BB.show();
      BB.onClick(onBack);
      SB?.hide();
    } else {
      BB.hide();
      BB.offClick(onBack);
      // Show SettingsButton on root pages as the header "⋮" action.
      SB?.show();
      SB?.onClick(onSettings);
    }

    return () => {
      BB.offClick(onBack);
      BB.hide();
      SB?.offClick(onSettings);
      SB?.hide();
    };
  }, [isOpen, sheet, pathname, closeSheet, replaceSheet, router]);

  return null;
}
