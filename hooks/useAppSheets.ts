"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type SheetId =
  | "auth-phone"
  | "auth-sms"
  | "cart"
  | "order"
  | "checkout";

export function useAppSheets() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const sheet = sp.get("sheet") as SheetId | null;
  const orderNumber = sp.get("order");

  const openSheet = useCallback(
    (id: SheetId, extra?: { order?: string }) => {
      const p = new URLSearchParams(sp.toString());
      p.set("sheet", id);
      if (extra?.order) p.set("order", extra.order);
      else p.delete("order");
      const q = p.toString();
      router.push(q ? `${pathname}?${q}` : `${pathname}?sheet=${id}`, {
        scroll: false,
      });
    },
    [pathname, router, sp],
  );

  const replaceSheet = useCallback(
    (id: SheetId, extra?: { order?: string }) => {
      const p = new URLSearchParams(sp.toString());
      p.set("sheet", id);
      if (extra?.order) p.set("order", extra.order);
      else p.delete("order");
      const q = p.toString();
      router.replace(q ? `${pathname}?${q}` : `${pathname}?sheet=${id}`, {
        scroll: false,
      });
    },
    [pathname, router, sp],
  );

  const closeSheet = useCallback(() => {
    const p = new URLSearchParams(sp.toString());
    p.delete("sheet");
    p.delete("order");
    const q = p.toString();
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [pathname, router, sp]);

  const isOpen = useMemo(() => Boolean(sheet), [sheet]);

  return {
    sheet,
    orderNumber,
    openSheet,
    replaceSheet,
    closeSheet,
    isOpen,
  };
}
