"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { transferHistory } from "@/lib/api";
import type { TransferHistoryItem } from "@/lib/api";
import { useRavonak } from "@/context/RavonakContext";
import { PageHeader } from "@/app/components/ravonak/PageHeader";

export default function TransferHistoryPage() {
  const { tgId, authStage } = useRavonak();
  const [items, setItems] = useState<TransferHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tgId == null || authStage !== "verified") {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await transferHistory(tgId);
        if (cancelled) return;
        setItems(r.items ?? []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tgId, authStage]);

  if (authStage !== "verified" || tgId == null) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white px-4 pt-8">
        <PageHeader backHref="/transfer" title="История переводов" />
        <p className="mt-6 text-[#949494]">Войдите в аккаунт.</p>
        <Link href="/register" className="mt-4 text-[#046c6d] underline">
          Регистрация
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader backHref="/transfer" title="История переводов" />
      {loading ? (
        <p className="px-4 py-8 text-center text-[#949494]">Загрузка…</p>
      ) : (
        <ul className="divide-y divide-[#eee] px-4">
          {items.map((t) => (
            <li key={t.id} className="flex items-start justify-between py-4">
              <div>
                <p className="text-[14px] font-medium text-[#151515]">
                  {t.type === "send" ? "Исходящий" : "Входящий"}
                </p>
                <p className="text-[13px] text-[#949494]">{t.partner_phone}</p>
                <p className="text-[12px] text-[#949494]">{t.partner_name}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-[#949494]">{t.date}</p>
                <p
                  className={`text-[15px] font-semibold ${
                    t.type === "send" ? "text-[#c83030]" : "text-[#046c6d]"
                  }`}
                >
                  {t.type === "send" ? "-" : "+"} {t.amount} $
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!loading && items.length === 0 ? (
        <p className="py-12 text-center text-[#949494]">Пока нет операций</p>
      ) : null}
    </div>
  );
}
