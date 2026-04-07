"use client";

import Link from "next/link";
import { useState } from "react";
import {
  transferPreview,
  transferSearch,
  transferSend,
} from "@/lib/api";
import { useRavonak } from "@/context/RavonakContext";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { useToast } from "@/app/components/ravonak/ToastProvider";

type Step = "search" | "amount";

export default function TransferPage() {
  const { tgId, authStage, refreshBootstrap } = useRavonak();
  const { showToast } = useToast();
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("search");
  const [receiverTgId, setReceiverTgId] = useState<number | null>(null);
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const amt = parseFloat(amount.replace(",", "."));
  const insufficient =
    !Number.isFinite(amt) || amt <= 0 || amt > balance;

  async function search() {
    if (tgId == null || authStage !== "verified") {
      showToast("Сначала войдите в аккаунт");
      return;
    }
    setBusy(true);
    try {
      const r = await transferSearch(phone.trim(), tgId);
      if (!r.success || r.users.length === 0) {
        showToast("Пользователь не найден");
        return;
      }
      const u = r.users[0]!;
      const pv = await transferPreview(tgId, u.tg_id);
      if (!pv.success) {
        showToast("Не удалось загрузить данные");
        return;
      }
      setReceiverTgId(u.tg_id);
      setReceiverName(u.name);
      setReceiverPhone(u.phone);
      setBalance(pv.sender_balance_usd);
      setStep("amount");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Ошибка поиска");
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    if (tgId == null || receiverTgId == null || insufficient) return;
    setBusy(true);
    try {
      const r = await transferSend({
        sender_tg_id: tgId,
        receiver_tg_id: receiverTgId,
        amount: amt,
      });
      showToast(r.message);
      setAmount("");
      setStep("search");
      setPhone("");
      setReceiverTgId(null);
      await refreshBootstrap();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Ошибка перевода");
    } finally {
      setBusy(false);
    }
  }

  if (authStage !== "verified" || tgId == null) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white px-4 pt-8">
        <PageHeader backHref="/" title="Перевод" />
        <p className="mt-6 text-[#949494]">Войдите в аккаунт для переводов.</p>
        <Link href="/register" className="mt-4 text-[#046c6d] underline">
          Регистрация
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader backHref="/" title="Перевод" />
      <div className="px-5 pt-4">
        <Link
          href="/transfer/history"
          className="mb-6 block text-center text-[15px] font-medium text-[#046c6d] underline-offset-2 hover:underline"
        >
          История переводов
        </Link>

        {step === "search" ? (
          <>
            <h2 className="mb-4 text-[18px] font-semibold text-[#151515]">
              Перевод по номеру телефона
            </h2>
            <p className="mb-2 text-[12px] text-[#949494]">
              Введите номер телефона получателя
            </p>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mb-4 w-full rounded-xl border border-[#eee] bg-[#eee] px-4 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-[#046c6d]/30"
              placeholder="+998…"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void search()}
              className="w-full rounded-2xl bg-[#046c6d] py-4 text-[16px] font-medium text-white active:opacity-90 disabled:opacity-50"
            >
              Найти получателя
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="mb-4 text-[14px] text-[#046c6d]"
              onClick={() => setStep("search")}
            >
              ← Назад к поиску
            </button>
            <p className="mb-2 text-[12px] text-[#949494]">Получатель</p>
            <p className="mb-1 text-[16px] font-medium">{receiverName}</p>
            <p className="mb-6 text-[14px] text-[#949494]">{receiverPhone}</p>
            <p className="mb-2 text-[12px] text-[#949494]">Сумма, USD</p>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mb-2 w-full rounded-xl border border-[#eee] bg-[#eee] px-4 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-[#046c6d]/30"
              placeholder="0"
            />
            <p className="mb-4 text-[12px] text-[#949494]">
              Доступно: {balance.toFixed(2)} $
            </p>
            {insufficient && amount ? (
              <p className="mb-4 rounded-xl bg-[#fff3cd] px-4 py-3 text-[13px] text-[#856404]">
                Недостаточно средств на балансе для перевода
              </p>
            ) : null}
            <button
              type="button"
              disabled={busy || insufficient}
              onClick={() => void send()}
              className="w-full rounded-2xl bg-[#046c6d] py-4 text-[16px] font-medium text-white active:opacity-90 disabled:opacity-40"
            >
              Перевести
            </button>
          </>
        )}
      </div>
    </div>
  );
}
