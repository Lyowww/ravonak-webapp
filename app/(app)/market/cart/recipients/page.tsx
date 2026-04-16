"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getRecipients, selectRecipientDefault, type RecipientResponse } from "@/lib/api";
import { useRavonak } from "@/context/RavonakContext";
import { PageHeader } from "@/app/components/ravonak/PageHeader";

export default function RecipientsPage() {
  const router = useRouter();
  const { tgId, authStage } = useRavonak();
  const [recipients, setRecipients] = useState<RecipientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<number | null>(null);

  useEffect(() => {
    if (tgId == null || authStage !== "verified") { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const list = await getRecipients(tgId);
        if (!cancelled) setRecipients(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tgId, authStage]);

  async function select(id: number) {
    if (tgId == null) return;
    setSelecting(id);
    try {
      await selectRecipientDefault(id, tgId);
      router.back();
    } catch {
      setSelecting(null);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader title="Получатель" showLogo={false} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <p className="py-8 text-center text-[#949494]">Загрузка…</p>
        ) : (
          <ul className="divide-y divide-[#eee]">
            {recipients.map((rec) => (
              <li key={rec.id}>
                <button
                  type="button"
                  disabled={selecting != null}
                  onClick={() => void select(rec.id)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-[#f5f5f5]"
                >
                  <div
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      rec.is_default ? "border-[#046c6d] bg-[#046c6d]" : "border-[#ccc]"
                    }`}
                  >
                    {rec.is_default ? <div className="size-2 rounded-full bg-white" /> : null}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[#151515]">{rec.name}</p>
                    <p className="text-[13px] text-[#949494]">{rec.phone}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={() => router.push("/market/cart/recipients/new")}
          className="w-full rounded-2xl bg-[#046c6d] py-4 text-[16px] font-medium text-white active:opacity-90"
        >
          Добавить нового получателя
        </button>
      </div>
    </div>
  );
}
