"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { PRODUCTS } from "@/lib/catalog";
import { useRavonak } from "@/context/RavonakContext";
import { figma } from "@/app/components/ravonak/assets";
import { CartBar } from "@/app/components/ravonak/CartBar";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { ProductCard } from "@/app/components/ravonak/ProductCard";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export default function MarketPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { addToCart } = useRavonak();
  const [q, setQ] = useState("");

  const submitSearch = useCallback(() => {
    const t = q.trim();
    router.push(
      t ? `/market/search?q=${encodeURIComponent(t)}` : "/market/search",
    );
  }, [q, router]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader backHref="/" title="Магазин" />
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
          {PRODUCTS.map((p) => (
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
      </div>
      <CartBar backHref="/" />
    </div>
  );
}
