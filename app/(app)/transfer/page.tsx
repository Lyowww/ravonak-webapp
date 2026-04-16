"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  transferPreview,
  transferSearch,
  transferSend,
  type TransferUserInfo,
} from "@/lib/api";
import { useRavonak } from "@/context/RavonakContext";
import { figma } from "@/app/components/ravonak/assets";
import { useToast } from "@/app/components/ravonak/ToastProvider";

type Step = "search" | "amount" | "success";

export default function TransferPage() {
  const router = useRouter();
  const { tgId, authStage, balanceUsd, userName, refreshBootstrap } = useRavonak();
  const { showToast } = useToast();

  const [phone, setPhone] = useState("");
  const [suggestions, setSuggestions] = useState<TransferUserInfo[]>([]);
  const [step, setStep] = useState<Step>("search");
  const [receiverTgId, setReceiverTgId] = useState<number | null>(null);
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [senderBalance, setSenderBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!phone.trim() || tgId == null || authStage !== "verified") {
      setSuggestions([]);
      return;
    }
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(async () => {
      try {
        const r = await transferSearch(phone.trim(), tgId);
        setSuggestions(r.users ?? []);
      } catch {
        setSuggestions([]);
      }
    }, 400);
    return () => {
      if (searchRef.current) clearTimeout(searchRef.current);
    };
  }, [phone, tgId, authStage]);

  const selectUser = useCallback(
    async (user: TransferUserInfo) => {
      if (tgId == null) return;
      setBusy(true);
      try {
        const pv = await transferPreview(tgId, user.tg_id);
        setReceiverTgId(user.tg_id);
        setReceiverName(user.name);
        setReceiverPhone(user.phone);
        setSenderBalance(pv.sender_balance_usd);
        setStep("amount");
        setSuggestions([]);
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Ошибка загрузки");
      } finally {
        setBusy(false);
      }
    },
    [tgId, showToast],
  );

  const amt = parseFloat(amount.replace(",", "."));
  const insufficient = !Number.isFinite(amt) || amt <= 0 || amt > senderBalance;

  const send = useCallback(async () => {
    if (tgId == null || receiverTgId == null || insufficient) return;
    setBusy(true);
    try {
      await transferSend({
        sender_tg_id: tgId,
        receiver_tg_id: receiverTgId,
        amount: amt,
      });
      await refreshBootstrap();
      setStep("success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Ошибка перевода");
    } finally {
      setBusy(false);
    }
  }, [tgId, receiverTgId, amt, insufficient, refreshBootstrap, showToast]);

  if (authStage !== "verified" || tgId == null) {
    return (
      <div className="fixed inset-0 z-[200] flex items-end bg-black/40" onClick={() => router.back()}>
        <div
          className="relative w-full rounded-t-[24px] bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="mb-4 text-[18px] font-semibold text-[#151515]">Перевод по номеру телефона</h2>
          <p className="mb-4 text-[#949494]">Войдите в аккаунт для переводов.</p>
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="w-full rounded-2xl bg-[#046c6d] py-4 text-white"
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end" onClick={() => router.back()}>
      <div
        className="relative w-full rounded-t-[24px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)]"
        style={{ maxHeight: "90dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eee] px-5 py-4">
          <h2 className="text-[17px] font-semibold text-[#151515]">
            Перевод по номеру телефона
          </h2>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-8 items-center justify-center rounded-full text-[22px] leading-none text-[#949494] active:bg-[#f5f5f5]"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: "calc(90dvh - 60px)" }}>
          {/* Success state */}
          {step === "success" ? (
            <div className="flex flex-col items-center px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8">
              <div className="mb-5 flex size-[100px] items-center justify-center rounded-full bg-[#046c6d]">
                <svg width="44" height="34" viewBox="0 0 52 40" fill="none" aria-hidden>
                  <path d="M4 20L18 34L48 4" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="mb-10 text-center text-[18px] font-bold text-[#151515]">
                Перевод прошел успешно !
              </p>
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full rounded-2xl bg-[#046c6d] py-4 text-[16px] font-medium text-white active:opacity-90"
              >
                Назад
              </button>
            </div>
          ) : step === "search" ? (
            <div className="px-5 pb-5 pt-4">
              <p className="mb-2 text-[13px] text-[#949494]">Введите номер телефона получателя</p>
              <div className="mb-4 overflow-hidden rounded-xl bg-[#eee]">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 88 888 88 88"
                  type="tel"
                  inputMode="tel"
                  className="w-full bg-transparent px-4 py-3.5 text-[16px] text-[#151515] placeholder:text-[#949494] focus:outline-none"
                />
              </div>

              {suggestions.length > 0 ? (
                <ul className="mb-4 divide-y divide-[#eee] overflow-hidden rounded-xl border border-[#eee]">
                  {suggestions.map((u) => (
                    <li key={u.tg_id}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void selectUser(u)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-[#f5f5f5]"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eee]">
                          <Image src={figma.avatar} alt="" width={40} height={40} className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-medium text-[#151515]">{u.name}</p>
                          <p className="text-[13px] text-[#949494]">{u.phone}</p>
                        </div>
                        <svg width="7" height="13" viewBox="0 0 7 13" fill="none" aria-hidden>
                          <path d="M1 1.5l4.5 5-4.5 5" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            /* Amount entry */
            <div className="px-5 pb-5 pt-4">
              {/* Sender → Receiver cards */}
              <div className="mb-5 overflow-hidden rounded-2xl border border-[#eee]">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eee]">
                    <Image src={figma.avatar} alt="" width={40} height={40} className="object-cover" />
                  </div>
                  <div>
                    <p className="text-[12px] text-[#949494]">Ваш баланс</p>
                    <p className="text-[16px] font-bold text-[#151515]">{senderBalance} $</p>
                  </div>
                </div>
                <div className="flex justify-center border-t border-[#eee] py-2">
                  <div className="flex size-7 items-center justify-center rounded-full bg-[#046c6d]">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M6 1v10M6 11l-4-4M6 11l4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-t border-[#eee] px-4 py-3">
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eee]">
                    <Image src={figma.avatar} alt="" width={40} height={40} className="object-cover" />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[#151515]">{receiverName}</p>
                    <p className="text-[13px] text-[#949494]">{receiverPhone}</p>
                  </div>
                </div>
              </div>

              <p className="mb-2 text-[13px] text-[#949494]">Введите сумму перевода</p>
              <div className="mb-4 flex items-center gap-2 overflow-hidden rounded-xl bg-[#eee] px-4 py-3">
                <input
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="min-w-0 flex-1 bg-transparent text-[16px] text-[#151515] placeholder:text-[#949494] focus:outline-none"
                />
                <span className="text-[16px] font-medium text-[#949494]">$</span>
              </div>

              {insufficient && amount ? (
                <div className="mb-4 rounded-xl bg-[#fee] px-4 py-3">
                  <p className="text-[13px] font-medium text-[#c83030]">
                    Недостаточно средств на балансе для перевода
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* History button */}
          {step === "search" ? (
            <div className="border-t border-[#eee] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">
              <button
                type="button"
                onClick={() => router.push("/transfer/history")}
                className="w-full rounded-2xl bg-[#046c6d] py-4 text-[16px] font-medium text-white active:opacity-90"
              >
                История переводов
              </button>
            </div>
          ) : step === "amount" ? (
            <div className="border-t border-[#eee] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">
              <button
                type="button"
                disabled={busy || insufficient || !amount}
                onClick={() => void send()}
                className="w-full rounded-2xl bg-[#046c6d] py-4 text-[16px] font-medium text-white disabled:opacity-40 active:opacity-90"
              >
                {busy ? "Отправка…" : "Отправить"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
