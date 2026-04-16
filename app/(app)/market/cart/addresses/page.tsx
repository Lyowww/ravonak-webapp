"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAddresses, selectAddressDefault, type AddressResponse } from "@/lib/api";
import { useRavonak } from "@/context/RavonakContext";
import { PageHeader } from "@/app/components/ravonak/PageHeader";

export default function AddressesPage() {
  const router = useRouter();
  const { tgId, authStage } = useRavonak();
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<number | null>(null);

  useEffect(() => {
    if (tgId == null || authStage !== "verified") { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const list = await getAddresses(tgId);
        if (!cancelled) setAddresses(list);
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
      await selectAddressDefault(id, tgId);
      router.back();
    } catch {
      setSelecting(null);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader title="Адрес доставки" showLogo={false} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <p className="py-8 text-center text-[#949494]">Загрузка…</p>
        ) : (
          <ul className="divide-y divide-[#eee]">
            {addresses.map((addr) => (
              <li key={addr.id}>
                <button
                  type="button"
                  disabled={selecting != null}
                  onClick={() => void select(addr.id)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-[#f5f5f5]"
                >
                  <div
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      addr.is_default ? "border-[#046c6d] bg-[#046c6d]" : "border-[#ccc]"
                    }`}
                  >
                    {addr.is_default ? (
                      <div className="size-2 rounded-full bg-white" />
                    ) : null}
                  </div>
                  <p className="text-[14px] text-[#151515]">{addr.full_text}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={() => router.push("/market/cart/addresses/new")}
          className="w-full rounded-2xl bg-[#046c6d] py-4 text-[16px] font-medium text-white active:opacity-90"
        >
          Добавить новый адрес
        </button>
      </div>
    </div>
  );
}
