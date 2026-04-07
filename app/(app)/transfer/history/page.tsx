"use client";

import { useRavonak } from "@/context/RavonakContext";
import { PageHeader } from "@/app/components/ravonak/PageHeader";

export default function TransferHistoryPage() {
  const { transfers } = useRavonak();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader backHref="/transfer" title="История переводов" />
      <ul className="divide-y divide-[#eee] px-4">
        {transfers.map((t) => (
          <li key={t.id} className="flex items-start justify-between py-4">
            <div>
              <p className="text-[14px] font-medium text-[#151515]">{t.label}</p>
              <p className="text-[13px] text-[#949494]">{t.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-[#949494]">{t.date}</p>
              <p
                className={`text-[15px] font-semibold ${
                  t.kind === "debit" ? "text-[#c83030]" : "text-[#046c6d]"
                }`}
              >
                {t.kind === "debit" ? "-" : "+"} {t.amountUsd} $
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
