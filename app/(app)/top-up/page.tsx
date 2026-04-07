"use client";

import Image from "next/image";
import Link from "next/link";
import { figma } from "@/app/components/ravonak/assets";

const COUNTRIES = [
  { id: "us", label: "США" },
  { id: "il", label: "Израиль" },
  { id: "uz", label: "Узбекистан" },
] as const;

export default function TopUpPage() {
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
        <div className="relative mx-auto mb-4 h-[200px] w-full max-w-[313px] overflow-hidden rounded-2xl bg-[#eee]">
          <Image
            src={figma.money}
            alt=""
            fill
            className="object-cover object-top"
            sizes="313px"
          />
        </div>
        <h1 className="mb-8 text-center text-[18px] font-semibold leading-snug text-[#151515]">
          Для пополнения баланса выберите свою страну !
        </h1>
        <div className="space-y-3">
          {COUNTRIES.map((c) => (
            <Link
              key={c.id}
              href={`/top-up/operator?country=${c.id}`}
              className="flex h-[60px] w-full items-center justify-center rounded-2xl bg-[#046c6d] text-[16px] font-medium text-white active:opacity-90"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
