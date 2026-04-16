"use client";

import { useTelegramMainButton } from "@/hooks/useTelegramMainButton";

type AuthPageShellProps = {
  actionLabel: string;
  actionDisabled: boolean;
  actionBusy?: boolean;
  onAction: () => void | Promise<void>;
  children: React.ReactNode;
};

export function AuthPageShell({
  actionLabel,
  actionDisabled,
  actionBusy = false,
  onAction,
  children,
}: AuthPageShellProps) {
  // Auth uses its own fixed footer button, so Telegram's main button should stay hidden.
  useTelegramMainButton(false, actionLabel, actionDisabled || actionBusy, onAction);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-8">
      <div className="flex flex-1 flex-col px-2">{children}</div>

      <div className="px-1 pt-6">
        <button
          type="button"
          onClick={() => void onAction()}
          disabled={actionDisabled || actionBusy}
          className="flex h-14 w-full items-center justify-center rounded-2xl text-[18px] font-medium text-white transition active:opacity-90 disabled:bg-[#b7d8da] disabled:text-white"
          style={{
            backgroundColor:
              actionDisabled || actionBusy ? "#b7d8da" : "#0f7c7b",
          }}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
