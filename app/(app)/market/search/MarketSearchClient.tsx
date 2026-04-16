"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { searchProductsApi, type ProductSearchItem } from "@/lib/api";
import { displayChapterTitle } from "@/lib/display";
import { productFromApi } from "@/lib/product-map";
import type { Product } from "@/lib/types";
import { useRavonak } from "@/context/RavonakContext";
import { CartBar } from "@/app/components/ravonak/CartBar";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { ProductCard } from "@/app/components/ravonak/ProductCard";
import { useToast } from "@/app/components/ravonak/ToastProvider";

type ChipFilter = "all" | number;

export default function MarketSearchClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const chapterIdRaw = sp.get("chapter_id");
  const chapterId = chapterIdRaw ? Number(chapterIdRaw) : null;
  const [raw, setRaw] = useState<ProductSearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [chip, setChip] = useState<ChipFilter>("all");
  const { addToCart, authStage } = useRavonak();
  const { showToast } = useToast();

  useEffect(() => {
    setChip("all");
  }, [q, chapterIdRaw]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const r = await searchProductsApi({
          q,
          limit: 100,
          chapter_id:
            chapterId != null && Number.isFinite(chapterId) && chapterId > 0
              ? chapterId
              : undefined,
        });
        if (cancelled) return;
        setRaw(r);
      } catch {
        if (!cancelled) setRaw([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, chapterId]);

  const chips = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of raw) {
      if (!map.has(p.subcategory_id)) {
        map.set(p.subcategory_id, p.subcategory_name);
      }
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[1].localeCompare(b[1], "ru"),
    );
  }, [raw]);

  const list: Product[] = useMemo(() => {
    let rows = raw;
    if (chip !== "all") {
      rows = raw.filter((p) => p.subcategory_id === chip);
    }
    return rows.map(productFromApi);
  }, [raw, chip]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader
        backHref={
          chapterId != null && Number.isFinite(chapterId) && chapterId > 0
            ? `/market/chapter/${chapterId}`
            : "/market"
        }
        title="Поиск"
      />
      {chapterId != null && Number.isFinite(chapterId) && chips.length > 0 ? (
        <div className="sticky top-0 z-20 border-b border-[#eee] bg-white/95 px-4 py-2 backdrop-blur-sm">
          <p className="mb-2 text-[12px] text-[#949494]">Подкатегории</p>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setChip("all")}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium ${
                chip === "all"
                  ? "bg-[#046c6d] text-white"
                  : "bg-[#eee] text-[#151515]"
              }`}
            >
              Все
            </button>
            {chips.map(([id, name]) => (
              <button
                key={id}
                type="button"
                onClick={() => setChip(id)}
                className={`max-w-[220px] shrink-0 truncate rounded-full px-4 py-2 text-[13px] font-medium ${
                  chip === id
                    ? "bg-[#046c6d] text-white"
                    : "bg-[#eee] text-[#151515]"
                }`}
              >
                {displayChapterTitle(name)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="px-4 pt-3">
        <p className="mb-3 text-[13px] text-[#949494]">
          {loading
            ? "Поиск…"
            : q
              ? `Результаты: «${q}»`
              : chapterId
                ? "Товары раздела"
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
                  router.push("/register");
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
