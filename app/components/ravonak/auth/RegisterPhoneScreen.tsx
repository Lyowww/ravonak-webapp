"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthPageShell } from "@/app/components/ravonak/auth/AuthPageShell";
import { useRavonak } from "@/context/RavonakContext";
import { formatUzPhoneDisplay, formatUzPhoneInput, isLikelyUzMobileInput } from "@/lib/phone";

export function RegisterPhoneScreen() {
  const router = useRouter();
  const { authStage, ready, sendSmsCode, tgId, userPhone } = useRavonak();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (authStage === "verified") {
      router.replace("/");
    }
  }, [authStage, ready, router]);

  useEffect(() => {
    if (userPhone) {
      setPhone(formatUzPhoneDisplay(userPhone));
    }
  }, [userPhone]);

  const canSubmit = useMemo(() => !busy && phone.trim().length > 0, [busy, phone]);

  async function submit() {
    if (busy) return;
    if (tgId == null) {
      setError("Откройте мини-приложение в Telegram");
      return;
    }
    if (!isLikelyUzMobileInput(phone)) {
      setError("Не верный формат номера телефона");
      return;
    }

    setBusy(true);
    try {
      const result = await sendSmsCode(phone);
      if (result.ok) {
        router.push("/verify");
        return;
      }
      setError(result.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthPageShell
      actionLabel="Отправить код"
      actionDisabled={!canSubmit}
      actionBusy={busy}
      onAction={submit}
    >
      <div className="max-w-[360px]">
        <h1 className="text-[28px] font-bold leading-[1.05] text-[#0f7c7b]">
          Регистрация
        </h1>
        <p className="mt-3 text-[14px] leading-[1.25] text-[#9d9d9d]">
          Введите номер телефона для регистрации в приложении
        </p>
      </div>

      <div className="mt-14 max-w-[360px]">
        <label className="block">
          <span className="sr-only">Номер телефона</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => {
              setPhone(formatUzPhoneInput(e.target.value));
              setError(null);
            }}
            placeholder="Номер телефона"
            className={`w-full border-b bg-transparent px-4 pb-3 text-[16px] text-[#151515] placeholder:text-[#adadad] focus:outline-none ${
              error ? "border-[#ef4444]" : "border-[#0f7c7b]"
            }`}
          />
        </label>
        {error ? (
          <p className="pt-2 text-[14px] leading-[1.2] text-[#ef4444]">{error}</p>
        ) : null}
      </div>
    </AuthPageShell>
  );
}
