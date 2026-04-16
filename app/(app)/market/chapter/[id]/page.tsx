"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getChapterProducts, type ChapterProductsResponse } from "@/lib/api";
import { displayChapterTitle } from "@/lib/display";
import { productFromApi } from "@/lib/product-map";
import type { Product } from "@/lib/types";
import { useRavonak } from "@/context/RavonakContext";
import { figma } from "@/app/components/ravonak/assets";
import { CartBar } from "@/app/components/ravonak/CartBar";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { ProductCard } from "@/app/components/ravonak/ProductCard";
import { useToast } from "@/app/components/ravonak/ToastProvider";

type FilterKey = "all" | number;

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = Number(params.id as string);
  const { addToCart, authStage, tgId, cart, setCartQty } = useRavonak();
  const { showToast } = useToast();
  const [data, setData] = useState<ChapterProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const filterBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!Number.isFinite(chapterId) || chapterId <= 0) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await getChapterProducts(chapterId, tgId);
        if (cancelled) return;
        setData(res);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [chapterId, tgId]);

  const subcategories = useMemo(() => data?.subcategories ?? [], [data]);

  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (filter === "all") {
      return subcategories.map((sub) => ({
        id: sub.subcategory_id,
        name: sub.subcategory_name,
        products: sub.products
          .filter((p) => !q || p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q))
          .map(productFromApi),
      })).filter((s) => s.products.length > 0);
    }
    const sub = subcategories.find((s) => s.subcategory_id === filter);
    if (!sub) return [];
    return [{
      id: sub.subcategory_id,
      name: sub.subcategory_name,
      products: sub.products
        .filter((p) => !q || p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q))
        .map(productFromApi),
    }];
  }, [subcategories, filter, search]);

  const addWithAuth = useCallback(
    (product: Product) => {
      if (authStage !== "verified") {
        router.push("/register");
        return;
      }
      void addToCart(Number(product.id), 1);
      showToast("В корзине");
    },
    [authStage, addToCart, router, showToast],
  );

  const getCartLine = useCallback(
    (productId: number) => cart.find((l) => l.productId === productId),
    [cart],
  );

  const getCartIndex = useCallback(
    (productId: number) => cart.findIndex((l) => l.productId === productId),
    [cart],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader backHref="/" />

      {/* Sticky search + filter bar */}
      <div className="sticky top-0 z-20 border-b border-[#eee] bg-white px-4 pb-2 pt-2">
        <div className="mb-2 w-full rounded-xl bg-[#eee] px-3 py-2.5">
          <label className="flex items-center gap-3">
            <Image src={figma.search} alt="" width={18} height={18} unoptimized className="shrink-0 opacity-50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Найти в магазине"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-[#151515] placeholder:text-[#949494] focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && search.trim()) {
                  router.push(`/market/search?q=${encodeURIComponent(search.trim())}&chapter_id=${chapterId}`);
                }
              }}
            />
          </label>
        </div>

        {!loading && subcategories.length > 0 ? (
          <div ref={filterBarRef} className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium ${
                filter === "all" ? "bg-[#046c6d] text-white" : "bg-[#eee] text-[#151515]"
              }`}
            >
              {displayChapterTitle(data?.chapter_name ?? "Все")}
            </button>
            {subcategories.map((s) => (
              <button
                key={s.subcategory_id}
                type="button"
                onClick={() => setFilter(s.subcategory_id)}
                className={`max-w-[160px] shrink-0 truncate rounded-full px-3.5 py-1.5 text-[12px] font-medium ${
                  filter === s.subcategory_id ? "bg-[#046c6d] text-white" : "bg-[#eee] text-[#151515]"
                }`}
              >
                {displayChapterTitle(s.subcategory_name)}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Products content */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
        {loading ? (
          <p className="py-10 text-center text-[#949494]">Загрузка…</p>
        ) : filteredSections.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-[#949494]">Ничего не найдено</p>
        ) : (
          filteredSections.map((section) => (
            <section key={section.id} className="mb-5 px-3 pt-3">
              <h2 className="mb-3 text-[15px] font-semibold text-[#151515]">
                {displayChapterTitle(section.name)}
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {section.products.map((p) => {
                  const line = getCartLine(Number(p.id));
                  const idx = getCartIndex(Number(p.id));
                  const step = line?.unit === "grams" ? 200 : 1;
                  return (
                    <ProductCard
                      key={p.id}
                      product={p}
                      grid
                      onOpen={() => router.push(`/market/product/${p.id}`)}
                      onAddToCart={() => addWithAuth(p)}
                      cartQty={line?.qty}
                      cartUnit={line?.unit}
                      onCartMinus={line ? () => void setCartQty(idx, line.qty - step) : undefined}
                      onCartPlus={line ? () => void setCartQty(idx, line.qty + step) : undefined}
                    />
                  );
                })}
              </div>
            </section>
          ))
        )}
        {!loading && !data ? (
          <p className="py-8 text-center text-[#949494]">Раздел не найден</p>
        ) : null}
      </div>

      <CartBar backHref="/" />
    </div>
  );
}
