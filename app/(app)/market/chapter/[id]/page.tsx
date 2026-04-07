"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getChapterProducts, type ChapterProductsResponse } from "@/lib/api";
import { displayChapterTitle } from "@/lib/display";
import { productFromApi } from "@/lib/product-map";
import type { Product } from "@/lib/types";
import { useRavonak } from "@/context/RavonakContext";
import { useAppSheets } from "@/hooks/useAppSheets";
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
  const { addToCart, authStage, tgId } = useRavonak();
  const { openSheet } = useAppSheets();
  const { showToast } = useToast();
  const [data, setData] = useState<ChapterProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");

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
    return () => {
      cancelled = true;
    };
  }, [chapterId, tgId]);

  const heading = useMemo(
    () => displayChapterTitle(data?.chapter_name || "Раздел"),
    [data?.chapter_name],
  );

  const subcategories = useMemo(
    () => data?.subcategories ?? [],
    [data?.subcategories],
  );

  const discountedAll = useMemo(() => {
    const flat: Product[] = [];
    for (const sub of subcategories) {
      for (const p of sub.products) {
        if (p.discount_percentage > 0) {
          flat.push(productFromApi(p));
        }
      }
    }
    return flat;
  }, [subcategories]);

  const rows = useMemo(() => {
    if (filter === "all") {
      return [{ id: "all" as const, name: "Со скидкой", products: discountedAll }];
    }
    const sub = subcategories.find((s) => s.subcategory_id === filter);
    if (!sub) return [];
    return [
      {
        id: sub.subcategory_id,
        name: sub.subcategory_name,
        products: sub.products.map(productFromApi),
      },
    ];
  }, [filter, subcategories, discountedAll]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader backHref="/" title={heading} />
      <div className="sticky top-0 z-20 border-b border-[#eee] bg-white/95 px-4 py-2 backdrop-blur-sm">
        <div className="w-full rounded-xl bg-[#eee] px-3 py-2">
          <label className="flex items-center gap-3">
            <Image
              src={figma.search}
              alt=""
              width={20}
              height={20}
              unoptimized
            />
            <button
              type="button"
              className="min-w-0 flex-1 text-left text-[14px] text-[#949494]"
              onClick={() =>
                router.push(`/market/search?chapter_id=${chapterId}`)
              }
            >
              Найти в магазине
            </button>
          </label>
        </div>
        {!loading && subcategories.length > 0 ? (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium ${
                filter === "all"
                  ? "bg-[#046c6d] text-white"
                  : "bg-[#eee] text-[#151515]"
              }`}
            >
              Все
            </button>
            {subcategories.map((s) => (
              <button
                key={s.subcategory_id}
                type="button"
                onClick={() => setFilter(s.subcategory_id)}
                className={`max-w-[200px] shrink-0 truncate rounded-full px-4 py-2 text-[13px] font-medium ${
                  filter === s.subcategory_id
                    ? "bg-[#046c6d] text-white"
                    : "bg-[#eee] text-[#151515]"
                }`}
              >
                {displayChapterTitle(s.subcategory_name)}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-6 px-4 pb-4 pt-3">
        {loading ? (
          <p className="py-8 text-center text-[#949494]">Загрузка…</p>
        ) : (
          rows.map((row) => (
            <section key={String(row.id)}>
              <h2 className="mb-3 text-[16px] font-semibold text-[#151515]">
                {row.name}
              </h2>
              {row.products.length === 0 ? (
                <p className="text-[14px] text-[#949494]">
                  {filter === "all"
                    ? "Нет товаров со скидкой в этом разделе"
                    : "Нет товаров"}
                </p>
              ) : (
                <div className="-mx-2 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {row.products.map((p) => (
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
              )}
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
