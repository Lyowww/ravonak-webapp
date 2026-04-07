export type Product = {
  id: string;
  title: string;
  priceSum: number;
  salePriceSum?: number;
  weight: string;
  searchTerms?: string;
};

export type CartLine = {
  productId: string;
  qty: number;
  /** e.g. "250 г", "400г", "1 шт" */
  variantLabel: string;
  /** price per line item in сум (after qty) */
  lineTotalSum: number;
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
  lines: { productId: string; title: string; priceSum: number; weight: string; qty: number }[];
};
