"use client";

import { useEffect, useMemo, useState } from "react";
import { getActiveOrder, type ActiveOrderResponse } from "@/lib/api";
import { formatSum } from "@/lib/format";
import { useRavonak } from "@/context/RavonakContext";
import { useAppSheets } from "@/hooks/useAppSheets";
import { PageHeader } from "@/app/components/ravonak/PageHeader";

type Tab = "active" | "done";

export default function CustomerOrdersPage() {
  const { tgId, authStage } = useRavonak();
  const { openSheet } = useAppSheets();
  const [tab, setTab] = useState<Tab>("active");
  const [active, setActive] = useState<ActiveOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tgId == null || authStage !== "verified") {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await getActiveOrder(tgId);
        if (!cancelled) setActive(r);
      } catch {
        if (!cancelled) setActive(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tgId, authStage]);

  const hasActive = Boolean(
    active?.success && active.order_number && active.status,
  );

  const completedHint = useMemo(
    () =>
      "Список завершённых заказов будет доступен после подключения отдельного API-метода истории.",
    [],
  );

  if (authStage !== "verified" || tgId == null) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white px-4 pt-8">
        <PageHeader title="Заказы" />
        <p className="mt-6 text-[#949494]">Войдите в аккаунт.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader title="Заказы" />
      <div className="px-4 pt-3">
        <div className="mb-4 flex rounded-xl bg-[#eee] p-1">
          <button
            type="button"
            onClick={() => setTab("active")}
            className={`flex-1 rounded-lg py-2 text-[13px] font-medium ${
              tab === "active" ? "bg-white shadow-sm" : "text-[#949494]"
            }`}
          >
            Активные
          </button>
          <button
            type="button"
            onClick={() => setTab("done")}
            className={`flex-1 rounded-lg py-2 text-[13px] font-medium ${
              tab === "done" ? "bg-white shadow-sm" : "text-[#949494]"
            }`}
          >
            Мои заказы
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-[#949494]">Загрузка…</p>
        ) : tab === "active" ? (
          hasActive ? (
            <button
              type="button"
              onClick={() =>
                openSheet("order", { order: active!.order_number! })
              }
              className="w-full rounded-2xl border border-[#046c6d]/30 bg-[#e8f5f5] px-4 py-4 text-left active:opacity-90"
            >
              <p className="text-[16px] font-semibold text-[#151515]">
                Заказ {active!.order_number}
              </p>
              <p className="mt-1 text-[14px] text-[#949494]">
                {active!.status}
              </p>
              {active!.total_sum_uzs != null ? (
                <p className="mt-2 text-[15px] font-medium text-[#046c6d]">
                  {formatSum(active!.total_sum_uzs)} сум
                </p>
              ) : null}
              <p className="mt-2 text-[13px] text-[#046c6d]">Подробнее →</p>
            </button>
          ) : (
            <p className="py-8 text-center text-[14px] text-[#949494]">
              Нет активных заказов
            </p>
          )
        ) : (
          <div className="rounded-xl border border-[#eee] bg-[#fafafa] px-4 py-6 text-center text-[14px] leading-relaxed text-[#949494]">
            {completedHint}
          </div>
        )}
      </div>
    </div>
  );
}
