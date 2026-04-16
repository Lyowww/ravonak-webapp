"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { searchProductsApi, type ProductSearchItem } from "@/lib/api";
import { displayChapterTitle } from "@/lib/display";
import { productFromApi } from "@/lib/product-map";
import type { Product } from "@/lib/types";
import { useRavonak } from "@/context/RavonakContext";
import { figma } from "@/app/components/ravonak/assets";
import { CartBar } from "@/app/components/ravonak/CartBar";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { ProductCard } from "@/app/components/ravonak/ProductCard";
import { useToast } from "@/app/components/ravonak/ToastProvider";

type ChipFilter = "all" | number;

export default function MarketSearchClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const initialQ = sp.get("q") ?? "";
  const chapterIdRaw = sp.get("chapter_id");
  const chapterId = chapterIdRaw ? Number(chapterIdRaw) : null;

  const [query, setQuery] = useState(initialQ);
  const [raw, setRaw] = useState<ProductSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [chip, setChip] = useState<ChipFilter>("all");
  const { addToCart, authStage, cart, setCartQty } = useRavonak();
  const { showToast } = useToast();
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setChip("all");
  }, [initialQ, chapterIdRaw]);

  const doSearch = useCallback(async (q: string) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const r = await searchProductsApi({
        q,
        limit: 100,
        chapter_id: chapterId != null && Number.isFinite(chapterId) && chapterId > 0 ? chapterId : undefined,
      });
      setRaw(r);
    } catch {
      setRaw([]);
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    if (initialQ) {
      void doSearch(initialQ);
    }
  }, [initialQ, doSearch]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (searchRef.current) clearTimeout(searchRef.current);
    if (!val.trim()) {
      setRaw([]);
      setHasSearched(false);
      return;
    }
    searchRef.current = setTimeout(() => {
      void doSearch(val.trim());
    }, 400);
  };

  const chips = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of raw) {
      if (!map.has(p.subcategory_id)) map.set(p.subcategory_id, p.subcategory_name);
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1], "ru"));
  }, [raw]);

  const list: Product[] = useMemo(() => {
    let rows = raw;
    if (chip !== "all") rows = raw.filter((p) => p.subcategory_id === chip);
    return rows.map(productFromApi);
  }, [raw, chip]);

  const getCartLine = useCallback(
    (productId: number) => cart.find((l) => l.productId === productId),
    [cart],
  );
  const getCartIndex = useCallback(
    (productId: number) => cart.findIndex((l) => l.productId === productId),
    [cart],
  );

  const backHref =
    chapterId != null && Number.isFinite(chapterId) && chapterId > 0
      ? `/market/chapter/${chapterId}`
      : "/market";

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader backHref={backHref} />

      {/* Search bar */}
      <div className="border-b border-[#eee] px-4 pb-3 pt-2">
        <div className="overflow-hidden rounded-xl bg-[#eee]">
          <label className="flex items-center gap-2 px-3 py-2.5">
            <Image src={figma.search} alt="" width={18} height={18} unoptimized className="shrink-0 opacity-50" />
            <input
              autoFocus
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Найти в магазине"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-[#151515] placeholder:text-[#949494] focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) void doSearch(query.trim());
              }}
            />
            {query ? (
              <button
                type="button"
                className="shrink-0 text-[20px] leading-none text-[#949494] active:opacity-60"
                onClick={() => { setQuery(""); setRaw([]); setHasSearched(false); }}
              >
                ×
              </button>
            ) : null}
          </label>
        </div>
      </div>

      {/* Chips filter */}
      {chips.length > 1 ? (
        <div className="border-b border-[#eee] px-4 py-2">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setChip("all")}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium ${chip === "all" ? "bg-[#046c6d] text-white" : "bg-[#eee] text-[#151515]"}`}
            >
              Все
            </button>
            {chips.map(([id, name]) => (
              <button
                key={id}
                type="button"
                onClick={() => setChip(id)}
                className={`max-w-[180px] shrink-0 truncate rounded-full px-3.5 py-1.5 text-[12px] font-medium ${chip === id ? "bg-[#046c6d] text-white" : "bg-[#eee] text-[#151515]"}`}
              >
                {displayChapterTitle(name)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Results */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 pt-3">
        {loading ? (
          <p className="py-10 text-center text-[#949494]">Поиск…</p>
        ) : !hasSearched ? (
          <p className="py-10 text-center text-[14px] text-[#949494]">
            Введите запрос для поиска товаров
          </p>
        ) : list.length === 0 ? (
          <p className="py-16 text-center text-[14px] text-[#949494]">
            По вашему запросу{"\n"}ничего не нашлось :(
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {list.map((p) => {
              const line = getCartLine(Number(p.id));
              const idx = getCartIndex(Number(p.id));
              const step = line?.unit === "grams" ? 200 : 1;
              return (
                <ProductCard
                  key={p.id}
                  product={p}
                  grid
                  onOpen={() => router.push(`/market/product/${p.id}`)}
                  onAddToCart={() => {
                    if (authStage !== "verified") { router.push("/register"); return; }
                    void addToCart(Number(p.id), 1);
                    showToast("В корзине");
                  }}
                  cartQty={line?.qty}
                  cartUnit={line?.unit}
                  onCartMinus={line ? () => void setCartQty(idx, line.qty - step) : undefined}
                  onCartPlus={line ? () => void setCartQty(idx, line.qty + step) : undefined}
                />
              );
            })}
          </div>
        )}
      </div>

      <CartBar backHref={backHref} />
    </div>
  );
}
