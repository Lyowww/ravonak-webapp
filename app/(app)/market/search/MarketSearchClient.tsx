"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { searchProducts } from "@/lib/catalog";
import { useRavonak } from "@/context/RavonakContext";
import { CartBar } from "@/app/components/ravonak/CartBar";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { ProductCard } from "@/app/components/ravonak/ProductCard";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export default function MarketSearchClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const list = useMemo(() => searchProducts(q), [q]);
  const { addToCart } = useRavonak();
  const { showToast } = useToast();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader backHref="/market" title="Поиск" />
      <div className="px-4 pt-3">
        <p className="mb-3 text-[13px] text-[#949494]">
          {q ? `Результаты: «${q}»` : "Все товары"}
        </p>
        <div className="-mx-2 flex flex-wrap justify-center gap-3 pb-4">
          {list.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onOpen={() => router.push(`/market/product/${p.id}`)}
              onAddToCart={() => {
                addToCart(p.id, 1);
                showToast("В корзине");
              }}
            />
          ))}
        </div>
        {list.length === 0 ? (
          <p className="py-8 text-center text-[14px] text-[#949494]">
            Ничего не найдено
          </p>
        ) : null}
      </div>
      <CartBar backHref="/market" />
    </div>
  );
}
