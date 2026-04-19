"use client";

export type TelegramUserMini = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

export function getTelegramWebAppUser(): TelegramUserMini | null {
  if (typeof window === "undefined") return null;
  const u = (
    window as unknown as {
      Telegram?: { WebApp?: { initDataUnsafe?: { user?: TelegramUserMini } } };
    }
  ).Telegram?.WebApp?.initDataUnsafe?.user;
  if (!u?.id) return null;
  return {
    id: u.id,
    first_name: u.first_name,
    last_name: u.last_name,
    username: u.username,
  };
}

export function resolveTgId(): number | null {
  const fromTg = getTelegramWebAppUser()?.id;
  if (fromTg != null) return fromTg;
  const dev = process.env.NEXT_PUBLIC_DEV_TG_ID;
  if (!dev) return null;
  const n = parseInt(dev, 10);
  return Number.isFinite(n) ? n : null;
}

/** When true, the app treats you as signed in on local dev so you can skip /register. */
export function shouldSkipRegisterForLocalDev(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === "false") return false;
  if (process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === "true") return true;
  return (
    process.env.NODE_ENV === "development" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  );
}
