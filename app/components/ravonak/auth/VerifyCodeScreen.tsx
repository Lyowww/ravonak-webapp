"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AuthPageShell } from "@/app/components/ravonak/auth/AuthPageShell";
import { useRavonak } from "@/context/RavonakContext";
import { formatUzPhoneDisplay } from "@/lib/phone";

const CODE_LENGTH = 5;
const SMS_TTL_SEC = 59;

export function VerifyCodeScreen() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { authStage, ready, sendSmsCode, tgId, userPhone, verifyOtp } = useRavonak();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sec, setSec] = useState(SMS_TTL_SEC);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (authStage === "verified") {
      router.replace("/");
      return;
    }
    if (!userPhone || authStage === "guest") {
      router.replace("/register");
    }
  }, [authStage, ready, router, userPhone]);

  useEffect(() => {
    if (sec <= 0) return;
    const timer = window.setInterval(() => {
      setSec((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sec]);

  const canSubmit = useMemo(
    () => !busy && sec > 0 && code.length === CODE_LENGTH,
    [busy, code.length, sec],
  );

  async function submit() {
    if (!canSubmit) return;

    setBusy(true);
    try {
      const result = await verifyOtp(code);
      if (result.ok) {
        router.replace("/");
        return;
      }
      setError("Код введен не верно");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (busy || sec > 0 || !userPhone || tgId == null) return;

    setBusy(true);
    try {
      const result = await sendSmsCode(userPhone);
      if (result.ok) {
        setCode("");
        setError(null);
        setSec(SMS_TTL_SEC);
        inputRef.current?.focus();
        return;
      }
      setError(result.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthPageShell
      actionLabel="Подтвердить"
      actionDisabled={!canSubmit}
      actionBusy={busy}
      onAction={submit}
    >
      <div className="max-w-[360px]">
        <h1 className="text-[28px] font-bold leading-[1.05] text-[#0f7c7b]">
          Регистрация
        </h1>
        <p className="mt-3 text-[14px] leading-[1.25] text-[#9d9d9d]">
          Мы отправили код проверки на ваш номер телефона:
        </p>
        <p className="mt-1 text-[15px] leading-[1.2] text-[#8e8e8e] underline underline-offset-2">
          {userPhone ? formatUzPhoneDisplay(userPhone) : ""}
        </p>
      </div>

      <div className="mt-16 max-w-[360px]">
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.focus()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.focus();
            }
          }}
          className="relative flex items-start justify-between gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH));
              setError(null);
            }}
            className="pointer-events-none absolute opacity-0"
            aria-label="Код подтверждения"
          />
          {Array.from({ length: CODE_LENGTH }).map((_, index) => {
            const char = code[index] ?? "";
            const hasError = Boolean(error);
            return (
              <div key={index} className="flex flex-1 flex-col items-center">
                <span
                  className={`min-h-[46px] text-[24px] leading-[46px] ${
                    hasError
                      ? "text-[#ef4444]"
                      : char
                        ? "text-[#151515]"
                        : "text-[#151515]"
                  }`}
                >
                  {char || "–"}
                </span>
                <span
                  className={`block h-px w-full ${
                    hasError ? "bg-[#ef4444]" : "bg-[#0f7c7b]"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {error ? (
          <p className="pt-3 text-center text-[14px] leading-[1.2] text-[#ef4444]">
            {error}
          </p>
        ) : null}

        <div className="mt-7 flex items-center justify-center gap-4 text-[14px] text-[#0f7c7b]">
          <button
            type="button"
            onClick={() => void resend()}
            disabled={busy || sec > 0}
            className="underline underline-offset-2 disabled:opacity-100"
          >
            Отправить код повторно
          </button>
          <span>{`00:${Math.max(sec, 0).toString().padStart(2, "0")}`}</span>
        </div>
      </div>
    </AuthPageShell>
  );
}
