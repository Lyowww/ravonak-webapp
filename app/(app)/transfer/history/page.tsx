"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { transferHistory, type TransferHistoryItem } from "@/lib/api";
import { useRavonak } from "@/context/RavonakContext";

export default function TransferHistoryPage() {
  const router = useRouter();
  const { tgId, authStage } = useRavonak();
  const [items, setItems] = useState<TransferHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tgId == null || authStage !== "verified") { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const r = await transferHistory(tgId);
        if (!cancelled) setItems(r.items ?? []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tgId, authStage]);

  return (
    <div className="fixed inset-0 z-[200] flex items-end" onClick={() => router.back()}>
      <div
        className="relative w-full rounded-t-[24px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)]"
        style={{ maxHeight: "80dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#eee] px-5 py-4">
          <h2 className="text-[17px] font-semibold text-[#151515]">История переводов</h2>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-8 items-center justify-center rounded-full text-[22px] leading-none text-[#949494] active:bg-[#f5f5f5]"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: "calc(80dvh - 61px)" }}>
          {loading ? (
            <p className="py-8 text-center text-[#949494]">Загрузка…</p>
          ) : items.length === 0 ? (
            <p className="py-12 text-center text-[14px] text-[#949494]">Пока нет операций</p>
          ) : (
            <ul className="divide-y divide-[#eee]">
              {items.map((t) => (
                <li key={t.id} className="flex items-start justify-between px-5 py-4">
                  <div>
                    <p className="text-[14px] font-medium text-[#151515]">
                      {t.type === "send" ? "Перевод" : "Начисление"}
                    </p>
                    <p className="text-[13px] text-[#949494]">{t.partner_phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-[#949494]">{t.date}</p>
                    <p className={`text-[15px] font-semibold ${t.type === "send" ? "text-[#c83030]" : "text-[#046c6d]"}`}>
                      {t.type === "send" ? "- " : "+ "}{t.amount.toLocaleString("ru-RU")} $
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
