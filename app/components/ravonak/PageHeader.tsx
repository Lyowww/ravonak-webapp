"use client";

import Image from "next/image";
import { figma } from "./assets";
import { useRouterBack } from "@/hooks/useRouterBack";

type PageHeaderProps = {
  title?: string;
  backHref: string;
  showLogo?: boolean;
};

function RavonakLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex size-[30px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#046c6d]">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path
            d="M9 2C5.13 2 2 5.13 2 9s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 1.5c.83 0 1.5.67 1.5 1.5S9.83 6.5 9 6.5 7.5 5.83 7.5 5 8.17 3.5 9 3.5zM6 13c0-1.66 1.34-3 3-3s3 1.34 3 3H6z"
            fill="white"
          />
          <ellipse cx="9" cy="10" rx="2.5" ry="3" fill="white" opacity="0.85" />
          <circle cx="9" cy="5" r="1.5" fill="white" />
        </svg>
      </div>
      <div className="flex flex-col items-start leading-none">
        <span className="text-[13px] font-bold tracking-wide text-[#151515]">RAVONAK</span>
        <span className="text-[8px] text-[#949494]">express market</span>
      </div>
    </div>
  );
}

export function PageHeader({ title, backHref, showLogo = true }: PageHeaderProps) {
  const goBack = useRouterBack(backHref);
  return (
    <header className="sticky top-0 z-30 flex h-[52px] items-center border-b border-[#eee] bg-white px-4">
      <button
        type="button"
        onClick={goBack}
        className="flex shrink-0 items-center gap-1 text-[14px] font-medium text-[#151515] active:opacity-70"
      >
        <svg width="7" height="13" viewBox="0 0 7 13" fill="none" aria-hidden>
          <path
            d="M6 1.5L1.5 6.5L6 11.5"
            stroke="#151515"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Back</span>
      </button>

      <div className="flex min-w-0 flex-1 items-center justify-center">
        {showLogo ? (
          <RavonakLogo />
        ) : title ? (
          <h1 className="truncate text-[16px] font-semibold text-[#151515]">{title}</h1>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Image
          src={figma.iconMenu}
          alt=""
          width={20}
          height={20}
          unoptimized
          className="opacity-70"
        />
        <Image
          src={figma.iconMore}
          alt=""
          width={20}
          height={20}
          unoptimized
          className="opacity-70"
        />
      </div>
    </header>
  );
}
