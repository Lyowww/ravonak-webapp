"use client";

import { useEffect, useMemo, useState } from "react";
import {
  courierActiveOrders,
  courierMyOrders,
  staffCourierAccept,
  staffDeliverToClient,
  type StaffOrderListItem,
} from "@/lib/api";
import { useRavonak } from "@/context/RavonakContext";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { useToast } from "@/app/components/ravonak/ToastProvider";

type Tab = "mine" | "active";

export default function CourierPage() {
  const { userName, tgId, authStage } = useRavonak();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("mine");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [activeList, setActiveList] = useState<StaffOrderListItem[]>([]);
  const [mineList, setMineList] = useState<StaffOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    if (tgId == null) return;
    const [a, m] = await Promise.all([
      courierActiveOrders(tgId),
      courierMyOrders(tgId),
    ]);
    setActiveList(a.items ?? []);
    setMineList(m.items ?? []);
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

  const mine = useMemo(() => mineList, [mineList]);
  const active = useMemo(() => activeList, [activeList]);

  if (authStage !== "verified" || tgId == null) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white px-4 pt-8">
        <PageHeader backHref="/" title="Курьер" />
        <p className="mt-6 text-[#949494]">Войдите в аккаунт.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader backHref="/" title="Курьер" />
      <div className="px-4 pt-3">
        <p className="mb-4 text-[18px] font-medium text-[#151515]">
          Здравствуйте {userName || "курьер"}
        </p>
        <div className="mb-4 flex rounded-xl bg-[#eee] p-1">
          <button
            type="button"
            onClick={() => setTab("mine")}
            className={`flex-1 rounded-lg py-2 text-[13px] font-medium ${
              tab === "mine" ? "bg-white shadow-sm" : "text-[#949494]"
            }`}
          >
            Мои заказы
          </button>
          <button
            type="button"
            onClick={() => setTab("active")}
            className={`flex-1 rounded-lg py-2 text-[13px] font-medium ${
              tab === "active" ? "bg-white shadow-sm" : "text-[#949494]"
            }`}
          >
            Активные заказы
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-[#949494]">Загрузка…</p>
        ) : null}

        {tab === "mine" && mine.length === 0 && !loading ? (
          <div className="flex gap-3 rounded-xl bg-[#f5f5f5] p-4">
            <span className="text-[32px] leading-none">!</span>
            <p className="text-[14px] leading-snug text-[#151515]">
              Примите заказ из вкладки активных заказов и начните работать.
            </p>
          </div>
        ) : null}

        {(tab === "mine" ? mine : active).map((o) => (
          <div
            key={o.order_number}
            className="mb-4 overflow-hidden rounded-2xl border border-[#eee] bg-white"
          >
            <div className="flex items-center justify-between border-b border-[#eee] px-4 py-3">
              <span className="text-[16px] font-semibold">Заказ {o.order_number}</span>
              <span className="text-[#949494]">›</span>
            </div>
            <div className="space-y-3 px-4 py-3 text-[14px]">
              <div>
                <p className="text-[12px] text-[#949494]">Получатель</p>
                <p className="font-medium text-[#151515]">{o.recipient_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#949494]">Номер телефона</p>
                <p className="font-medium text-[#151515]">{o.recipient_phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#949494]">Адрес доставки</p>
                <p className="leading-snug text-[#151515]">{o.delivery_address ?? "—"}</p>
              </div>
            </div>
            {tab === "active" ? (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await staffCourierAccept(o.order_number, tgId);
                    showToast("Заказ принят");
                    await reload();
                  } catch (e) {
                    showToast(e instanceof Error ? e.message : "Ошибка");
                  }
                }}
                className="w-full border-t border-[#eee] py-3 text-[15px] font-medium text-[#046c6d]"
              >
                Принять заказ
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmId(o.order_number)}
                className="w-full border-t border-[#eee] py-3 text-[15px] font-medium text-[#046c6d]"
              >
                Заказ передан клиенту
              </button>
            )}
          </div>
        ))}

        {tab === "active" && active.length === 0 && !loading ? (
          <p className="py-8 text-center text-[#949494]">Нет активных заказов</p>
        ) : null}
      </div>

      {confirmId ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-[390px] rounded-2xl bg-white p-5 shadow-xl">
            <p className="mb-6 text-center text-[17px] font-medium leading-snug">
              Вы действительно отдали заказ клиенту?
            </p>
            <button
              type="button"
              onClick={async () => {
                try {
                  await staffDeliverToClient(confirmId, tgId, true);
                  setConfirmId(null);
                  showToast("Заказ доставлен");
                  await reload();
                } catch (e) {
                  showToast(e instanceof Error ? e.message : "Ошибка");
                }
              }}
              className="mb-3 w-full rounded-xl bg-[#046c6d] py-3 text-[16px] font-medium text-white"
            >
              Заказ передан
            </button>
            <button
              type="button"
              onClick={() => setConfirmId(null)}
              className="w-full rounded-xl border border-[#eee] py-3 text-[16px]"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
