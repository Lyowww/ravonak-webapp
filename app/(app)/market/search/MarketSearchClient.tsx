"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { searchProductsApi } from "@/lib/api";
import { productFromApi } from "@/lib/product-map";
import type { Product } from "@/lib/types";
import { useRavonak } from "@/context/RavonakContext";
import { useAppSheets } from "@/hooks/useAppSheets";
import { CartBar } from "@/app/components/ravonak/CartBar";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { ProductCard } from "@/app/components/ravonak/ProductCard";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export default function MarketSearchClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const [list, setList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, authStage } = useRavonak();
  const { openSheet } = useAppSheets();
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const r = await searchProductsApi({ q, limit: 80 });
        if (cancelled) return;
        setList(r.map(productFromApi));
      } catch {
        if (!cancelled) setList([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader backHref="/market" title="Поиск" />
      <div className="px-4 pt-3">
        <p className="mb-3 text-[13px] text-[#949494]">
          {loading
            ? "Поиск…"
            : q
              ? `Результаты: «${q}»`
              : "Все товары"}
        </p>
        <div className="-mx-2 flex flex-wrap justify-center gap-3 pb-4">
          {list.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onOpen={() => router.push(`/market/product/${p.id}`)}
              onAddToCart={() => {
                if (authStage !== "verified") {
                  openSheet("auth-phone");
                  return;
                }
                void addToCart(Number(p.id), 1);
                showToast("В корзине");
              }}
            />
          ))}
        </div>
        {!loading && list.length === 0 ? (
          <p className="py-8 text-center text-[14px] text-[#949494]">
            Ничего не найдено
          </p>
        ) : null}
      </div>
      <CartBar backHref="/market" />
    </div>
  );
}
