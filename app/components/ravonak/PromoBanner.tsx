import Image from "next/image";
import { figma } from "./assets";

type PromoBannerProps = {
  showBuy?: boolean;
  onBuy?: () => void;
};

export function PromoBanner({ showBuy, onBuy }: PromoBannerProps) {
  return (
    <div className="relative h-[154px] w-[358px] shrink-0 overflow-hidden rounded-2xl bg-[#c4d209]">
      <div className="pointer-events-none absolute left-0 top-[18px] h-[160.76px] w-full">
        <Image
          src={figma.promoBg}
          alt=""
          fill
          className="object-fill"
          unoptimized
        />
      </div>
      <div className="pointer-events-none absolute left-[192px] top-1/2 size-[166px] -translate-y-1/2">
        <div className="relative size-[216px] -translate-x-[25px] -translate-y-[25px]">
          <Image
            src={figma.promoEllipse}
            alt=""
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      </div>
      <div className="pointer-events-none absolute left-[207px] top-5 h-[125px] w-[83px]">
        <Image
          src={figma.product}
          alt=""
          fill
          className="object-cover"
          sizes="83px"
        />
      </div>
      <div className="pointer-events-none absolute left-[260px] top-5 h-[125px] w-[83px]">
        <Image
          src={figma.product}
          alt=""
          fill
          className="object-cover"
          sizes="83px"
        />
      </div>
      <div className="pointer-events-none absolute left-[232px] top-[9px] h-[136px] w-[91px]">
        <Image
          src={figma.product}
          alt=""
          fill
          className="object-cover"
          sizes="91px"
        />
      </div>
      <div className="absolute left-5 top-[18px] flex w-[105px] flex-col text-white">
        <p className="text-[24px] font-black leading-[22px]">АКЦИЯ</p>
        <p className="text-[16px] font-bold leading-[22px]">только 3 дня</p>
      </div>
      <p
        className={`absolute left-5 text-[24px] font-black leading-[22px] text-white ${showBuy ? "top-[83px]" : "top-[110px]"}`}
      >
        <span>19 990 </span>
        <span className="text-[24px] font-medium">сум</span>
      </p>
      {showBuy ? (
        <button
          type="button"
          onClick={onBuy}
          className="absolute left-5 top-[114px] flex w-[83px] items-center justify-center rounded-lg bg-white px-4 py-2 active:opacity-90"
        >
          <span className="text-[12px] font-medium text-[#046c6d]">Купить</span>
        </button>
      ) : null}
    </div>
  );
}
