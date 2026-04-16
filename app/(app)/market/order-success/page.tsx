"use client";

import { useRouter } from "next/navigation";

export default function OrderSuccessPage() {
  const router = useRouter();
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center bg-white px-6 pt-20">
      <div className="mb-6 flex size-[120px] items-center justify-center rounded-full border-4 border-[#046c6d]">
        <svg width="52" height="40" viewBox="0 0 52 40" fill="none" aria-hidden>
          <path
            d="M4 20L18 34L48 4"
            stroke="#046c6d"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="mb-3 text-center text-[22px] font-bold text-[#151515]">Заявка принята !</h1>
      <p className="mb-10 text-center text-[15px] leading-relaxed text-[#949494]">
        В ближайшее время мы обработаем ваш заказ и доставим его как можно быстрее !
      </p>
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => router.replace("/")}
          className="w-full rounded-2xl bg-[#046c6d] py-4 text-[16px] font-medium text-white active:opacity-90"
        >
          Хорошо
        </button>
      </div>
    </div>
  );
}
