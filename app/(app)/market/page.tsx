"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { searchProductsApi } from "@/lib/api";
import { productFromApi } from "@/lib/product-map";
import type { Product } from "@/lib/types";
import { useRavonak } from "@/context/RavonakContext";
import { figma } from "@/app/components/ravonak/assets";
import { CartBar } from "@/app/components/ravonak/CartBar";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { ProductCard } from "@/app/components/ravonak/ProductCard";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export default function MarketPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { addToCart, authStage } = useRavonak();
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await searchProductsApi({ q: "", limit: 60 });
        if (cancelled) return;
        setProducts(r.map(productFromApi));
      } catch {
        if (!cancelled) setProducts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submitSearch = useCallback(() => {
    const t = q.trim();
    router.push(
      t ? `/market/search?q=${encodeURIComponent(t)}` : "/market/search",
    );
  }, [q, router]);

  const add = useCallback(
    (id: number) => {
      if (authStage !== "verified") {
        router.push("/register");
        return;
      }
      void addToCart(id, 1);
      showToast("В корзине");
    },
    [addToCart, authStage, router, showToast],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader title="Магазин" />
      <div className="flex-1 space-y-4 px-4 pb-4 pt-2">
        <div className="w-full rounded-xl bg-[#eee] px-3 py-2">
          <label className="flex items-center gap-3">
            <Image
              src={figma.search}
              alt=""
              width={20}
              height={20}
              unoptimized
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Найти в магазине"
              className="min-w-0 flex-1 bg-transparent text-[14px] focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
            />
          </label>
        </div>
        <div className="-mx-2 flex flex-wrap justify-center gap-3">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onOpen={() => router.push(`/market/product/${p.id}`)}
              onAddToCart={() => add(Number(p.id))}
            />
          ))}
        </div>
      </div>
      <CartBar />
    </div>
  );
}
