"use client";

import { useEffect, useState } from "react";
import { getCustomerOrderDetails } from "@/lib/api";
import { formatSum } from "@/lib/format";
import { useRavonak } from "@/context/RavonakContext";
import { useAppSheets } from "@/hooks/useAppSheets";
import { SheetModal } from "@/app/components/ravonak/SheetModal";

type Props = {
  orderNumber: string | null;
};

export function OrderSheet({ orderNumber }: Props) {
  const { tgId, authStage } = useRavonak();
  const { closeSheet } = useAppSheets();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getCustomerOrderDetails>
  > | null>(null);

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
        if (!cancelled) {
          setData(d);
          setErr(null);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Ошибка загрузки");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderNumber, tgId, authStage]);

  if (!orderNumber) {
    return (
      <SheetModal title="Заказ" onClose={closeSheet}>
        <p className="py-6 text-center text-[#949494]">Не указан номер заказа</p>
      </SheetModal>
    );
  }

  if (authStage !== "verified" || tgId == null) {
    return (
      <SheetModal title="Заказ" onClose={closeSheet}>
        <p className="py-6 text-center text-[#949494]">Войдите в аккаунт</p>
      </SheetModal>
    );
  }

  return (
    <SheetModal title={`Заказ ${orderNumber}`} onClose={closeSheet}>
      {loading ? (
        <p className="py-8 text-center text-[#949494]">Загрузка…</p>
      ) : err ? (
        <p className="py-8 text-center text-[#c83030]">{err}</p>
      ) : data ? (
        <div className="space-y-4 pb-4">
          <p className="text-[14px] text-[#949494]">Статус: {data.status}</p>
          <div>
            <p className="text-[12px] text-[#949494]">Адрес</p>
            <p className="text-[15px] text-[#151515]">{data.delivery_address}</p>
          </div>
          <div>
            <p className="text-[12px] text-[#949494]">Получатель</p>
            <p className="text-[15px] text-[#151515]">{data.recipient_name}</p>
            <p className="text-[14px] text-[#949494]">{data.recipient_phone}</p>
          </div>
          <p className="text-[16px] font-bold">
            {formatSum(data.total_sum_uzs)} сум
          </p>
          <ul className="space-y-2 border-t border-[#eee] pt-3">
            {data.items.map((it, idx) => (
              <li
                key={`${it.product_id}-${idx}`}
                className="flex justify-between gap-2 text-[14px]"
              >
                <span className="min-w-0 flex-1">{it.product_name}</span>
                <span className="shrink-0 text-[#949494]">
                  ×{it.amount} · {formatSum(it.unit_price_sum)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </SheetModal>
  );
}
