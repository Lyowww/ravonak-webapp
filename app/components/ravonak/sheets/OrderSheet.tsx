"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getCustomerOrderDetails } from "@/lib/api";
import { formatSum } from "@/lib/format";
import { useRavonak } from "@/context/RavonakContext";
import { useAppSheets } from "@/hooks/useAppSheets";
import { figma } from "@/app/components/ravonak/assets";

type Props = { orderNumber: string | null };

export function OrderSheet({ orderNumber }: Props) {
  const { tgId, authStage } = useRavonak();
  const { closeSheet } = useAppSheets();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof getCustomerOrderDetails>> | null>(null);

  useEffect(() => {
    if (!orderNumber || tgId == null || authStage !== "verified") {
      setLoading(false);
      setErr("Нет заказа");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const d = await getCustomerOrderDetails(orderNumber, tgId);
        if (!cancelled) { setData(d); setErr(null); }
      } catch (e) {
        if (!cancelled) { setErr(e instanceof Error ? e.message : "Ошибка загрузки"); setData(null); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orderNumber, tgId, authStage]);

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center sm:justify-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(15,15,15,0.45)] backdrop-blur-[8px]"
        aria-label="Закрыть"
        onClick={closeSheet}
      />
      <div className="relative z-[1] flex max-h-[92dvh] w-full max-w-[390px] flex-col rounded-t-[24px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)] pb-[max(1rem,env(safe-area-inset-bottom))] sm:max-h-[85dvh] sm:rounded-[24px]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#eee] px-5 py-4">
          <h2 className="text-[17px] font-semibold text-[#151515]">
            {orderNumber ? `Ваш заказ №${orderNumber}` : "Заказ"}
          </h2>
          <button
            type="button"
            onClick={closeSheet}
            className="flex size-9 items-center justify-center rounded-full text-[22px] leading-none text-[#949494] active:bg-[#f5f5f5]"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {loading ? (
            <p className="py-8 text-center text-[#949494]">Загрузка…</p>
          ) : err ? (
            <p className="py-8 text-center text-[#c83030]">{err}</p>
          ) : data ? (
            <div className="space-y-4">
              {/* Address */}
              <div className="border-b border-[#eee] pb-3">
                <p className="mb-1 text-[12px] uppercase tracking-wide text-[#949494]">Адрес доставки</p>
                <p className="text-[14px] text-[#151515]">{data.delivery_address}</p>
              </div>

              {/* Recipient */}
              <div className="border-b border-[#eee] pb-3">
                <p className="mb-1 text-[12px] uppercase tracking-wide text-[#949494]">Получатель</p>
                <p className="text-[15px] font-medium text-[#151515]">{data.recipient_name}</p>
                <p className="text-[13px] text-[#949494]">{data.recipient_phone}</p>
              </div>

              {/* Items */}
              <div>
                <p className="mb-3 text-[12px] uppercase tracking-wide text-[#949494]">Товары в заказе</p>
                <ul className="space-y-3">
                  {(data.items ?? []).map((it, idx) => (
                    <li key={`${it.product_id}-${idx}`} className="flex items-center gap-3">
                      <div className="flex size-[48px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#eee]">
                        <Image src={figma.placeholder} alt="" width={32} height={32} unoptimized />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-[#151515]">{it.product_name}</p>
                        <p className="text-[12px] text-[#949494]">{formatSum(it.unit_price_sum)} сум</p>
                      </div>
                      <div className="shrink-0 rounded-xl border border-[#eee] px-3 py-1.5">
                        <span className="text-[13px] font-medium text-[#151515]">
                          {it.unit === "grams" ? `${it.amount}г` : it.amount}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Total */}
              <div className="border-t border-[#eee] pt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[14px] text-[#949494]">Общая стоимость:</span>
                  <span className="text-[18px] font-bold text-[#151515]">
                    {formatSum(data.total_sum_uzs)} сум
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
