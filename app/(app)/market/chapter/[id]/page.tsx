"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getChapterProducts } from "@/lib/api";
import { productFromApi } from "@/lib/product-map";
import type { Product } from "@/lib/types";
import { useRavonak } from "@/context/RavonakContext";
import { figma } from "@/app/components/ravonak/assets";
import { CartBar } from "@/app/components/ravonak/CartBar";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { ProductCard } from "@/app/components/ravonak/ProductCard";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = Number(params.id as string);
  const { addToCart, authStage, tgId } = useRavonak();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
        setTitle(res.chapter_name);
        const flat: Product[] = [];
        for (const sub of res.subcategories) {
          for (const p of sub.products) {
            flat.push(productFromApi(p));
          }
        }
        setProducts(flat);
      } catch {
        if (!cancelled) {
          setTitle("");
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chapterId, tgId]);

  const heading = useMemo(() => title || "Раздел", [title]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader backHref="/" title={heading} />
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
            <button
              type="button"
              className="min-w-0 flex-1 text-left text-[14px] text-[#949494]"
              onClick={() => router.push("/market/search")}
            >
              Найти в магазине
            </button>
          </label>
        </div>
        {loading ? (
          <p className="py-8 text-center text-[#949494]">Загрузка…</p>
        ) : (
          <div className="-mx-2 flex flex-wrap justify-center gap-3">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpen={() => router.push(`/market/product/${p.id}`)}
                onAddToCart={() => {
                  if (authStage !== "verified") {
                    showToast("Зарегистрируйтесь, чтобы купить");
                    return;
                  }
                  void addToCart(Number(p.id), 1);
                  showToast("В корзине");
                }}
              />
            ))}
          </div>
        )}
        {!loading && products.length === 0 ? (
          <p className="py-8 text-center text-[#949494]">Нет товаров</p>
        ) : null}
      </div>
      <CartBar backHref="/" />
    </div>
  );
}
