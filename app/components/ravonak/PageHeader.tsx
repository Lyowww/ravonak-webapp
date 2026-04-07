"use client";

import { useRouterBack } from "@/hooks/useRouterBack";

type PageHeaderProps = {
  title?: string;
  backHref: string;
};

export function PageHeader({ title, backHref }: PageHeaderProps) {
  const goBack = useRouterBack(backHref);
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#eee] bg-white px-4 py-3">
      <button
        type="button"
        onClick={goBack}
        className="shrink-0 text-[15px] font-medium text-[#046c6d] active:opacity-70"
      >
        ← Назад
      </button>
      {title ? (
        <h1 className="truncate text-[17px] font-semibold text-[#151515]">
          {title}
        </h1>
      ) : null}
    </header>
  );
}
