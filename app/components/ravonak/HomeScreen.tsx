"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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
            searchProductsApi({ q: "", limit: 12 }),
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
              old_price: p.old_price,
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
      return () => {
        cancelled = true;
      };
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
    return () => {
      cancelled = true;
    };
  }, [authStage, tgId]);

  const goSearch = useCallback(() => {
    const q = homeSearch.trim();
    if (q) router.push(`/market/search?q=${encodeURIComponent(q)}`);
    else router.push("/market/search");
  }, [homeSearch, router]);

  const promoRow = useMemo(() => {
    const m = main;
    if (!m) return [];
    const list: Product[] = [];
    for (const p of m.promo_products) {
      list.push(productFromApi(p));
    }
    for (const p of m.random_products) {
      if (list.length >= 15) break;
      list.push(productFromApi(p));
    }
    return list.slice(0, 15);
  }, [main]);

  const displayName =
    authStage === "verified" ? userName || "Пользователь" : "Гость";

  const addWithAuth = useCallback(
    (productId: number) => {
      if (authStage !== "verified") {
        openSheet("auth-phone");
        return;
      }
      void addToCart(productId, 1);
      showToast("Добавлено в корзину");
    },
    [authStage, addToCart, showToast, openSheet],
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-white">
      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-4 pt-3">
        {activeOrder?.order_number ? (
          <button
            type="button"
            onClick={() =>
              openSheet("order", { order: activeOrder.order_number! })
            }
            className="mb-4 w-full rounded-xl border border-[#046c6d]/30 bg-[#e8f5f5] px-4 py-3 text-left text-[13px] text-[#151515] active:opacity-90"
          >
            <p className="font-medium">
              Заказ {activeOrder.order_number}
              {activeOrder.status ? ` · ${activeOrder.status}` : ""}
            </p>
            {activeOrder.total_sum_uzs != null ? (
              <p className="text-[#949494]">
                {activeOrder.total_sum_uzs.toLocaleString("ru-RU")} сум
              </p>
            ) : null}
            <p className="mt-1 text-[12px] text-[#046c6d]">Подробнее →</p>
          </button>
        ) : null}

        <div className="relative mb-8 flex h-[195px] w-full flex-col items-center gap-10 overflow-hidden pb-9 pt-3">
          <div className="pointer-events-none absolute inset-0 opacity-50">
            <Image
              src={figma.balanceMask}
              alt=""
              fill
              className="object-cover object-top"
              unoptimized
            />
          </div>
          <div className="relative z-[1] flex w-full max-w-[358px] items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="relative size-8 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={figma.avatar}
                  alt=""
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <div className="text-[12px] leading-[1.3] tracking-[0.24px] text-[#151515]">
                <p className="font-light">Здравствуйте,</p>
                <p className="font-medium">{displayName} !</p>
              </div>
            </div>
            <Link
              href="/top-up"
              className="flex h-9 w-[162px] shrink-0 items-center justify-center gap-2.5 rounded-[30px] bg-[#046c6d] px-2.5 active:opacity-90"
            >
              <Image
                src={figma.plus}
                alt=""
                width={8}
                height={8}
                unoptimized
                className="h-2 w-2"
              />
              <span className="whitespace-nowrap text-[12px] font-medium tracking-[0.24px] text-white">
                Пополнить баланс
              </span>
            </Link>
          </div>
          <div className="relative z-[1] flex w-full max-w-[342px] flex-col items-center gap-2">
            <p className="text-[14px] font-medium tracking-[0.28px] text-[#949494]">
              <span className="font-normal tracking-[0.32px]">В</span>
              <span className="font-normal">аш баланс</span>
            </p>
            <p className="text-center text-[48px] font-bold leading-none text-[#046c6d]">
              {authStage === "verified" ? balanceUsd : 0} $
            </p>
          </div>
        </div>

        <div className="mx-auto mb-5 grid w-full max-w-[342px] grid-cols-2 gap-x-3 gap-y-4">
          {main && main.sections.length > 0
            ? main.sections.map((s) => (
                <ServiceTile
                  key={s.id}
                  imageSrc={s.icon_url || figma.grocery}
                  label={s.name}
                  href={`/market/chapter/${s.id}`}
                />
              ))
            : [
                <ServiceTile
                  key="g"
                  imageSrc={figma.grocery}
                  label="Доставка продуктов"
                  href="/market"
                />,
                <ServiceTile
                  key="m"
                  imageSrc={figma.money}
                  label="Доставка денег"
                  href="/money-delivery"
                />,
                <Link
                  key="sim"
                  href="/sim"
                  className="flex w-full max-w-[165px] flex-col items-center gap-1 active:opacity-90"
                >
                  <div className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-[#eee]">
                    <span className="text-[11px] font-semibold tracking-wide text-[#046c6d]">
                      SIM
                    </span>
                  </div>
                  <p className="w-full text-center text-[11px] font-medium leading-none text-[#151515]">
                    Оплатить SIM-карту
                  </p>
                </Link>,
                <ServiceTile
                  key="t"
                  imageSrc={figma.transfer}
                  label="Перевести баланс"
                  href="/transfer"
                />,
              ]}
        </div>

        <div className="relative -mx-2 mb-5 h-[min(154px,22vw)] min-h-[120px] w-[calc(100%+1rem)] overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth [-webkit-overflow-scrolling:touch]">
          <div className="flex w-max snap-x snap-mandatory gap-4 px-4 pb-2 pt-0 sm:px-[calc(50%-min(179px,45vw))]">
            {main && main.banners.length > 0
              ? main.banners.slice(0, 3).map((b) => (
                  <div
                    key={b.id}
                    className="pointer-events-none relative h-[min(154px,22vw)] min-h-[120px] w-[min(358px,85vw)] shrink-0 snap-center overflow-hidden rounded-2xl bg-[#c4d209]"
                  >
                    <Image
                      src={b.image_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width:640px) 85vw, 358px"
                      unoptimized
                    />
                    <div className="pointer-events-none absolute left-5 top-5 z-[1] max-w-[200px] text-white">
                      {b.title ? (
                        <p className="text-[18px] font-bold leading-tight">{b.title}</p>
                      ) : null}
                      {b.description ? (
                        <p className="mt-1 text-[14px] opacity-95">{b.description}</p>
                      ) : null}
                    </div>
                  </div>
                ))
              : (
                  ["p1", "p2", "p3"] as const
                ).map((k) => (
                  <div key={k} className="pointer-events-none snap-center shrink-0">
                    <PromoBanner />
                  </div>
                ))}
          </div>
        </div>

        <div className="mb-3 flex w-full max-w-[358px] flex-col gap-3">
          <div className="w-full rounded-xl bg-[#eee] px-3 py-2">
            <label className="flex items-center gap-3">
              <Image
                src={figma.search}
                alt=""
                width={20}
                height={20}
                unoptimized
                className="shrink-0"
              />
              <input
                type="search"
                value={homeSearch}
                onChange={(e) => setHomeSearch(e.target.value)}
                placeholder="Найти в магазине"
                className="min-w-0 flex-1 bg-transparent text-[14px] font-normal leading-[1.19] text-[#151515] placeholder:text-[#949494] focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") goSearch();
                }}
              />
            </label>
          </div>

          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {promoRow.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpen={() => router.push(`/market/product/${p.id}`)}
                onAddToCart={() => addWithAuth(Number(p.id))}
              />
            ))}
          </div>
        </div>

        <nav className="flex flex-col gap-2 border-t border-[#eee] pt-4 text-center text-[13px] text-[#046c6d]">
          {authStage !== "verified" ? (
            <button
              type="button"
              onClick={() => openSheet("auth-phone")}
              className="py-1 underline-offset-2 hover:underline"
            >
              Регистрация / вход
            </button>
          ) : null}
          <Link href="/orders" className="py-1 underline-offset-2 hover:underline">
            Мои заказы
          </Link>
          <Link href="/courier" className="py-1 underline-offset-2 hover:underline">
            Курьер
          </Link>
          <Link href="/picker" className="py-1 underline-offset-2 hover:underline">
            Сборщик
          </Link>
          {cart.length > 0 ? (
            <button
              type="button"
              onClick={() => openSheet("cart")}
              className="py-2 font-medium text-[#151515] underline-offset-2 hover:underline"
            >
              Корзина ({cart.length})
            </button>
          ) : null}
        </nav>
      </div>
      <CartBar backHref="/" />
    </div>
  );
}
