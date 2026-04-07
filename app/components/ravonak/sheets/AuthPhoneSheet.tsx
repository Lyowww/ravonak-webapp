"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRavonak } from "@/context/RavonakContext";
import { formatUzPhoneDisplay, isLikelyUzMobileInput } from "@/lib/phone";
import { useAppSheets } from "@/hooks/useAppSheets";
import { useTelegramMainButton } from "@/hooks/useTelegramMainButton";
import { SheetModal } from "@/app/components/ravonak/SheetModal";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export function AuthPhoneSheet() {
  const { sendSmsCode, tgId, authStage, userPhone } = useRavonak();
  const { closeSheet, replaceSheet } = useAppSheets();
  const { showToast } = useToast();
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const syncedFromContext = useRef(false);

  useEffect(() => {
    if (authStage === "verified") closeSheet();
  }, [authStage, closeSheet]);

  useEffect(() => {
    if (userPhone && !syncedFromContext.current) {
      setPhone(formatUzPhoneDisplay(userPhone));
      syncedFromContext.current = true;
    }
  }, [userPhone]);

  const canSubmit =
    !busy && isLikelyUzMobileInput(phone) && tgId != null;

  const submit = useCallback(async () => {
    if (tgId == null) {
      showToast(
        "Откройте мини-приложение в Telegram или задайте NEXT_PUBLIC_DEV_TG_ID",
      );
      return;
    }
    if (!isLikelyUzMobileInput(phone)) {
      showToast("Введите номер телефона");
      return;
    }
    setBusy(true);
    try {
      const ok = await sendSmsCode(phone.trim());
      if (ok) {
        showToast("Код отправлен");
        replaceSheet("auth-sms");
      } else {
        showToast("Не удалось отправить код");
      }
    } finally {
      setBusy(false);
    }
  }, [tgId, phone, sendSmsCode, showToast, replaceSheet]);

  useTelegramMainButton(canSubmit, "Отправить код", busy, submit);

  return (
    <SheetModal title="Регистрация" onClose={closeSheet}>
      <p className="mb-6 max-w-[315px] text-[12px] leading-[1.2] text-[#949494]">
        Введите номер телефона для регистрации в приложении
      </p>
      <div className="mb-8 w-full rounded-xl border border-[#eee] bg-[#eee] px-4 py-3">
        <label className="sr-only" htmlFor="sheet-phone">
          Номер телефона
        </label>
        <input
          id="sheet-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+998 __ ___ __ __"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-transparent text-[16px] font-normal text-[#151515] placeholder:text-[#949494] focus:outline-none"
        />
      </div>
      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => void submit()}
        className="mb-4 flex h-[52px] w-full items-center justify-center rounded-2xl bg-[#046c6d] text-[16px] font-medium text-white active:opacity-90 disabled:opacity-40"
      >
        Отправить код
      </button>
      <button
        type="button"
        onClick={closeSheet}
        className="w-full py-2 text-center text-[14px] text-[#949494]"
      >
        Закрыть
      </button>
    </SheetModal>
  );
}
