"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getProductById, type ProductSchema } from "@/lib/api";
import { productFromApi } from "@/lib/product-map";
import type { Product } from "@/lib/types";
import { formatSum } from "@/lib/format";
import { useRavonak } from "@/context/RavonakContext";
import { figma } from "@/app/components/ravonak/assets";
import { useToast } from "@/app/components/ravonak/ToastProvider";

const GRAM_STEP = 200;

export default function ProductPageClient() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id as string);
  const { addToCart, authStage, cart, setCartQty } = useRavonak();
  const { showToast } = useToast();
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [raw, setRaw] = useState<ProductSchema | null>(null);
  const [loading, setLoading] = useState(true);

  const isGrams = raw?.unit === "grams";
  const step = isGrams ? GRAM_STEP : 1;
  const minQty = isGrams ? GRAM_STEP : 1;

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const p = await getProductById(id);
        if (cancelled) return;
        setRaw(p);
        setProduct(productFromApi(p));
        setQty(p.unit === "grams" ? GRAM_STEP : 1);
      } catch {
        if (!cancelled) { setProduct(null); setRaw(null); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const cartLine = useMemo(() => cart.find((l) => l.productId === id), [cart, id]);
  const cartIdx = useMemo(() => cart.findIndex((l) => l.productId === id), [cart, id]);
  const inCart = Boolean(cartLine);

  const qtyLabel = useMemo(() => {
    if (isGrams) return `${qty} г`;
    return `${qty}`;
  }, [isGrams, qty]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white">
        <p className="text-[#949494]">Загрузка…</p>
      </div>
    );
  }

  if (!product || !raw) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white">
        <p className="text-[#949494]">Товар не найден</p>
        <button type="button" onClick={() => router.back()} className="mt-4 text-[#046c6d]">Назад</button>
      </div>
    );
  }

  const price = product.salePriceSum ?? product.priceSum;
  const showOld = Boolean(product.salePriceSum);
  const remoteUrl = product.imageUrl?.startsWith("http") ? product.imageUrl : null;
  const linePrice = isGrams ? Math.round((price * qty) / GRAM_STEP) : price * qty;

  const handleAddToCart = useCallback(() => {
    if (authStage !== "verified") { router.push("/register"); return; }
    void addToCart(id, qty);
    showToast("Добавлено в корзину");
  }, [authStage, addToCart, id, qty, router, showToast]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      {/* Close button */}
      <div className="sticky top-0 z-20 flex justify-end bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-9 items-center justify-center rounded-full bg-[#f5f5f5] text-[20px] leading-none text-[#151515] active:bg-[#eee]"
        >
          ×
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-32">
        {/* Product image */}
        <div className="relative mx-auto mb-4 aspect-square w-full max-w-[340px] overflow-hidden rounded-2xl bg-[#f5f5f5]">
          {remoteUrl ? (
            <Image src={remoteUrl} alt="" fill className="object-contain p-4" sizes="(max-width:640px) 90vw, 340px" unoptimized />
          ) : (
            <Image src={figma.product} alt="" fill className="object-contain p-4" sizes="(max-width:640px) 90vw, 340px" />
          )}
        </div>

        {/* Product info */}
        <h1 className="mb-1 text-[22px] font-bold leading-tight text-[#151515]">{product.title}</h1>
        <p className="mb-4 text-[16px] text-[#949494]">{product.weight}</p>

        {raw.description ? (
          <p className="mb-5 text-[14px] leading-relaxed text-[#151515]">{raw.description}</p>
        ) : null}

        {raw.shelf_life ? (
          <div className="mb-5">
            <p className="mb-1 text-[13px] font-medium text-[#949494]">Подробнее о товаре</p>
            <div className="flex items-center gap-2">
              <p className="text-[13px] text-[#949494]">Срок годности продукта</p>
              <p className="text-[13px] font-medium text-[#151515]">{raw.shelf_life}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#eee] bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto flex max-w-[min(100%,560px)] items-center justify-between gap-3">
          {/* Price */}
          <div>
            {showOld ? (
              <p className="text-[12px] font-medium text-[#c83030] line-through">
                {formatSum(product.priceSum)} сум
              </p>
            ) : null}
            <p className="text-[18px] font-bold text-[#151515]">
              {formatSum(price)} сум
            </p>
          </div>

          {/* Qty controls + add to cart */}
          {inCart ? (
            <div className="flex items-center gap-2 rounded-2xl border border-[#046c6d] px-3 py-2.5">
              <button
                type="button"
                className="text-[18px] font-bold text-[#046c6d] active:opacity-60"
                onClick={() => {
                  const cStep = isGrams ? 200 : 1;
                  void setCartQty(cartIdx, cartLine!.qty - cStep);
                }}
              >
                −
              </button>
              <span className="min-w-[48px] text-center text-[14px] font-medium text-[#151515]">
                {isGrams ? `${cartLine!.qty}г` : cartLine!.qty}
              </span>
              <button
                type="button"
                className="text-[18px] font-bold text-[#046c6d] active:opacity-60"
                onClick={() => {
                  const cStep = isGrams ? 200 : 1;
                  void setCartQty(cartIdx, cartLine!.qty + cStep);
                }}
              >
                +
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl bg-[#eee] px-2 py-2">
                <button
                  type="button"
                  className="flex size-7 items-center justify-center text-[18px] font-bold text-[#151515] active:opacity-60"
                  onClick={() => setQty((q) => Math.max(minQty, isGrams ? q - step : q - 1))}
                >
                  −
                </button>
                <span className="min-w-[40px] text-center text-[13px] font-medium">{qtyLabel}</span>
                <button
                  type="button"
                  className="flex size-7 items-center justify-center text-[18px] font-bold text-[#151515] active:opacity-60"
                  onClick={() => setQty((q) => (isGrams ? q + step : q + 1))}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className="rounded-2xl bg-[#046c6d] px-5 py-2.5 text-[14px] font-medium text-white active:opacity-90"
              >
                В корзину
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
