"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRavonak } from "@/context/RavonakContext";
import { figma } from "@/app/components/ravonak/assets";
import { useToast } from "@/app/components/ravonak/ToastProvider";

const PLANS = ["Базовый", "Семейный", "Безлимит"];

export default function SimPage() {
  const { addSimCard } = useRavonak();
  const { showToast } = useToast();
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState(PLANS[0]!);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-white">
      <Link
        href="/"
        className="absolute right-4 top-4 z-10 text-[24px] leading-none text-[#151515] opacity-50"
        aria-label="Закрыть"
      >
        ×
      </Link>
      <div className="flex flex-1 flex-col px-4 pb-8 pt-12">
        <div className="relative mx-auto mb-4 h-[200px] w-full max-w-[360px] overflow-hidden rounded-2xl bg-[#eee]">
          <Image
            src={figma.transfer}
            alt=""
            fill
            className="object-cover object-top"
            sizes="360px"
          />
        </div>
        <p className="mb-6 text-center text-[16px] font-medium leading-snug text-[#151515]">
          Для пополнения баланса SIM-карты, укажите ее данные
        </p>
        <label className="mb-2 text-[12px] text-[#949494]">Номер телефона</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mb-4 rounded-xl border border-[#eee] bg-[#eee] px-4 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-[#046c6d]/30"
          placeholder="+998 …"
        />
        <label className="mb-2 text-[12px] text-[#949494]">Тарифный план</label>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mb-4 flex items-center justify-between rounded-xl border border-[#eee] bg-[#eee] px-4 py-3 text-left text-[16px]"
        >
          {plan}
          <span className="text-[#949494]">▼</span>
        </button>
        {open ? (
          <ul className="mb-4 rounded-xl border border-[#eee] bg-white py-1 shadow-sm">
            {PLANS.map((p) => (
              <li key={p}>
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-[15px] hover:bg-[#f5f5f5]"
                  onClick={() => {
                    setPlan(p);
                    setOpen(false);
                  }}
                >
                  {p}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (phone.trim().length < 8) {
              showToast("Укажите номер SIM");
              return;
            }
            addSimCard(phone.trim(), plan);
            showToast("SIM сохранена локально — далее Swagger");
          }}
          className="mt-auto flex h-[60px] w-full items-center justify-center rounded-2xl bg-[#046c6d] text-[16px] font-medium text-white active:opacity-90"
        >
          Добавить SIM-карту
        </button>
      </div>
    </div>
  );
}
