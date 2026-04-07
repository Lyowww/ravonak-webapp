"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { PRODUCTS } from "@/lib/catalog";
import { useRavonak } from "@/context/RavonakContext";
import { figma } from "@/app/components/ravonak/assets";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { ProductCard } from "@/app/components/ravonak/ProductCard";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export default function CatalogPage() {
  const router = useRouter();
  const { addToCart } = useRavonak();
  const { showToast } = useToast();
  const onSale = PRODUCTS.filter((p) => p.salePriceSum);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader backHref="/" title="Каталог акций" />
      <div className="relative mx-4 mt-3 h-[120px] overflow-hidden rounded-xl bg-[#fb0]">
        <div className="absolute left-3 top-3 text-[22px] font-black text-white">
          Акции
        </div>
        <div className="pointer-events-none absolute -right-2 -top-4 h-[140px] w-[200px]">
          <Image
            src={figma.catalog}
            alt=""
            fill
            className="object-cover"
            sizes="200px"
          />
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3 px-4 py-6">
        {onSale.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            sale
            onOpen={() => router.push(`/market/product/${p.id}`)}
            onAddToCart={() => {
              addToCart(p.id, 1);
              showToast("В корзине");
            }}
          />
        ))}
      </div>
    </div>
  );
}
