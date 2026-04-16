"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAddress } from "@/lib/api";
import { useRavonak } from "@/context/RavonakContext";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { useToast } from "@/app/components/ravonak/ToastProvider";

const FIELD_CLASS =
  "w-full border-b border-[#eee] py-3 text-[15px] text-[#151515] placeholder:text-[#bbb] focus:outline-none focus:border-[#046c6d] bg-transparent";

export default function NewAddressPage() {
  const router = useRouter();
  const { tgId } = useRavonak();
  const { showToast } = useToast();
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [house, setHouse] = useState("");
  const [entrance, setEntrance] = useState("");
  const [flat, setFlat] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = city.trim().length > 0 && street.trim().length > 0;

  async function save() {
    if (!canSave || tgId == null) return;
    setSaving(true);
    try {
      await createAddress({
        tg_id: tgId,
        city: city.trim(),
        street: street.trim(),
        house: house.trim() || null,
        entrance: entrance.trim() || null,
        flat: flat.trim() || null,
        comment: comment.trim() || null,
        is_default: true,
      });
      router.back();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Ошибка сохранения");
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader title="Адрес доставки (НОВЫЙ)" showLogo={false} />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Город" className={FIELD_CLASS} />
        <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Улица" className={FIELD_CLASS} />
        <input value={house} onChange={(e) => setHouse(e.target.value)} placeholder="Дом" className={FIELD_CLASS} />
        <input value={entrance} onChange={(e) => setEntrance(e.target.value)} placeholder="Подъезд" className={FIELD_CLASS} />
        <input value={flat} onChange={(e) => setFlat(e.target.value)} placeholder="Квартира" className={FIELD_CLASS} />
        <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Есть ли домофон ?" className={FIELD_CLASS} />

        <div className="mt-5">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#046c6d] py-4 text-[15px] font-medium text-white active:opacity-90"
            onClick={() => {/* map placeholder */}}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white" />
            </svg>
            Уточнить на карте
          </button>
        </div>
      </div>

      <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          disabled={!canSave || saving}
          onClick={() => void save()}
          className="w-full rounded-2xl bg-[#046c6d] py-4 text-[16px] font-medium text-white disabled:opacity-40 active:opacity-90"
        >
          {saving ? "Сохранение…" : "Добавить"}
        </button>
      </div>
    </div>
  );
}
