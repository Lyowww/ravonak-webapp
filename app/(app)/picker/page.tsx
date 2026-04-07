"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  assemblerActiveOrders,
  staffAssembleOrder,
  staffOrderDetails,
  staffStartAssembly,
  type StaffOrderDetailsResponse,
  type StaffOrderListItem,
} from "@/lib/api";
import { formatSum } from "@/lib/format";
import { useRavonak } from "@/context/RavonakContext";
import { figma } from "@/app/components/ravonak/assets";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export default function PickerPage() {
  const { tgId, authStage } = useRavonak();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<StaffOrderListItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<StaffOrderDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function reload() {
    if (tgId == null) return;
    const r = await assemblerActiveOrders(tgId);
    setOrders(r.items ?? []);
  }

  useEffect(() => {
    if (tgId == null || authStage !== "verified") {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await reload();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tgId, authStage]);

  useEffect(() => {
    if (orders.length > 0 && !selected) {
      setSelected(orders[0]!.order_number);
    }
  }, [orders, selected]);

  useEffect(() => {
    if (tgId == null || !selected) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const d = await staffOrderDetails(selected, tgId);
        if (!cancelled) setDetail(d);
      } catch {
        if (!cancelled) setDetail(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tgId, selected]);

  const order = orders.find((o) => o.order_number === selected) ?? orders[0];
  const lines = detail?.items ?? [];

  if (authStage !== "verified" || tgId == null) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white px-4 pt-8">
        <PageHeader backHref="/" title="Сборщик" />
        <p className="mt-6 text-[#949494]">Войдите в аккаунт.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white pb-24">
      <PageHeader backHref="/" title="Сборщик" />
      {loading ? (
        <p className="px-4 py-12 text-center text-[#949494]">Загрузка…</p>
      ) : orders.length > 1 ? (
        <div className="border-b border-[#eee] px-4 py-2">
          <label className="text-[12px] text-[#949494]">Заказ</label>
          <select
            className="mt-1 w-full rounded-xl border border-[#eee] bg-white px-3 py-2 text-[14px]"
            value={selected ?? ""}
            onChange={(e) => setSelected(e.target.value || null)}
          >
            {orders.map((o) => (
              <option key={o.order_number} value={o.order_number}>
                {o.order_number} · {o.status}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {!loading && !order ? (
        <p className="px-4 py-12 text-center text-[#949494]">
          Нет заказов на сборку
        </p>
      ) : null}
      {order ? (
        <>
          <div className="border-b border-[#eee] px-4 py-4">
            <h2 className="text-[18px] font-semibold">Заказ {order.order_number}</h2>
            <div className="mt-4 space-y-3 text-[14px]">
              <div>
                <p className="text-[12px] text-[#949494]">Получатель</p>
                <p className="font-medium">{order.recipient_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#949494]">Номер телефона</p>
                <p className="font-medium">{order.recipient_phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#949494]">Кол-во товаров</p>
                <p className="font-medium">{order.item_count} позиций</p>
              </div>
              <div>
                <p className="text-[12px] text-[#949494]">Сумма заказа</p>
                <p className="font-medium">{formatSum(order.total_sum_uzs)} UZS</p>
              </div>
            </div>
          </div>
          <div className="px-4 py-4">
            <h3 className="mb-3 text-[16px] font-semibold">Товары в заказе</h3>
            <ul className="space-y-3">
              {lines.map((line, i) => (
                <li
                  key={`${line.product_id}-${i}`}
                  className="flex items-center gap-3 border-b border-[#f0f0f0] pb-3"
                >
                  <div className="relative size-[60px] shrink-0 overflow-hidden rounded-lg bg-[#eee]">
                    <Image
                      src={figma.product}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="60px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium leading-tight">
                      {line.product_name}
                    </p>
                    <p className="mt-1 text-[13px] text-[#949494]">
                      {formatSum(line.unit_price_sum)} сум · {line.unit}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#eee] px-4 py-2 text-[14px] font-medium">
                    {line.amount}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="fixed bottom-0 left-1/2 w-full max-w-[390px] -translate-x-1/2 border-t border-[#eee] bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
            {order.status === "pending" ? (
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  if (!tgId) return;
                  setBusy(true);
                  try {
                    await staffStartAssembly(order.order_number, tgId);
                    showToast("Сборка начата");
                    await reload();
                  } catch (e) {
                    showToast(e instanceof Error ? e.message : "Ошибка");
                  } finally {
                    setBusy(false);
                  }
                }}
                className="w-full rounded-xl bg-[#046c6d] py-3 text-[16px] font-medium text-white active:opacity-90 disabled:opacity-50"
              >
                Начать сборку
              </button>
            ) : order.status === "assembling" ? (
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  if (!tgId) return;
                  setBusy(true);
                  try {
                    await staffAssembleOrder(order.order_number, tgId, true);
                    showToast("Заказ собран");
                    await reload();
                    setSelected(null);
                  } catch (e) {
                    showToast(e instanceof Error ? e.message : "Ошибка");
                  } finally {
                    setBusy(false);
                  }
                }}
                className="w-full rounded-xl bg-[#046c6d] py-3 text-[16px] font-medium text-white active:opacity-90 disabled:opacity-50"
              >
                Заказ собран
              </button>
            ) : (
              <p className="py-2 text-center text-[14px] text-[#949494]">
                Статус: {order.status}
              </p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
