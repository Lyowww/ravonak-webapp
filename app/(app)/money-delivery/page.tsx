"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { figma } from "@/app/components/ravonak/assets";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export default function MoneyDeliveryPage() {
  const router = useRouter();
  const { showToast } = useToast();

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
          <h1 className="mb-8 text-center text-[20px] font-bold leading-snug text-[#151515]">
            Для доставки денег свяжитесь с оператором !
          </h1>
          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={() => showToast("Звонок оператору скоро будет доступен")}
              className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-[#046c6d] text-[16px] font-medium text-white active:opacity-90"
            >
              <PhoneIcon />
              Позвонить оператору
            </button>
            <button
              type="button"
              onClick={() => showToast("Чат с оператором скоро будет доступен")}
              className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-[#046c6d] text-[16px] font-medium text-white active:opacity-90"
            >
              <ChatIcon />
              Написать оператору
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="white" />
    </svg>
  );
}
