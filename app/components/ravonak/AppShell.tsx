"use client";

import { Suspense, useEffect } from "react";
import { useRavonak } from "@/context/RavonakContext";
import { ModalLayer } from "@/app/components/ravonak/ModalLayer";
import { TelegramChromeSync } from "@/app/components/ravonak/TelegramChromeSync";
import { TelegramSafeAreaSync } from "@/app/components/ravonak/TelegramSafeAreaSync";

type TgWebApp = {
  ready: () => void;
  expand?: () => void;
  disableVerticalSwipes?: () => void;
  isExpanded?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;
  themeParams?: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    secondary_bg_color?: string;
  };
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  enableClosingConfirmation?: () => void;
};

function getTelegramWebApp(): TgWebApp | undefined {
  return (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready } = useRavonak();

  useEffect(() => {
    const tw = getTelegramWebApp();
    if (!tw) return;

    tw.ready();
    tw.expand?.();
    tw.disableVerticalSwipes?.();

    const tp = tw.themeParams;
    const root = document.documentElement;

    if (tp?.bg_color) root.style.setProperty("--tg-theme-bg-color", tp.bg_color);
    if (tp?.text_color) root.style.setProperty("--tg-theme-text-color", tp.text_color);
    if (tp?.hint_color) root.style.setProperty("--tg-theme-hint-color", tp.hint_color);
    if (tp?.link_color) root.style.setProperty("--tg-theme-link-color", tp.link_color);
    if (tp?.secondary_bg_color) root.style.setProperty("--tg-theme-secondary-bg-color", tp.secondary_bg_color);

    tw.setHeaderColor?.("#ffffff");
    tw.setBackgroundColor?.("#ffffff");
  }, []);

  const safeTop =
    "pt-[max(env(safe-area-inset-top,0px),var(--ravonak-tg-safe-top,0px))]";

  if (!ready) {
    return (
      <>
        <TelegramSafeAreaSync />
        <div
          className={`ravonak-app flex min-h-dvh flex-col items-center justify-center bg-white ${safeTop}`}
        >
          <div className="text-[14px] text-[#949494]">Загрузка…</div>
        </div>
      </>
    );
  }

  return (
    <>
      <TelegramSafeAreaSync />
      <div
        className={`ravonak-app relative flex min-h-dvh flex-col bg-white ${safeTop}`}
      >
        <div className="relative z-[1] mx-auto flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-white sm:my-0 sm:max-w-[min(100%,520px)] md:my-2 md:max-h-[min(900px,calc(100dvh-1rem))] md:max-w-[min(100%,560px)] md:rounded-[24px] md:shadow-[0_0_0_1px_rgba(0,0,0,0.06)] lg:max-w-[min(100%,640px)]">
          {children}
        </div>
        <ModalLayer />
        <Suspense fallback={null}>
          <TelegramChromeSync />
        </Suspense>
      </div>
    </>
  );
}
