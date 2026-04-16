"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getActiveOrder, searchProductsApi, type MainScreenResponse } from "@/lib/api";
import { productFromApi } from "@/lib/product-map";
import type { Product } from "@/lib/types";
import { useRavonak } from "@/context/RavonakContext";
import { useAppSheets } from "@/hooks/useAppSheets";
import { figma } from "./assets";
import { CartBar } from "./CartBar";
import { ProductCard } from "./ProductCard";
import { PromoBanner } from "./PromoBanner";
import { ServiceTile } from "./ServiceTile";
import { useToast } from "./ToastProvider";

function BannerSlider({ banners }: { banners: MainScreenResponse["banners"] }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = banners.length;

  useEffect(() => {
    if (count <= 1) return;
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % count);
    }, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [count]);

  if (count === 0) {
    return (
      <div className="shrink-0 snap-center">
        <PromoBanner showBuy />
      </div>
    );
  }

  const banner = banners[idx]!;
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#c4d209]" style={{ minHeight: 154 }}>
      <Image
        src={banner.image_url}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width:640px) 90vw, 358px"
        unoptimized
      />
      <div className="pointer-events-none absolute left-5 top-5 z-[1] max-w-[180px]">
        {banner.title ? (
          <p className="text-[18px] font-black leading-tight text-white">{banner.title}</p>
        ) : null}
        {banner.description ? (
          <p className="mt-1 text-[14px] font-bold leading-tight text-white">{banner.description}</p>
        ) : null}
      </div>
      {count > 1 ? (
        <div className="absolute bottom-2 left-0 right-0 z-[1] flex justify-center gap-1">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { openSheet } = useAppSheets();
  const {
    userName,
    balanceUsd,
    addToCart,
    cart,
    authStage,
    mainScreen,
    tgId,
  } = useRavonak();
  const [homeSearch, setHomeSearch] = useState("");
  const [guestMain, setGuestMain] = useState<MainScreenResponse | null>(null);
  const [activeOrder, setActiveOrder] = useState<{
    order_number: string | null;
    status: string | null;
    total_sum_uzs: number | null;
  } | null>(null);

  const main = authStage === "verified" ? mainScreen : guestMain;

  useEffect(() => {
    if (authStage !== "verified") {
      let cancelled = false;
      (async () => {
        try {
          const [search, active] = await Promise.all([
            searchProductsApi({ q: "", limit: 20 }),
            tgId != null ? getActiveOrder(tgId) : Promise.resolve(null),
          ]);
          if (cancelled) return;
          setGuestMain({
            balance_usd: 0,
            user_name: "",
            sections: [],
            banners: [],
            promo_products: [],
            random_products: search.map((p) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              price: p.price,
              old_price: p.old_price ?? null,
              discount_percentage: p.discount_percentage,
              image_url: p.image_url,
              shelf_life: p.shelf_life,
              unit: p.unit,
              stock_quantity: p.stock_quantity,
            })),
          });
          if (active?.success && active.order_number) {
            setActiveOrder({
              order_number: active.order_number,
              status: active.status,
              total_sum_uzs: active.total_sum_uzs,
            });
          }
        } catch {
          /* ignore */
        }
      })();
      return () => { cancelled = true; };
    }
    return undefined;
  }, [authStage, tgId]);

  useEffect(() => {
    if (authStage !== "verified" || tgId == null) return;
    let cancelled = false;
    (async () => {
      try {
        const active = await getActiveOrder(tgId);
        if (cancelled) return;
        if (active.success && active.order_number) {
          setActiveOrder({
            order_number: active.order_number,
            status: active.status,
            total_sum_uzs: active.total_sum_uzs,
          });
        } else {
          setActiveOrder(null);
        }
      } catch {
        setActiveOrder(null);
      }
    })();
    return () => { cancelled = true; };
  }, [authStage, tgId]);

  const goSearch = useCallback(() => {
    const q = homeSearch.trim();
    if (q) router.push(`/market/search?q=${encodeURIComponent(q)}`);
    else router.push("/market/search");
  }, [homeSearch, router]);

  const promoProducts = useMemo(() => {
    const m = main;
    if (!m) return [];
    return m.promo_products.slice(0, 12).map(productFromApi);
  }, [main]);

  const randomProducts = useMemo(() => {
    const m = main;
    if (!m) return [];
    const promoIds = new Set(m.promo_products.map((p) => p.id));
    return m.random_products
      .filter((p) => !promoIds.has(p.id))
      .slice(0, 12)
      .map(productFromApi);
  }, [main]);

  const allProducts = useMemo(() => {
    if (promoProducts.length > 0) return promoProducts;
    return randomProducts;
  }, [promoProducts, randomProducts]);

  const displayName =
    authStage === "verified" ? userName || "Пользователь" : "Гость";

  const addWithAuth = useCallback(
    (product: Product) => {
      if (authStage !== "verified") {
        router.push("/register");
        return;
      }
      void addToCart(Number(product.id), 1);
      showToast("Добавлено в корзину");
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

  const { setCartQty } = useRavonak();

  const statusLabel = (status: string | null) => {
    if (!status) return "Ваш заказ собирается";
    const map: Record<string, string> = {
      pending: "Ваш заказ ожидает сборки",
      assembling: "Ваш заказ собирается",
      assembled_waiting_courier_accept: "Ваш заказ готов к доставке",
      courier_accepted: "Курьер забрал ваш заказ",
      handed_to_courier: "Курьер в пути и скоро доставит ваш заказ",
      delivering: "Курьер в пути и скоро доставит ваш заказ",
      completed: "Ваш заказ доставлен",
    };
    return map[status] ?? status;
  };

  const sections = main?.sections ?? [];
  const banners = main?.banners ?? [];

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
        {/* Active order banner */}
        {activeOrder?.order_number ? (
          <button
            type="button"
            onClick={() => openSheet("order", { order: activeOrder.order_number! })}
            className="flex w-full items-center gap-3 border-b border-[#eee] bg-white px-4 py-3 text-left active:bg-[#f5f5f5]"
          >
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#e8f5f5]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="1" y="8" width="16" height="9" rx="2" fill="#046c6d" opacity="0.2" />
                <rect x="3" y="10" width="12" height="5" rx="1" fill="#046c6d" />
                <circle cx="6" cy="19" r="2" fill="#046c6d" />
                <circle cx="16" cy="19" r="2" fill="#046c6d" />
                <path d="M17 13h4l2 3v3h-6v-6z" fill="#046c6d" opacity="0.8" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-[#151515]">
                Ваш заказ {activeOrder.order_number}
              </p>
              <p className="text-[12px] text-[#949494]">
                {statusLabel(activeOrder.status)}
              </p>
            </div>
            <svg width="7" height="13" viewBox="0 0 7 13" fill="none" aria-hidden>
              <path d="M1 1.5l4.5 5-4.5 5" stroke="#949494" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : null}

        {/* Balance header */}
        <div className="relative flex flex-col items-center gap-6 overflow-hidden px-5 pb-8 pt-4">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <Image src={figma.balanceMask} alt="" fill className="object-cover object-top" unoptimized />
          </div>

          <div className="relative z-[1] flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-[#eee]">
                <Image src={figma.avatar} alt="" fill className="object-cover" sizes="36px" />
              </div>
              <div className="text-[12px] leading-tight text-[#151515]">
                <p className="font-light opacity-70">Здравствуйте,</p>
                <p className="font-medium">{displayName} !</p>
              </div>
            </div>
            <Link
              href="/top-up"
              className="flex h-8 items-center gap-1.5 rounded-[30px] bg-[#046c6d] px-3 active:opacity-90"
            >
              <Image src={figma.plus} alt="" width={8} height={8} unoptimized />
              <span className="text-[12px] font-medium text-white">Пополнить баланс</span>
            </Link>
          </div>

          <div className="relative z-[1] flex flex-col items-center gap-1">
            <p className="text-[14px] font-normal tracking-wide text-[#949494]">Ваш баланс</p>
            <p className="text-[48px] font-bold leading-none text-[#046c6d]">
              {authStage === "verified" ? balanceUsd : 0} $
            </p>
          </div>
        </div>

        {/* Service tiles */}
        <div className="mb-4 flex justify-center gap-4 px-4">
          {sections.length > 0
            ? sections.slice(0, 3).map((s) => (
                <ServiceTile
                  key={s.id}
                  imageSrc={s.icon_url || figma.grocery}
                  label={s.name}
                  href={`/market/chapter/${s.id}`}
                />
              ))
            : (
              <>
                <ServiceTile imageSrc={figma.grocery} label="Доставка продуктов" href="/market" />
                <ServiceTile imageSrc={figma.transfer} label="Перевести баланс" href="/transfer" />
                <ServiceTile imageSrc={figma.money} label="Доставка денег" href="/money-delivery" />
              </>
            )}
        </div>

        {/* Banner slider */}
        <div className="mb-4 px-4">
          <BannerSlider banners={banners} />
        </div>

        {/* Search bar */}
        <div className="mb-3 px-4">
          <div className="w-full rounded-xl bg-[#eee] px-3 py-2.5">
            <label className="flex items-center gap-3">
              <Image src={figma.search} alt="" width={18} height={18} unoptimized className="shrink-0 opacity-50" />
              <input
                type="search"
                value={homeSearch}
                onChange={(e) => setHomeSearch(e.target.value)}
                placeholder="Найти в магазине"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[#151515] placeholder:text-[#949494] focus:outline-none"
                onKeyDown={(e) => { if (e.key === "Enter") goSearch(); }}
              />
            </label>
          </div>
        </div>

        {/* Promo products section */}
        {promoProducts.length > 0 ? (
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between px-4">
              <h2 className="text-[16px] font-semibold text-[#151515]">Все со скидкой</h2>
              <button
                type="button"
                className="flex items-center gap-1 text-[13px] text-[#949494]"
                onClick={() => router.push("/market/search")}
              >
                Все
                <svg width="5" height="9" viewBox="0 0 5 9" fill="none" aria-hidden>
                  <path d="M1 1l3 3.5L1 8" stroke="#949494" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="-mx-1 flex gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {promoProducts.map((p) => {
                const line = getCartLine(Number(p.id));
                const idx = getCartIndex(Number(p.id));
                const step = line?.unit === "grams" ? 200 : 1;
                return (
                  <ProductCard
                    key={p.id}
                    product={p}
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
          </div>
        ) : null}

        {/* Catalog promo banner */}
        {(promoProducts.length > 0 || randomProducts.length > 0) ? (
          <div className="mb-4 px-4">
            <Link
              href="/market"
              className="flex h-[80px] w-full items-center justify-between overflow-hidden rounded-2xl bg-[#ffbb00] px-5 active:opacity-90"
            >
              <div>
                <p className="text-[20px] font-black leading-tight text-white">Каталог</p>
                <p className="text-[20px] font-black leading-tight text-white">акций</p>
              </div>
              <div className="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M13 3l8 9-8 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <div className="relative h-[70px] w-[70px]">
                  <Image src={figma.catalog} alt="" fill className="object-contain" unoptimized />
                </div>
              </div>
            </Link>
          </div>
        ) : null}

        {/* Random/featured products section */}
        {randomProducts.length > 0 ? (
          <div className="mb-4">
            <div className="mb-2 px-4">
              <h2 className="text-[16px] font-semibold text-[#151515]">Актуально всегда</h2>
            </div>
            <div className="-mx-1 flex gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {randomProducts.map((p) => {
                const line = getCartLine(Number(p.id));
                const idx = getCartIndex(Number(p.id));
                const step = line?.unit === "grams" ? 200 : 1;
                return (
                  <ProductCard
                    key={p.id}
                    product={p}
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
          </div>
        ) : null}

        {/* Fallback: all products when no promo/random available */}
        {promoProducts.length === 0 && randomProducts.length === 0 && allProducts.length === 0 ? (
          <div className="px-4 py-4 text-center text-[14px] text-[#949494]">
            Загрузка товаров…
          </div>
        ) : null}

        {/* Navigation links */}
        <nav className="mt-2 flex flex-col gap-1 border-t border-[#eee] px-4 pt-3 text-center text-[13px] text-[#046c6d]">
          {authStage !== "verified" ? (
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="py-1.5 underline-offset-2 hover:underline"
            >
              Регистрация / вход
            </button>
          ) : null}
          <Link href="/orders" className="py-1.5 underline-offset-2 hover:underline">Мои заказы</Link>
          <Link href="/courier" className="py-1.5 underline-offset-2 hover:underline">Курьер</Link>
          <Link href="/picker" className="py-1.5 underline-offset-2 hover:underline">Сборщик</Link>
        </nav>
      </div>

      <CartBar />
    </div>
  );
}
