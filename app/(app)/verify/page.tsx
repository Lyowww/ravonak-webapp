"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRavonak } from "@/context/RavonakContext";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export default function VerifyPage() {
  const router = useRouter();
  const { userPhone, authStage, verifyOtp } = useRavonak();
  const { showToast } = useToast();
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);
  const [sec, setSec] = useState(59);

  useEffect(() => {
    if (authStage !== "pending_otp") {
      router.replace("/register");
    }
  }, [authStage, router]);

  useEffect(() => {
    if (sec <= 0) return;
    const t = setInterval(() => setSec((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [sec]);

  return (
    <div className="flex flex-1 flex-col bg-white">
      <PageHeader backHref="/register" title="Код из SMS" />
      <div className="px-5 pt-6">
        <p className="mb-2 text-[14px] text-[#949494]">Номер</p>
        <p className="mb-8 text-[16px] font-medium text-[#151515]">{userPhone}</p>
        <label className="mb-2 block text-[12px] text-[#949494]">Код</label>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, ""));
            setErr(false);
          }}
          className="mb-2 w-full rounded-xl border border-[#eee] bg-[#eee] px-4 py-3 text-[20px] tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-[#046c6d]/30"
          placeholder="••••"
        />
        {err ? (
          <p className="mb-4 text-[14px] text-[#c83030]">Код введен не верно</p>
        ) : null}
        <button
          type="button"
          disabled={sec > 0}
          className="mb-6 text-[12px] text-[#046c6d] disabled:text-[#949494]"
          onClick={() => {
            setSec(59);
            showToast("Код отправлен повторно (демо)");
          }}
        >
          Отправить код повторно {sec > 0 ? `00:${sec.toString().padStart(2, "0")}` : ""}
        </button>
        <button
          type="button"
          onClick={() => {
            const ok = verifyOtp(code);
            if (ok) {
              showToast("Вы вошли в аккаунт");
              router.push("/");
            } else {
              setErr(true);
            }
          }}
          className="flex h-[56px] w-full items-center justify-center rounded-2xl bg-[#046c6d] text-[16px] font-medium text-white active:opacity-90"
        >
          Подтвердить
        </button>
      </div>
    </div>
  );
}
