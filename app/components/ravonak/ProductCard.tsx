import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatSum } from "@/lib/format";
import { figma } from "./assets";

type ProductCardProps = {
  product?: Product;
  sale?: boolean;
  showPlaceholder?: boolean;
  onOpen?: () => void;
  onAddToCart: () => void;
  /** Grid mode: fills column width instead of fixed 106px */
  grid?: boolean;
  /** Cart qty — when > 0, shows - qty + controls instead of "В корзину" */
  cartQty?: number;
  cartUnit?: string;
  onCartMinus?: () => void;
  onCartPlus?: () => void;
};

function formatQty(qty: number, unit?: string) {
  if (unit === "grams") return `${qty}г`;
  return String(qty);
}

export function ProductCard({
  product,
  sale: saleProp,
  showPlaceholder,
  onOpen,
  onAddToCart,
  grid = false,
  cartQty,
  cartUnit,
  onCartMinus,
  onCartPlus,
}: ProductCardProps) {
  const sale = saleProp ?? Boolean(product?.salePriceSum);
  const title = product?.title ?? "Товар";
  const weight = product?.weight ?? "";
  const price = product?.priceSum ?? 0;
  const salePrice = product?.salePriceSum ?? price;
  const remoteUrl = product?.imageUrl?.startsWith("http") ? product.imageUrl : null;
  const inCart = typeof cartQty === "number" && cartQty > 0;

  const cardClass = grid
    ? "relative flex flex-col overflow-hidden rounded-xl bg-[#f7f7f7]"
    : "relative h-[244px] w-[106px] shrink-0 overflow-hidden rounded-lg bg-[#eee]";

  if (grid) {
    return (
      <div
        role={onOpen ? "button" : undefined}
        tabIndex={onOpen ? 0 : undefined}
        onClick={onOpen}
        onKeyDown={
          onOpen
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen();
                }
              }
            : undefined
        }
        className={`${cardClass} ${onOpen ? "cursor-pointer" : ""}`}
      >
        {/* Image */}
        <div className="relative w-full bg-[#ececec]" style={{ aspectRatio: "1/1" }}>
          {showPlaceholder ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Image src={figma.placeholder} alt="" width={40} height={40} unoptimized className="object-contain" />
            </div>
          ) : remoteUrl ? (
            <Image src={remoteUrl} alt="" fill className="object-contain p-1" sizes="(max-width:640px) 33vw, 160px" unoptimized />
          ) : (
            <Image src={figma.product} alt="" fill className="object-contain p-1" sizes="(max-width:640px) 33vw, 160px" />
          )}
          {sale && product?.discountPercentage ? (
            <div className="absolute left-1 top-1 rounded bg-[#c83030] px-1 py-0.5">
              <span className="text-[10px] font-bold text-white">-{product.discountPercentage}%</span>
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-0.5 px-2 pb-2 pt-1.5">
          {sale ? (
            <div className="flex flex-col gap-0">
              <span className="text-[10px] font-medium text-[#c83030] line-through">{formatSum(price)} сум</span>
              <span className="text-[13px] font-bold leading-tight text-[#151515]">{formatSum(salePrice)} сум</span>
            </div>
          ) : (
            <span className="text-[13px] font-bold leading-tight text-[#151515]">{formatSum(price)} сум</span>
          )}
          <span className="line-clamp-2 text-[11px] leading-tight text-[#151515]">{title}</span>
          {weight ? <span className="text-[10px] text-[#949494]">{weight}</span> : null}

          {/* Cart controls */}
          <div className="mt-1.5">
            {inCart ? (
              <div
                className="flex items-center justify-between rounded-lg bg-white px-2 py-1.5 shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="flex size-6 items-center justify-center rounded text-[16px] font-bold text-[#151515] active:opacity-60"
                  onClick={(e) => { e.stopPropagation(); onCartMinus?.(); }}
                >
                  −
                </button>
                <span className="text-[12px] font-medium text-[#151515]">{formatQty(cartQty!, cartUnit)}</span>
                <button
                  type="button"
                  className="flex size-6 items-center justify-center rounded text-[16px] font-bold text-[#151515] active:opacity-60"
                  onClick={(e) => { e.stopPropagation(); onCartPlus?.(); }}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
                className="w-full rounded-lg bg-white py-1.5 text-[12px] font-normal text-[#151515] shadow-sm active:opacity-80"
              >
                В корзину
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Scroll / default mode (original design, 106px wide)
  return (
    <div
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={
        onOpen
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen();
              }
            }
          : undefined
      }
      className={`${cardClass} ${onOpen ? "cursor-pointer" : ""}`}
    >
      {/* Add to cart / qty controls at bottom */}
      {inCart ? (
        <div
          className="absolute bottom-2 left-1/2 z-[1] flex w-[98px] -translate-x-1/2 items-center justify-between rounded-lg bg-white px-1.5 py-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="flex size-6 items-center justify-center text-[16px] font-bold text-[#151515] active:opacity-60"
            onClick={(e) => { e.stopPropagation(); onCartMinus?.(); }}
          >
            −
          </button>
          <span className="text-[12px] font-medium text-[#151515]">{formatQty(cartQty!, cartUnit)}</span>
          <button
            type="button"
            className="flex size-6 items-center justify-center text-[16px] font-bold text-[#151515] active:opacity-60"
            onClick={(e) => { e.stopPropagation(); onCartPlus?.(); }}
          >
            +
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(); }}
          className="absolute bottom-2 left-1/2 z-[1] flex w-[98px] -translate-x-1/2 items-center justify-center rounded-lg bg-white px-2.5 py-1.5 active:opacity-90"
        >
          <span className="text-[12px] font-normal leading-[1.3] tracking-[0.12px] text-[#151515]">В корзину</span>
        </button>
      )}

      <div className="absolute left-0 top-1 flex w-[106px] flex-col items-center gap-1.5">
        <div className="relative h-[105px] w-full shrink-0 bg-[#e8e8e8]">
          {showPlaceholder ? (
            <div className="absolute left-1/2 top-1/2 size-[46px] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
              <Image src={figma.placeholder} alt="" width={46} height={46} unoptimized className="object-contain" />
            </div>
          ) : remoteUrl ? (
            <Image src={remoteUrl} alt="" fill className="object-contain p-1" sizes="106px" unoptimized />
          ) : (
            <Image src={figma.product} alt="" fill className="object-contain" sizes="106px" priority={false} />
          )}
          {sale && product?.discountPercentage ? (
            <div className="absolute left-1 top-1 rounded bg-[#c83030] px-1 py-0.5">
              <span className="text-[9px] font-bold text-white">-{product.discountPercentage}%</span>
            </div>
          ) : null}
        </div>
        <div className="flex w-[93px] flex-col items-start gap-1 not-italic">
          {sale ? (
            <>
              <span className="w-full text-[8px] font-medium leading-none text-[#c83030] line-through">
                {formatSum(price)} сум
              </span>
              <span className="text-[14px] font-bold leading-none text-[#151515]">
                {formatSum(salePrice)} сум
              </span>
            </>
          ) : (
            <span className="w-full text-[14px] font-bold leading-none text-[#151515]">
              {formatSum(price)} сум
            </span>
          )}
          <span className="line-clamp-3 text-[12px] font-normal leading-[1.3] tracking-[0.12px] text-[#151515]">
            {title}
          </span>
          {weight ? (
            <span className="text-[11px] font-normal leading-[1.3] tracking-[0.11px] text-[#949494]">
              {weight}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
