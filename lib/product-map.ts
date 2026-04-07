import type { ProductSchema } from "@/lib/api";
import type { Product } from "@/lib/types";

function unitLabel(unit: string): string {
  if (unit === "grams") return "г";
  if (unit === "pcs") return "шт";
  return unit;
}

export function productFromApi(p: ProductSchema): Product {
  const hasDiscount =
    p.old_price != null && p.old_price > p.price;
  return {
    id: String(p.id),
    title: p.name,
    priceSum: hasDiscount ? p.old_price! : p.price,
    salePriceSum: hasDiscount ? p.price : undefined,
    weight: p.shelf_life?.trim() ? p.shelf_life : unitLabel(p.unit),
    imageUrl: p.image_url,
  };
}
