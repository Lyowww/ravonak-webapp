"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { PRODUCTS, getProduct } from "@/lib/catalog";
import { useRavonak } from "@/context/RavonakContext";
import { figma } from "./assets";
import { ProductCard } from "./ProductCard";
import { PromoBanner } from "./PromoBanner";
import { ServiceTile } from "./ServiceTile";
import { useToast } from "./ToastProvider";

export function HomeScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { userName, balanceUsd, addToCart, cart } = useRavonak();
  const [homeSearch, setHomeSearch] = useState("");

  const goSearch = useCallback(() => {
    const q = homeSearch.trim();
    if (q) router.push(`/market/search?q=${encodeURIComponent(q)}`);
    else router.push("/market/search");
  }, [homeSearch, router]);

  const p1 = getProduct("p1");
  const p2 = getProduct("p2");

  return (
    <div className="relative min-h-0 flex-1 bg-white">
      <div className="relative px-6 pb-8 pt-3">
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
                <p className="font-medium">{userName} !</p>
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
              {balanceUsd} $
            </p>
          </div>
        </div>

        <div className="mx-auto mb-5 grid w-full max-w-[342px] grid-cols-2 gap-x-3 gap-y-4">
          <ServiceTile
            imageSrc={figma.grocery}
            label="Доставка продуктов"
            href="/market"
          />
          <ServiceTile
            imageSrc={figma.money}
            label="Доставка денег"
            href="/money-delivery"
          />
          <Link
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
          </Link>
          <ServiceTile
            imageSrc={figma.transfer}
            label="Перевести баланс"
            href="/transfer"
          />
        </div>

        <div className="relative -mx-2 mb-5 h-[154px] w-[calc(100%+1rem)] overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth [-webkit-overflow-scrolling:touch]">
          <div className="flex w-max snap-x snap-mandatory gap-4 px-[calc(50%-179px)] pb-2 pt-0">
            <div className="snap-center shrink-0">
              <PromoBanner
                showBuy
                onBuy={() => {
                  addToCart("p1", 1);
                  showToast("Акция добавлена в корзину");
                }}
              />
            </div>
            <div className="snap-center shrink-0">
              <PromoBanner />
            </div>
            <div className="snap-center shrink-0">
              <PromoBanner
                showBuy
                onBuy={() => {
                  addToCart("p1", 1);
                  showToast("Акция добавлена в корзину");
                }}
              />
            </div>
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
            <ProductCard
              product={p1}
              onAddToCart={() => {
                addToCart("p1", 1);
                showToast("Добавлено в корзину");
              }}
            />
            <ProductCard
              product={p2}
              onAddToCart={() => {
                addToCart("p2", 1);
                showToast("Добавлено в корзину");
              }}
            />
            <ProductCard
              product={PRODUCTS[2]}
              showPlaceholder
              onAddToCart={() => {
                addToCart(PRODUCTS[2]!.id, 1);
                showToast("Добавлено в корзину");
              }}
            />
            <ProductCard
              product={PRODUCTS[3]}
              onAddToCart={() => {
                addToCart(PRODUCTS[3]!.id, 1);
                showToast("Добавлено в корзину");
              }}
            />
          </div>
        </div>

        <Link
          href="/catalog"
          className="relative mb-5 flex h-[93px] w-full max-w-[358px] overflow-hidden rounded-xl bg-[#fb0] active:opacity-95"
        >
          <div className="absolute left-3 top-2.5 text-left text-[24px] font-black leading-none text-white">
            <span className="block">Каталог</span>
            <span className="block">акций</span>
          </div>
          <div className="pointer-events-none absolute -top-[22px] right-0 h-[167px] w-[251px]">
            <Image
              src={figma.catalog}
              alt=""
              fill
              className="object-cover object-left"
              sizes="251px"
            />
          </div>
        </Link>

        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[p1, p1, p1, p1].map((_, i) => (
            <ProductCard
              key={i}
              product={p1}
              sale
              onAddToCart={() => {
                addToCart("p1", 1);
                showToast("Добавлено в корзину");
              }}
            />
          ))}
        </div>

        <nav className="flex flex-col gap-2 border-t border-[#eee] pt-4 text-center text-[13px] text-[#046c6d]">
          <Link href="/register" className="py-1 underline-offset-2 hover:underline">
            Регистрация / вход
          </Link>
          <Link href="/courier" className="py-1 underline-offset-2 hover:underline">
            Курьер
          </Link>
          <Link href="/picker" className="py-1 underline-offset-2 hover:underline">
            Сборщик
          </Link>
          {cart.length > 0 ? (
            <Link
              href="/market/cart"
              className="py-2 font-medium text-[#151515] underline-offset-2 hover:underline"
            >
              Корзина ({cart.length})
            </Link>
          ) : null}
        </nav>
      </div>
    </div>
  );
}
