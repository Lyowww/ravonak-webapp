"use client";

import { useCallback, useEffect, useState } from "react";
import { useRavonak } from "@/context/RavonakContext";
import { normalizeUzPhone } from "@/lib/phone";
import { authSendCodeDebug } from "@/lib/api";
import { useAppSheets } from "@/hooks/useAppSheets";
import { useTelegramMainButton } from "@/hooks/useTelegramMainButton";
import { SheetModal } from "@/app/components/ravonak/SheetModal";
import { useToast } from "@/app/components/ravonak/ToastProvider";

const SMS_TTL_SEC = 59;

export function AuthSmsSheet() {
  const { userPhone, authStage, verifyOtp, tgId } = useRavonak();
  const { closeSheet, replaceSheet } = useAppSheets();
  const { showToast } = useToast();
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sec, setSec] = useState(SMS_TTL_SEC);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authStage === "verified") {
      closeSheet();
      return;
    }
    if (authStage !== "pending_otp") {
      replaceSheet("auth-phone");
    }
  }, [authStage, replaceSheet, closeSheet]);

  useEffect(() => {
    if (sec <= 0) return;
    const t = setInterval(() => setSec((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [sec]);

  const canConfirm = !busy && code.length === 5 && sec > 0;

  const submit = useCallback(async () => {
    if (sec <= 0) {
      setErr("Срок действия кода истёк. Запросите новый.");
      return;
    }
    setBusy(true);
    try {
      const r = await verifyOtp(code);
      if (r.ok) {
        showToast("Вы вошли в аккаунт");
        closeSheet();
      } else {
        const msg = r.error.toLowerCase();
        if (
          msg.includes("expired") ||
          msg.includes("просроч") ||
          msg.includes("истёк")
        ) {
          setErr("Код истёк. Запросите новый.");
        } else {
          setErr(r.error || "Код введён неверно");
        }
      }
    } finally {
      setBusy(false);
    }
  }, [code, verifyOtp, showToast, closeSheet, sec]);

  useTelegramMainButton(canConfirm, "Подтвердить", busy, submit);

  return (
    <SheetModal title="Код из SMS" onClose={closeSheet}>
      <p className="mb-2 text-[14px] text-[#949494]">Номер</p>
      <p className="mb-6 text-[16px] font-medium text-[#151515]">{userPhone}</p>
      <label className="mb-2 block text-[12px] text-[#949494]">Код (5 цифр)</label>
      <input
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={5}
        value={code}
        onChange={(e) => {
          setCode(e.target.value.replace(/\D/g, "").slice(0, 5));
          setErr(null);
        }}
        className="mb-2 w-full rounded-xl border border-[#eee] bg-[#eee] px-4 py-3 text-[20px] tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-[#046c6d]/30"
        placeholder="•••••"
      />
      {err ? (
        <p className="mb-4 text-[14px] text-[#c83030]">{err}</p>
      ) : null}
      {sec <= 0 ? (
        <p className="mb-4 text-[14px] text-[#c83030]">
          Срок действия кода истёк. Нажмите «Отправить код повторно».
        </p>
      ) : null}
      <button
        type="button"
        disabled={sec > 0}
        className="mb-6 text-[12px] text-[#046c6d] disabled:text-[#949494]"
        onClick={async () => {
          const phone = normalizeUzPhone(userPhone);
          if (!phone || tgId == null) return;
          setSec(SMS_TTL_SEC);
          setCode("");
          setErr(null);
          try {
            await authSendCodeDebug({ phone_number: phone, tg_id: tgId });
            showToast("Код отправлен повторно");
          } catch {
            showToast("Не удалось отправить код");
          }
        }}
      >
        Отправить код повторно{" "}
        {sec > 0 ? `00:${sec.toString().padStart(2, "0")}` : ""}
      </button>
      <button
        type="button"
        disabled={!canConfirm}
        onClick={() => void submit()}
        className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-[#046c6d] text-[16px] font-medium text-white active:opacity-90 disabled:opacity-40"
      >
        Подтвердить
      </button>
    </SheetModal>
  );
}
