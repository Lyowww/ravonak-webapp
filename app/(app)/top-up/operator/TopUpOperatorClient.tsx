"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { figma } from "@/app/components/ravonak/assets";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export default function TopUpOperatorClient() {
  const sp = useSearchParams();
  const country = sp.get("country") ?? "uz";
  const { showToast } = useToast();

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-white">
      <Link
        href="/top-up"
        className="absolute right-4 top-4 z-10 text-[24px] leading-none text-[#151515] opacity-50"
        aria-label="Закрыть"
      >
        ×
      </Link>
      <div className="flex flex-1 flex-col px-4 pb-8 pt-12">
        <div className="relative mx-auto mb-4 h-[200px] w-full max-w-[313px] overflow-hidden rounded-2xl bg-[#eee]">
          <Image
            src={figma.transfer}
            alt=""
            fill
            className="object-cover object-top"
            sizes="313px"
          />
        </div>
        <p className="mb-2 text-center text-[12px] uppercase tracking-wide text-[#949494]">
          {country}
        </p>
        <h1 className="mb-8 text-center text-[18px] font-semibold leading-snug text-[#151515]">
          Выберите как вам удобно связаться с оператором !
        </h1>
        <button
          type="button"
          onClick={() => showToast("Звонок оператора — Swagger")}
          className="mb-3 flex h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-[#046c6d] text-[16px] font-medium text-white active:opacity-90"
        >
          Позвонить оператору
        </button>
        <button
          type="button"
          onClick={() => showToast("Чат с оператором — Swagger")}
          className="flex h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-[#046c6d] text-[16px] font-medium text-white active:opacity-90"
        >
          Написать оператору
        </button>
      </div>
    </div>
  );
}
