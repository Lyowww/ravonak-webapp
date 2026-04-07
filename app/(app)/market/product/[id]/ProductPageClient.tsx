"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getProduct } from "@/lib/catalog";
import { formatSum } from "@/lib/format";
import { useRavonak } from "@/context/RavonakContext";
import { figma } from "@/app/components/ravonak/assets";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { useToast } from "@/app/components/ravonak/ToastProvider";

type Mode = "default" | "units" | "grams";

export default function ProductPageClient() {
  const params = useParams();
  const router = useRouter();
  const s = useSearchParams();
  const id = params.id as string;
  const p = getProduct(id);
  const { addToCart } = useRavonak();
  const { showToast } = useToast();
  const [qty, setQty] = useState(1);

  const mode = (s.get("mode") as Mode) || "default";
  const setMode = (m: Mode) => {
    router.replace(`/market/product/${id}?mode=${m}`);
  };

  const variantForAdd = useMemo(() => {
    if (mode === "grams") return "400г";
    if (mode === "units") return "1 шт";
    return undefined;
  }, [mode]);

  if (!p) {
    return (
      <div className="p-6">
        <PageHeader backHref="/market" />
        <p className="pt-8 text-center text-[#949494]">Товар не найден</p>
      </div>
    );
  }

  const price = p.salePriceSum ?? p.priceSum;
  const showOld = Boolean(p.salePriceSum);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white pb-24">
      <PageHeader backHref="/market" title="Товар" />
      <div className="relative mx-4 mt-2 aspect-square max-h-[320px] overflow-hidden rounded-2xl bg-[#eee]">
        <Image
          src={figma.product}
          alt=""
          fill
          className="object-contain p-6"
          sizes="320px"
        />
      </div>
      <div className="px-4 pt-4">
        <div className="mb-4 flex rounded-xl bg-[#eee] p-1">
          {(
            [
              ["default", "Карточка"],
              ["units", "Штуки"],
              ["grams", "Граммы"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-lg py-2 text-[12px] font-medium ${
                mode === m ? "bg-white text-[#151515] shadow-sm" : "text-[#949494]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <h2 className="text-[20px] font-bold leading-tight text-[#151515]">
          {p.title}
        </h2>
        <div className="mt-2 flex items-baseline gap-2">
          {showOld ? (
            <span className="text-[14px] text-[#c83030] line-through">
              {formatSum(p.priceSum)} сум
            </span>
          ) : null}
          <span className="text-[24px] font-bold text-[#046c6d]">
            {formatSum(price)} сум
          </span>
        </div>
        <p className="mt-1 text-[14px] text-[#949494]">{p.weight}</p>

        <div className="mt-6 flex items-center justify-center gap-6">
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-[#eee] text-[20px]"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="min-w-[2rem] text-center text-[18px] font-semibold">
            {qty}
          </span>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-[#eee] text-[20px]"
            onClick={() => setQty((q) => q + 1)}
          >
            +
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[390px] -translate-x-1/2 border-t border-[#eee] bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="flex gap-3">
          <Link
            href="/market/cart"
            className="flex flex-1 items-center justify-center rounded-xl border border-[#046c6d] py-3 text-[14px] font-medium text-[#046c6d]"
          >
            Корзина
          </Link>
          <button
            type="button"
            className="flex flex-[2] items-center justify-center rounded-xl bg-[#046c6d] py-3 text-[14px] font-medium text-white active:opacity-90"
            onClick={() => {
              addToCart(p.id, qty, variantForAdd);
              showToast("Добавлено в корзину");
            }}
          >
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}
