"use client";

import { useMemo, useState } from "react";
import { useRavonak } from "@/context/RavonakContext";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { useToast } from "@/app/components/ravonak/ToastProvider";

type Tab = "mine" | "active";

export default function CourierPage() {
  const { orders, acceptOrder, deliverOrder } = useRavonak();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("mine");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const mine = useMemo(
    () => orders.filter((o) => o.status === "courier_assigned"),
    [orders],
  );
  const active = useMemo(
    () => orders.filter((o) => o.status === "picking"),
    [orders],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader backHref="/" title="Курьер" />
      <div className="px-4 pt-3">
        <p className="mb-4 text-[18px] font-medium text-[#151515]">
          Здравствуйте Azizjon
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

        {tab === "mine" && mine.length === 0 ? (
          <div className="flex gap-3 rounded-xl bg-[#f5f5f5] p-4">
            <span className="text-[32px] leading-none">!</span>
            <p className="text-[14px] leading-snug text-[#151515]">
              Примите заказ из вкладки активных заказов и начните работать !
            </p>
          </div>
        ) : null}

        {(tab === "mine" ? mine : active).map((o) => (
          <div
            key={o.id}
            className="mb-4 overflow-hidden rounded-2xl border border-[#eee] bg-white"
          >
            <div className="flex items-center justify-between border-b border-[#eee] px-4 py-3">
              <span className="text-[16px] font-semibold">Заказ №{o.id}</span>
              <span className="text-[#949494]">›</span>
            </div>
            <div className="space-y-3 px-4 py-3 text-[14px]">
              <div>
                <p className="text-[12px] text-[#949494]">Получатель</p>
                <p className="font-medium text-[#151515]">{o.recipient}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#949494]">Номер телефона</p>
                <p className="font-medium text-[#151515]">{o.phone}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#949494]">Адрес доставки</p>
                <p className="leading-snug text-[#151515]">{o.address}</p>
              </div>
            </div>
            {tab === "active" ? (
              <button
                type="button"
                onClick={() => {
                  acceptOrder(o.id);
                  showToast("Заказ принят");
                }}
                className="w-full border-t border-[#eee] py-3 text-[15px] font-medium text-[#046c6d]"
              >
                Принять заказ
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmId(o.id)}
                className="w-full border-t border-[#eee] py-3 text-[15px] font-medium text-[#046c6d]"
              >
                Заказ передан клиенту
              </button>
            )}
          </div>
        ))}

        {tab === "active" && active.length === 0 ? (
          <p className="py-8 text-center text-[#949494]">Нет активных заказов</p>
        ) : null}
      </div>

      {confirmId ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-[390px] rounded-2xl bg-white p-5 shadow-xl">
            <p className="mb-6 text-center text-[17px] font-medium leading-snug">
              Вы действительно отдали заказ клиенту ?
            </p>
            <button
              type="button"
              onClick={() => {
                deliverOrder(confirmId);
                setConfirmId(null);
                showToast("Заказ доставлен");
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
