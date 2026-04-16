"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { figma } from "@/app/components/ravonak/assets";

const COUNTRIES = [
  { id: "us", label: "США" },
  { id: "il", label: "Израиль" },
  { id: "uz", label: "Узбекистан" },
] as const;

export default function TopUpPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[200] flex items-end bg-black/40" onClick={() => router.back()}>
      <div
        className="relative w-full rounded-t-[24px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute right-5 top-4 z-10 flex size-8 items-center justify-center rounded-full text-[22px] leading-none text-[#949494] active:bg-[#f5f5f5]"
        >
          ×
        </button>

        <div className="flex flex-col items-center px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6">
          <div className="relative mb-5 h-[180px] w-full max-w-[280px]">
            <Image
              src={figma.money}
              alt=""
              fill
              className="object-contain"
              sizes="280px"
            />
          </div>
          <h1 className="mb-6 text-center text-[20px] font-bold leading-snug text-[#151515]">
            Для пополнения баланса выберите свою страну !
          </h1>
          <div className="w-full space-y-3">
            {COUNTRIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => router.push(`/top-up/operator?country=${c.id}`)}
                className="flex h-[60px] w-full items-center justify-center rounded-2xl bg-[#046c6d] text-[16px] font-medium text-white active:opacity-90"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
