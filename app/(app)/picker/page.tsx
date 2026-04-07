"use client";

import Image from "next/image";
import { useMemo } from "react";
import { formatSum } from "@/lib/format";
import { useRavonak } from "@/context/RavonakContext";
import { figma } from "@/app/components/ravonak/assets";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export default function PickerPage() {
  const { orders, pickerCompleteOrder } = useRavonak();
  const { showToast } = useToast();

  const order = useMemo(
    () => orders.find((o) => o.status === "new"),
    [orders],
  );

  const lines =
    order?.lines?.length && order.lines.length > 0
      ? order.lines
      : [
          {
            productId: "p1",
            title: "Сыр President рассольный Greco",
            priceSum: 41_990,
            weight: "250г",
            qty: 1,
          },
          {
            productId: "p1",
            title: "Сыр President рассольный Greco рассольный Greco",
            priceSum: 41_990,
            weight: "250г",
            qty: 5,
          },
        ];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white pb-24">
      <PageHeader backHref="/" title="Сборщик" />
      {!order ? (
        <p className="px-4 py-12 text-center text-[#949494]">
          Нет заказов на сборку
        </p>
      ) : (
        <>
          <div className="border-b border-[#eee] px-4 py-4">
            <h2 className="text-[18px] font-semibold">Заказ №{order.id}</h2>
            <div className="mt-4 space-y-3 text-[14px]">
              <div>
                <p className="text-[12px] text-[#949494]">Получатель</p>
                <p className="font-medium">{order.recipient}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#949494]">Номер телефона</p>
                <p className="font-medium">{order.phone}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#949494]">Кол-во товаров</p>
                <p className="font-medium">{order.itemsCount} позиций</p>
              </div>
              <div>
                <p className="text-[12px] text-[#949494]">Сумма заказа</p>
                <p className="font-medium">{formatSum(order.totalSum)} UZS</p>
              </div>
            </div>
          </div>
          <div className="px-4 py-4">
            <h3 className="mb-3 text-[16px] font-semibold">Товары в заказе</h3>
            <ul className="space-y-3">
              {lines.map((line, i) => (
                <li
                  key={i}
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
                      {line.title}
                    </p>
                    <p className="mt-1 text-[13px] text-[#949494]">
                      {formatSum(line.priceSum)} сум · {line.weight}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#eee] px-4 py-2 text-[14px] font-medium">
                    {line.qty}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="fixed bottom-0 left-1/2 w-full max-w-[390px] -translate-x-1/2 border-t border-[#eee] bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
            <button
              type="button"
              onClick={() => {
                pickerCompleteOrder(order.id);
                showToast("Заказ собран — передан курьеру");
              }}
              className="w-full rounded-xl bg-[#046c6d] py-3 text-[16px] font-medium text-white active:opacity-90"
            >
              Заказ собран
            </button>
          </div>
        </>
      )}
    </div>
  );
}
