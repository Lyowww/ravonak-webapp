"use client";

import Image from "next/image";
import Link from "next/link";
import { figma } from "@/app/components/ravonak/assets";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export default function MoneyDeliveryPage() {
  const { showToast } = useToast();

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
        <div className="relative mx-auto mb-6 h-[209px] w-[313px] max-w-full overflow-hidden rounded-2xl bg-[#eee]">
          <Image
            src={figma.money}
            alt=""
            fill
            className="object-cover object-top"
            sizes="313px"
          />
        </div>
        <h1 className="mb-6 text-center text-[20px] font-semibold leading-snug text-[#151515]">
          Для доставки денег свяжитесь с оператором !
        </h1>
        <button
          type="button"
          onClick={() => showToast("Звонок: интеграция телефонии / Swagger")}
          className="mb-3 flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-[#046c6d] text-[16px] font-medium text-white active:opacity-90"
        >
          <PhoneIcon />
          Позвонить оператору
        </button>
        <button
          type="button"
          onClick={() => showToast("Чат: Telegram Business / Swagger")}
          className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-[#046c6d] text-[16px] font-medium text-white active:opacity-90"
        >
          <ChatIcon />
          Написать оператору
        </button>
      </div>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.6 10.8c1.8 3.6 4.8 6.6 8.4 8.4l2.8-2.8c.4-.4 1-.6 1.4-.2 1.6.8 3.4 1.2 5.2 1.2 1 0 1.8.8 1.8 1.8V22c0 1-.8 1.8-1.8 1.8C9.4 23.8 0 14.4 0 2.2 0 1.2.8.4 1.8.4H5c1 0 1.8.8 1.8 1.8 0 1.8.4 3.6 1.2 5.2.2.4.2 1 .2 1.4L6.6 10.8z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
        fill="currentColor"
      />
    </svg>
  );
}
