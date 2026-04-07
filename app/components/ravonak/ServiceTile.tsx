import Image from "next/image";
import Link from "next/link";

type ServiceTileProps = {
  imageSrc: string;
  label: string;
  href?: string;
  onSelect?: () => void;
};

export function ServiceTile({
  imageSrc,
  label,
  href,
  onSelect,
}: ServiceTileProps) {
  const className =
    "flex w-full max-w-[165px] flex-col items-center gap-1 active:opacity-90";
  const inner = (
    <>
      <div className="relative h-[54px] w-full overflow-hidden rounded-2xl bg-[#eee]">
        <div className="absolute inset-x-0 -top-4 flex justify-center">
          <div className="relative h-[72px] w-[104px]">
            <Image
              src={imageSrc}
              alt=""
              fill
              className="object-cover object-top"
              sizes="165px"
            />
          </div>
        </div>
      </div>
      <p className="w-full text-center text-[11px] font-medium leading-none text-[#151515]">
        {label}
      </p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onSelect} className={className}>
      {inner}
    </button>
  );
}
