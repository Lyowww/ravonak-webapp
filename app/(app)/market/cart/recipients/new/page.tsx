"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRecipient } from "@/lib/api";
import { useRavonak } from "@/context/RavonakContext";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { useToast } from "@/app/components/ravonak/ToastProvider";

const FIELD_CLASS =
  "w-full border-b border-[#eee] py-3 text-[15px] text-[#151515] placeholder:text-[#bbb] focus:outline-none focus:border-[#046c6d] bg-transparent";

export default function NewRecipientPage() {
  const router = useRouter();
  const { tgId } = useRavonak();
  const { showToast } = useToast();
  const [surname, setSurname] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = name.trim().length > 0 && phone.trim().length > 0;

  async function save() {
    if (!canSave || tgId == null) return;
    setSaving(true);
    try {
      await createRecipient({
        tg_id: tgId,
        name: `${surname.trim()} ${name.trim()}`.trim(),
        surname: surname.trim() || null,
        phone: phone.trim(),
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
      <PageHeader title="Получатель (НОВЫЙ)" showLogo={false} />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Фамилия" className={FIELD_CLASS} />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" className={FIELD_CLASS} />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Номер телефона"
          type="tel"
          inputMode="tel"
          className={FIELD_CLASS}
        />
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
