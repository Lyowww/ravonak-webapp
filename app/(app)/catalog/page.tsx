"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { searchProductsApi } from "@/lib/api";
import { productFromApi } from "@/lib/product-map";
import type { Product } from "@/lib/types";
import { useRavonak } from "@/context/RavonakContext";
import { figma } from "@/app/components/ravonak/assets";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { ProductCard } from "@/app/components/ravonak/ProductCard";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export default function CatalogPage() {
  const router = useRouter();
  const { addToCart, authStage } = useRavonak();
  const { showToast } = useToast();
  const [onSale, setOnSale] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await searchProductsApi({ q: "", limit: 120 });
        if (cancelled) return;
        const mapped = r.map(productFromApi);
        setOnSale(mapped.filter((p) => p.salePriceSum != null));
      } catch {
        if (!cancelled) setOnSale([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader backHref="/" title="Каталог акций" />
      <div className="relative mx-4 mt-3 h-[120px] overflow-hidden rounded-xl bg-[#fb0]">
        <div className="absolute left-3 top-3 text-[22px] font-black text-white">
          Акции
        </div>
        <div className="pointer-events-none absolute -right-2 -top-4 h-[140px] w-[200px]">
          <Image
            src={figma.catalog}
            alt=""
            fill
            className="object-cover"
            sizes="200px"
          />
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3 px-4 py-6">
        {onSale.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            sale
            onOpen={() => router.push(`/market/product/${p.id}`)}
            onAddToCart={() => {
              if (authStage !== "verified") {
                router.push("/register");
                return;
              }
              void addToCart(Number(p.id), 1);
              showToast("В корзине");
            }}
          />
        ))}
      </div>
    </div>
  );
}
