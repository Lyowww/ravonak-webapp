"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getTelegramWebAppFull } from "@/lib/telegram-webapp";
import { useAppSheets } from "@/hooks/useAppSheets";

/**
 * Syncs Telegram Mini App BackButton with sheet / in-app overlays.
 * MainButton is configured per-sheet in sheet components.
 */
export function TelegramChromeSync() {
  const { sheet, closeSheet, replaceSheet, isOpen } = useAppSheets();
  const pathname = usePathname();

  useEffect(() => {
    const tw = getTelegramWebAppFull();
    const BB = tw?.BackButton;
    if (!BB) return;

    const onBack = () => {
      if (sheet === "auth-sms") {
        replaceSheet("auth-phone");
        return;
      }
      if (sheet === "checkout") {
        replaceSheet("cart");
        return;
      }
      closeSheet();
    };

    if (isOpen) {
      BB.show();
      BB.onClick(onBack);
    } else {
      BB.offClick(onBack);
      BB.hide();
    }

    return () => {
      BB.offClick(onBack);
      BB.hide();
    };
  }, [isOpen, closeSheet, replaceSheet, sheet, pathname]);

  return null;
}
