"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRavonak } from "@/context/RavonakContext";
import { PageHeader } from "./PageHeader";
import { useToast } from "./ToastProvider";

export function RegisterScreen() {
  const router = useRouter();
  const { sendSmsCode, tgId } = useRavonak();
  const { showToast } = useToast();
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader backHref="/" />
      <div className="flex flex-1 flex-col px-5 pt-8">
        <h1 className="mb-3 text-[32px] font-bold leading-8 tracking-tight text-[#151515]">
          Регистрация
        </h1>
        <p className="mb-10 max-w-[315px] text-[12px] leading-[1.2] text-[#949494]">
          Введите номер телефона для регистрации в приложении
        </p>
        <div className="mb-auto w-full max-w-[350px] rounded-xl border border-[#eee] bg-[#eee] px-4 py-3">
          <label className="sr-only" htmlFor="phone">
            Номер телефона
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+998 __ ___ __ __"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-transparent text-[16px] font-normal text-[#151515] placeholder:text-[#949494] focus:outline-none"
          />
        </div>
        <div className="sticky bottom-0 bg-white pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6">
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              if (tgId == null) {
                showToast(
                  "Откройте мини-приложение в Telegram или задайте NEXT_PUBLIC_DEV_TG_ID для локальной разработки",
                );
                return;
              }
              if (phone.trim().length < 8) {
                showToast("Введите корректный номер");
                return;
              }
              setBusy(true);
              try {
                const ok = await sendSmsCode(phone.trim());
                if (ok) {
                  showToast("Код отправлен");
                  router.push("/verify");
                } else {
                  showToast("Не удалось отправить код");
                }
              } finally {
                setBusy(false);
              }
            }}
            className="flex h-[60px] w-full max-w-[366px] items-center justify-center rounded-2xl bg-[#046c6d] active:opacity-90 disabled:opacity-50"
          >
            <span className="text-[18px] font-medium text-white">
              Отправить код
            </span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-4 w-full py-2 text-center text-[14px] text-[#949494] underline-offset-2 hover:underline"
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  );
}
