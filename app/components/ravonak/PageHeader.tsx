"use client";

import Link from "next/link";

type PageHeaderProps = {
  title?: string;
  backHref: string;
};

export function PageHeader({ title, backHref }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#eee] bg-white px-4 py-3">
      <Link
        href={backHref}
        className="text-[15px] font-medium text-[#046c6d] active:opacity-70"
      >
        ← Назад
      </Link>
      {title ? (
        <h1 className="truncate text-[17px] font-semibold text-[#151515]">
          {title}
        </h1>
      ) : null}
    </header>
  );
}
