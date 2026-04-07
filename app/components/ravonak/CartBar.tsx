"use client";

import { formatSum } from "@/lib/format";
import { useRavonak } from "@/context/RavonakContext";
import { useAppSheets } from "@/hooks/useAppSheets";

export function CartBar({ backHref = "/" }: { backHref?: string }) {
  const { cart, cartTotalSum } = useRavonak();
  const { openSheet } = useAppSheets();
  if (cart.length === 0) return null;

  const count = cart.reduce((a, l) => a + l.qty, 0);

  return (
    <div className="sticky bottom-0 z-20 border-t border-[#ddd] bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <a
          href={backHref}
          className="text-[14px] text-[#046c6d] active:opacity-70"
        >
          ←
        </a>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-[#949494]">{count} товар(ов)</p>
          <p className="text-[16px] font-bold text-[#151515]">
            {formatSum(cartTotalSum)} сум
          </p>
        </div>
        <button
          type="button"
          onClick={() => openSheet("cart")}
          className="rounded-xl bg-[#046c6d] px-5 py-3 text-[14px] font-medium text-white active:opacity-90"
        >
          Корзина
        </button>
      </div>
    </div>
  );
}
