"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getProductById, type ProductSchema } from "@/lib/api";
import { productFromApi } from "@/lib/product-map";
import type { Product } from "@/lib/types";
import { formatSum } from "@/lib/format";
import { useRavonak } from "@/context/RavonakContext";
import { useAppSheets } from "@/hooks/useAppSheets";
import { figma } from "@/app/components/ravonak/assets";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { useToast } from "@/app/components/ravonak/ToastProvider";

const GRAM_STEP = 200;

export default function ProductPageClient() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id as string);
  const { addToCart, authStage } = useRavonak();
  const { openSheet } = useAppSheets();
  const { showToast } = useToast();
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [raw, setRaw] = useState<ProductSchema | null>(null);
  const [loading, setLoading] = useState(true);

  const isGrams = raw?.unit === "grams";
  const step = isGrams ? GRAM_STEP : 1;
  const minQty = isGrams ? GRAM_STEP : 1;

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const p = await getProductById(id);
        if (cancelled) return;
        setRaw(p);
        setProduct(productFromApi(p));
        setQty(p.unit === "grams" ? GRAM_STEP : 1);
      } catch {
        if (!cancelled) {
          setProduct(null);
          setRaw(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const qtyLabel = useMemo(() => {
    if (isGrams) return `${qty} г`;
    return `${qty} шт`;
  }, [isGrams, qty]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col bg-white p-6">
        <PageHeader backHref="/market" />
        <p className="pt-8 text-center text-[#949494]">Загрузка…</p>
      </div>
    );
  }

  if (!product || !raw) {
    return (
      <div className="p-6">
        <PageHeader backHref="/market" />
        <p className="pt-8 text-center text-[#949494]">Товар не найден</p>
      </div>
    );
  }

  const p = product;
  const price = p.salePriceSum ?? p.priceSum;
  const showOld = Boolean(p.salePriceSum);
  const remoteUrl = p.imageUrl?.startsWith("http") ? p.imageUrl : null;
  const linePrice =
    isGrams && raw.unit === "grams"
      ? Math.round((price * qty) / GRAM_STEP)
      : price * qty;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white pb-28">
      <PageHeader backHref="/market" title="Товар" />
      <div className="relative mx-auto mt-2 aspect-square w-full max-w-[min(100%,420px)] overflow-hidden rounded-2xl bg-[#eee]">
        {remoteUrl ? (
          <Image
            src={remoteUrl}
            alt=""
            fill
            className="object-contain p-6"
            sizes="(max-width:640px) 100vw, 420px"
            unoptimized
          />
        ) : (
          <Image
            src={figma.product}
            alt=""
            fill
            className="object-contain p-6"
            sizes="(max-width:640px) 100vw, 420px"
          />
        )}
      </div>
      <div className="px-4 pt-4">
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
            {isGrams ? <span className="text-[14px] font-normal"> / 200 г</span> : null}
          </span>
        </div>
        <p className="mt-1 text-[14px] text-[#949494]">{p.weight}</p>

        <div className="mt-6 flex items-center justify-center gap-6">
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-[#eee] text-[20px]"
            onClick={() =>
              setQty((q) => Math.max(minQty, isGrams ? q - step : q - 1))
            }
          >
            −
          </button>
          <span className="min-w-[4rem] text-center text-[18px] font-semibold">
            {qtyLabel}
          </span>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-[#eee] text-[20px]"
            onClick={() =>
              setQty((q) => (isGrams ? q + step : q + 1))
            }
          >
            +
          </button>
        </div>
        <p className="mt-4 text-center text-[15px] font-semibold text-[#151515]">
          К оплате: {formatSum(linePrice)} сум
        </p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#eee] bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto flex max-w-[min(100%,560px)] gap-3">
          <button
            type="button"
            className="flex flex-1 items-center justify-center rounded-xl border border-[#046c6d] py-3 text-[14px] font-medium text-[#046c6d]"
            onClick={() => openSheet("cart")}
          >
            Корзина
          </button>
          <button
            type="button"
            className="flex flex-[2] items-center justify-center rounded-xl bg-[#046c6d] py-3 text-[14px] font-medium text-white active:opacity-90"
            onClick={() => {
              if (authStage !== "verified") {
                router.push("/register");
                return;
              }
              void addToCart(id, qty);
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
