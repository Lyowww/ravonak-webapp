"use client";

import type { ReactNode } from "react";

type SheetModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Extra bottom padding when Telegram MainButton is visible */
  bottomPad?: boolean;
};

export function SheetModal({
  title,
  onClose,
  children,
  bottomPad = true,
}: SheetModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end sm:items-center sm:justify-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(15,15,15,0.45)] backdrop-blur-[8px]"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div
        className={`relative z-[1] flex max-h-[min(92dvh,900px)] w-full max-w-[390px] flex-col rounded-t-[24px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)] sm:max-h-[85dvh] sm:rounded-[24px] ${
          bottomPad ? "pb-[max(1rem,env(safe-area-inset-bottom))]" : ""
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#eee] px-4 py-3">
          <span className="text-[17px] font-semibold text-[#151515]">{title}</span>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-[22px] leading-none text-[#949494] active:bg-[#f5f5f5]"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
