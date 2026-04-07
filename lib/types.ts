export type Product = {
  id: string;
  title: string;
  priceSum: number;
  salePriceSum?: number;
  weight: string;
  /** API unit: `grams` | `pcs` | other */
  unit?: string;
  discountPercentage?: number;
  searchTerms?: string;
  imageUrl?: string | null;
};

export type CartLine = {
  basketItemId: number;
  productId: number;
  productName: string;
  unit: string;
  qty: number;
  lineTotalSum: number;
  imageUrl?: string | null;
};

export type TransferRecord = {
  id: string;
  kind: "debit" | "credit";
  label: string;
  phone: string;
  amountUsd: number;
  date: string;
};

export type SimCard = {
  id: string;
  phone: string;
  plan: string;
};

export type OrderStatus =
  | "new"
  | "picking"
  | "courier_assigned"
  | "delivered";

export type Order = {
  id: string;
  status: OrderStatus;
  recipient: string;
  phone: string;
  address: string;
  itemsCount: number;
  totalSum: number;
  lines: {
    productId: string;
    title: string;
    priceSum: number;
    weight: string;
    qty: number;
  }[];
};
