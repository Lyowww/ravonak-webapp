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
};

export function ProductCard({
  product,
  sale: saleProp,
  showPlaceholder,
  onOpen,
  onAddToCart,
}: ProductCardProps) {
  const sale = saleProp ?? Boolean(product?.salePriceSum);
  const title = product?.title ?? "Сыр President рассольный Greco";
  const weight = product?.weight ?? "250 г";
  const price = product?.priceSum ?? 41_990;
  const salePrice = product?.salePriceSum ?? 38_490;

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
      className={`relative h-[244px] w-[106px] shrink-0 overflow-hidden rounded-lg bg-[#eee] ${onOpen ? "cursor-pointer" : ""}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAddToCart();
        }}
        className="absolute bottom-2 left-1/2 z-[1] flex w-[98px] -translate-x-1/2 items-center justify-center rounded-lg bg-white px-2.5 py-1.5 active:opacity-90"
      >
        <span className="text-[12px] font-normal leading-[1.3] tracking-[0.12px] text-[#151515]">
          В корзину
        </span>
      </button>
      <div className="absolute left-0 top-1 flex w-[106px] flex-col items-center gap-1.5">
        <div className="relative h-[105px] w-full shrink-0 bg-[#e8e8e8]">
          {showPlaceholder ? (
            <div className="absolute left-1/2 top-1/2 size-[46px] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
              <Image
                src={figma.placeholder}
                alt=""
                width={46}
                height={46}
                unoptimized
                className="object-contain"
              />
            </div>
          ) : (
            <Image
              src={figma.product}
              alt=""
              fill
              className="object-contain"
              sizes="106px"
              priority={false}
            />
          )}
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
          <span className="text-[11px] font-normal leading-[1.3] tracking-[0.11px] text-[#949494]">
            {weight}
          </span>
        </div>
      </div>
    </div>
  );
}
