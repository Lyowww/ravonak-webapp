"use client";

/** Minimal Telegram WebApp typings for MainButton / BackButton (Mini Apps). */

export type TelegramMainButton = {
  setText: (text: string) => void;
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  showProgress: (leaveActive?: boolean) => void;
  hideProgress: () => void;
  onClick: (fn: () => void) => void;
  offClick: (fn: () => void) => void;
  setParams: (params: { color?: string; text_color?: string }) => void;
};

export type TelegramBackButton = {
  show: () => void;
  hide: () => void;
  onClick: (fn: () => void) => void;
  offClick: (fn: () => void) => void;
};

export type TelegramSettingsButton = {
  show: () => void;
  hide: () => void;
  onClick: (fn: () => void) => void;
  offClick: (fn: () => void) => void;
};

export type TelegramWebAppFull = {
  ready: () => void;
  expand?: () => void;
  MainButton: TelegramMainButton;
  BackButton: TelegramBackButton;
  SettingsButton?: TelegramSettingsButton;
  themeParams?: Record<string, string | undefined>;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  HapticFeedback?: {
    impactOccurred?: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
  };
};

export function getTelegramWebAppFull():
  | (TelegramWebAppFull & { initDataUnsafe?: { user?: { id?: number } } })
  | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window as unknown as { Telegram?: { WebApp?: TelegramWebAppFull } }
  ).Telegram?.WebApp;
}
