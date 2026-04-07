"use client";

import Link from "next/link";
import { useState } from "react";
import { useRavonak } from "@/context/RavonakContext";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export default function TransferPage() {
  const { transferUsd, balanceUsd } = useRavonak();
  const { showToast } = useToast();
  const [phone, setPhone] = useState("+998 88 888 88 88");
  const [amount, setAmount] = useState("");

  const amt = parseFloat(amount.replace(",", "."));
  const insufficient = !Number.isFinite(amt) || amt > balanceUsd;

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
        />
        <p className="mb-2 text-[12px] text-[#949494]">Сумма, USD</p>
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mb-2 w-full rounded-xl border border-[#eee] bg-[#eee] px-4 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-[#046c6d]/30"
          placeholder="0"
        />
        <p className="mb-4 text-[12px] text-[#949494]">
          Доступно: {balanceUsd} $
        </p>
        {insufficient && amount ? (
          <p className="mb-4 rounded-xl bg-[#fff3cd] px-4 py-3 text-[13px] text-[#856404]">
            Недостаточно средств на балансе для перевода
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (insufficient || amt <= 0) {
              showToast("Проверьте сумму и баланс");
              return;
            }
            const ok = transferUsd(phone.trim(), amt);
            if (ok) {
              showToast("Перевод выполнен");
              setAmount("");
            }
          }}
          className="w-full rounded-2xl bg-[#046c6d] py-4 text-[16px] font-medium text-white active:opacity-90"
        >
          Перевести
        </button>
      </div>
    </div>
  );
}
