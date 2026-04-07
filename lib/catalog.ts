import type { Product } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "Сыр President рассольный Greco",
    priceSum: 41_990,
    salePriceSum: 38_490,
    weight: "250 г",
    searchTerms: "сыр president greco",
  },
  {
    id: "p2",
    title: "Масло подсолнечное рафинированное",
    priceSum: 52_000,
    weight: "900 мл",
    searchTerms: "масло подсолнечное",
  },
  {
    id: "p3",
    title: "Молоко 3.2% пастеризованное",
    priceSum: 18_500,
    weight: "1 л",
    searchTerms: "молоко",
  },
  {
    id: "p4",
    title: "Хлеб белый нарезной",
    priceSum: 8_900,
    weight: "400 г",
    searchTerms: "хлеб",
  },
  {
    id: "p5",
    title: "Яйца куриные С1",
    priceSum: 28_000,
    weight: "10 шт",
    searchTerms: "яйца",
  },
  {
    id: "p6",
    title: "Вода минеральная газированная",
    priceSum: 12_000,
    weight: "1.5 л",
    searchTerms: "вода",
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function searchProducts(q: string): Product[] {
  const s = q.trim().toLowerCase();
  if (!s) return PRODUCTS;
  return PRODUCTS.filter(
    (p) =>
      p.title.toLowerCase().includes(s) ||
      p.searchTerms?.includes(s) ||
      p.weight.toLowerCase().includes(s),
  );
}
