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
  const remote = imageSrc.startsWith("http");
  const inner = (
    <>
      <div className="relative h-[60px] w-[100px] overflow-hidden rounded-2xl bg-[#eee]">
        <div className="absolute inset-x-0 -top-3 flex justify-center">
          <div className="relative h-[76px] w-[108px]">
            <Image
              src={imageSrc}
              alt=""
              fill
              className="object-cover object-top"
              sizes="108px"
              unoptimized={remote}
            />
          </div>
        </div>
      </div>
      <p className="w-[100px] text-center text-[11px] font-medium leading-tight text-[#151515]">
        {label}
      </p>
    </>
  );

  const className = "flex flex-col items-center gap-1.5 active:opacity-90";

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
