"use client";

import { useEffect } from "react";
import { useRavonak } from "@/context/RavonakContext";

type TgWebApp = {
  ready: () => void;
  expand?: () => void;
  themeParams?: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    secondary_bg_color?: string;
  };
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
};

function getTelegramWebApp(): TgWebApp | undefined {
  return (
    window as unknown as { Telegram?: { WebApp?: TgWebApp } }
  ).Telegram?.WebApp;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready } = useRavonak();

  useEffect(() => {
    const tw = getTelegramWebApp();
    tw?.ready();
    tw?.expand?.();
    const tp = tw?.themeParams;
    const root = document.documentElement;
    if (tp?.bg_color) {
      root.style.setProperty("--tg-theme-bg-color", tp.bg_color);
    }
    if (tp?.text_color) {
      root.style.setProperty("--tg-theme-text-color", tp.text_color);
    }
    if (tp?.hint_color) {
      root.style.setProperty("--tg-theme-hint-color", tp.hint_color);
    }
    if (tp?.link_color) {
      root.style.setProperty("--tg-theme-link-color", tp.link_color);
    }
    if (tp?.secondary_bg_color) {
      root.style.setProperty("--tg-theme-secondary-bg-color", tp.secondary_bg_color);
    }
    tw?.setHeaderColor?.("#ffffff");
    tw?.setBackgroundColor?.("#d1d1d6");
  }, []);

  if (!ready) {
    return (
      <div className="ravonak-app flex min-h-dvh flex-col items-center justify-center bg-[#d1d1d6] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <div className="text-[12px] text-[#949494]">Загрузка…</div>
      </div>
    );
  }

  return (
    <div className="ravonak-app flex min-h-dvh flex-col justify-center bg-[#d1d1d6] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex min-h-0 w-full max-w-[390px] flex-1 flex-col overflow-hidden bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)] sm:my-2 sm:max-h-[min(844px,calc(100dvh-1rem))] sm:rounded-[24px]">
        {children}
      </div>
    </div>
  );
}
