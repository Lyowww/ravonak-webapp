"use client";

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[100] max-w-[min(340px,calc(100%-2rem))] -translate-x-1/2 rounded-xl bg-[#151515] px-4 py-3 text-center text-sm text-white shadow-lg"
      role="status"
    >
      {message}
    </div>
  );
}
