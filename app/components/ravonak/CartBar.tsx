"use client";

import { formatSum } from "@/lib/format";
import { useRavonak } from "@/context/RavonakContext";
import { useAppSheets } from "@/hooks/useAppSheets";
import { useRouter } from "next/navigation";

export function CartBar({ backHref = "/" }: { backHref?: string }) {
  const { cart, cartTotalSum } = useRavonak();
  const { openSheet } = useAppSheets();
  const router = useRouter();

  if (cart.length === 0) return null;

  return (
    <div
      className="sticky bottom-0 z-20 cursor-pointer select-none pb-[max(0px,env(safe-area-inset-bottom))]"
      onClick={() => router.push("/market/cart")}
    >
      <div className="flex items-stretch bg-[#046c6d]">
        <div className="flex flex-1 items-center justify-center border-r border-white/20 py-3.5">
          <span className="text-[13px] font-medium text-white">30-59 мин</span>
        </div>
        <div className="flex flex-1 items-center justify-center border-r border-white/20 py-3.5">
          <span className="text-[15px] font-semibold text-white">Корзина</span>
        </div>
        <div className="flex flex-1 items-center justify-center py-3.5">
          <span className="text-[13px] font-medium text-white">
            {formatSum(cartTotalSum)} сум
          </span>
        </div>
      </div>
    </div>
  );
}
