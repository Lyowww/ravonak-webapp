"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getProduct } from "@/lib/catalog";
import type {
  CartLine,
  Order,
  SimCard,
  TransferRecord,
} from "@/lib/types";

const STORAGE_KEY = "ravonak-v1";

type AuthStage = "guest" | "pending_otp" | "verified";

type RavonakState = {
  balanceUsd: number;
  userName: string;
  userPhone: string;
  authStage: AuthStage;
  cart: CartLine[];
  transfers: TransferRecord[];
  simCards: SimCard[];
  orders: Order[];
};

const defaultOrders: Order[] = [
  {
    id: "123456",
    status: "new",
    recipient: "Ольга Картункова",
    phone: "+998 88 888 88 88",
    address:
      "г. Самарканд, ул. Буйук Ипак Йули 21, кв 13, подъезд 2, домофон Нет, этаж 3",
    itemsCount: 18,
    totalSum: 200_000,
    lines: [
      {
        productId: "p1",
        title: "Сыр President рассольный Greco",
        priceSum: 41_990,
        weight: "250г",
        qty: 1,
      },
      {
        productId: "p1",
        title: "Сыр President рассольный Greco",
        priceSum: 41_990,
        weight: "250г",
        qty: 5,
      },
    ],
  },
  {
    id: "123457",
    status: "new",
    recipient: "Ольга Картункова",
    phone: "+998 88 888 88 88",
    address:
      "г. Самарканд, ул. Буйук Ипак Йули 21, кв 13, подъезд 2, домофон Нет, этаж 3",
    itemsCount: 12,
    totalSum: 156_000,
    lines: [],
  },
];

const initial: RavonakState = {
  balanceUsd: 327,
  userName: "Ольга",
  userPhone: "",
  authStage: "guest",
  cart: [],
  transfers: [
    {
      id: "t1",
      kind: "debit",
      label: "Перевод",
      phone: "+998 88 888 88 88",
      amountUsd: 1000,
      date: "12.12.2026",
    },
    {
      id: "t2",
      kind: "credit",
      label: "Начисление",
      phone: "+998 88 888 88 88",
      amountUsd: 1000,
      date: "12.12.2026",
    },
  ],
  simCards: [],
  orders: defaultOrders,
};

type Ctx = RavonakState & {
  /** сум ≈ USD * rate for rough UI */
  sumPerUsd: number;
  setPendingPhone: (phone: string) => void;
  verifyOtp: (code: string) => boolean;
  logout: () => void;
  topUpUsd: (amount: number) => void;
  addToCart: (
    productId: string,
    qty: number,
    variantLabel?: string,
  ) => void;
  setCartQty: (index: number, qty: number) => void;
  removeCartLine: (index: number) => void;
  clearCart: () => void;
  cartTotalSum: number;
  cartTotalUsd: number;
  canCheckout: boolean;
  checkoutCart: () => void;
  transferUsd: (phone: string, amount: number) => boolean;
  addSimCard: (phone: string, plan: string) => void;
  acceptOrder: (orderId: string) => void;
  deliverOrder: (orderId: string) => void;
  pickerCompleteOrder: (orderId: string) => void;
};

const RavonakContext = createContext<Ctx | null>(null);

function priceForProduct(
  productId: string,
  variantLabel: string | undefined,
): { unit: number; label: string } {
  const p = getProduct(productId);
  if (!p) return { unit: 0, label: variantLabel || "" };
  const base = p.salePriceSum ?? p.priceSum;
  if (variantLabel === "400г") {
    return { unit: Math.round(base * 1.6), label: "400г" };
  }
  if (variantLabel === "1 шт") {
    return { unit: base, label: "1 шт" };
  }
  const label = variantLabel || p.weight;
  return { unit: base, label };
}

export function RavonakProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RavonakState>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as RavonakState;
          setState({
            ...initial,
            ...parsed,
            orders: parsed.orders?.length ? parsed.orders : initial.orders,
          });
        }
      } catch {
        /* ignore */
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const sumPerUsd = 12_500;

  const cartTotalSum = useMemo(
    () => state.cart.reduce((a, l) => a + l.lineTotalSum, 0),
    [state.cart],
  );

  const cartTotalUsd = useMemo(
    () => cartTotalSum / sumPerUsd,
    [cartTotalSum, sumPerUsd],
  );

  const canCheckout = useMemo(
    () =>
      state.cart.length > 0 && cartTotalUsd <= state.balanceUsd + 0.001,
    [state.cart.length, state.balanceUsd, cartTotalUsd],
  );

  const setPendingPhone = useCallback((phone: string) => {
    setState((s) => ({
      ...s,
      userPhone: phone,
      authStage: "pending_otp",
    }));
  }, []);

  const verifyOtp = useCallback((code: string) => {
    const ok = /^\d{4,6}$/.test(code) && code !== "0000";
    if (ok) {
      setState((s) => ({ ...s, authStage: "verified" }));
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, authStage: "guest", userPhone: "" }));
  }, []);

  const topUpUsd = useCallback((amount: number) => {
    if (amount <= 0) return;
    setState((s) => ({ ...s, balanceUsd: Math.round((s.balanceUsd + amount) * 100) / 100 }));
  }, []);

  const addToCart = useCallback(
    (productId: string, qty: number, variantLabel?: string) => {
      const { unit, label } = priceForProduct(productId, variantLabel);
      if (unit <= 0 || qty <= 0) return;
      setState((s) => {
        const lineTotalSum = unit * qty;
        const next = [...s.cart];
        const i = next.findIndex(
          (l) => l.productId === productId && l.variantLabel === label,
        );
        if (i >= 0) {
          next[i] = {
            ...next[i],
            qty: next[i].qty + qty,
            lineTotalSum: unit * (next[i].qty + qty),
          };
        } else {
          next.push({ productId, qty, variantLabel: label, lineTotalSum });
        }
        return { ...s, cart: next };
      });
    },
    [],
  );

  const setCartQty = useCallback((index: number, qty: number) => {
    setState((s) => {
      const line = s.cart[index];
      if (!line) return s;
      if (qty <= 0) {
        return { ...s, cart: s.cart.filter((_, i) => i !== index) };
      }
      const p = getProduct(line.productId);
      const unit =
        p != null
          ? (p.salePriceSum ?? p.priceSum)
          : line.lineTotalSum / Math.max(1, line.qty);
      return {
        ...s,
        cart: s.cart.map((l, i) =>
          i === index
            ? { ...l, qty, lineTotalSum: Math.round(unit * qty) }
            : l,
        ),
      };
    });
  }, []);

  const removeCartLine = useCallback((index: number) => {
    setState((s) => ({ ...s, cart: s.cart.filter((_, i) => i !== index) }));
  }, []);

  const clearCart = useCallback(() => {
    setState((s) => ({ ...s, cart: [] }));
  }, []);

  const checkoutCart = useCallback(() => {
    setState((s) => {
      if (s.cart.length === 0) return s;
      const totalUsd = s.cart.reduce(
        (a, l) => a + l.lineTotalSum / sumPerUsd,
        0,
      );
      if (totalUsd > s.balanceUsd + 0.01) return s;
      const lines = s.cart.map((c) => {
        const p = getProduct(c.productId)!;
        return {
          productId: c.productId,
          title: p.title,
          priceSum: p.salePriceSum ?? p.priceSum,
          weight: c.variantLabel,
          qty: c.qty,
        };
      });
      const order: Order = {
        id: String(100000 + Math.floor(Math.random() * 899999)),
        status: "new",
        recipient: s.userName,
        phone: s.userPhone || "+998 88 888 88 88",
        address:
          "г. Самарканд, ул. Буйук Ипак Йули 21, кв 13, подъезд 2, домофон Нет, этаж 3",
        itemsCount: s.cart.reduce((a, l) => a + l.qty, 0),
        totalSum: s.cart.reduce((a, l) => a + l.lineTotalSum, 0),
        lines,
      };
      return {
        ...s,
        cart: [],
        balanceUsd: Math.round((s.balanceUsd - totalUsd) * 100) / 100,
        orders: [order, ...s.orders],
      };
    });
  }, [sumPerUsd]);

  const transferUsd = useCallback((phone: string, amount: number) => {
    if (amount <= 0 || amount > state.balanceUsd) return false;
    const id = `t-${Date.now()}`;
    const date = new Date().toLocaleDateString("ru-RU");
    setState((s) => ({
      ...s,
      balanceUsd: Math.round((s.balanceUsd - amount) * 100) / 100,
      transfers: [
        {
          id,
          kind: "debit",
          label: "Перевод",
          phone,
          amountUsd: amount,
          date,
        },
        ...s.transfers,
      ],
    }));
    return true;
  }, [state.balanceUsd]);

  const addSimCard = useCallback((phone: string, plan: string) => {
    setState((s) => ({
      ...s,
      simCards: [
        ...s.simCards,
        { id: `sim-${Date.now()}`, phone, plan },
      ],
    }));
  }, []);

  const acceptOrder = useCallback((orderId: string) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === orderId && o.status === "picking"
          ? { ...o, status: "courier_assigned" as const }
          : o,
      ),
    }));
  }, []);

  const deliverOrder = useCallback((orderId: string) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === orderId && o.status === "courier_assigned"
          ? { ...o, status: "delivered" as const }
          : o,
      ),
    }));
  }, []);

  const pickerCompleteOrder = useCallback((orderId: string) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === orderId && o.status === "new"
          ? { ...o, status: "picking" as const }
          : o,
      ),
    }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      sumPerUsd,
      setPendingPhone,
      verifyOtp,
      logout,
      topUpUsd,
      addToCart,
      setCartQty,
      removeCartLine,
      clearCart,
      cartTotalSum,
      cartTotalUsd,
      canCheckout,
      checkoutCart,
      transferUsd,
      addSimCard,
      acceptOrder,
      deliverOrder,
      pickerCompleteOrder,
    }),
    [
      state,
      sumPerUsd,
      setPendingPhone,
      verifyOtp,
      logout,
      topUpUsd,
      addToCart,
      setCartQty,
      removeCartLine,
      clearCart,
      cartTotalSum,
      cartTotalUsd,
      canCheckout,
      checkoutCart,
      transferUsd,
      addSimCard,
      acceptOrder,
      deliverOrder,
      pickerCompleteOrder,
    ],
  );

  return (
    <RavonakContext.Provider value={value}>{children}</RavonakContext.Provider>
  );
}

export function useRavonak() {
  const c = useContext(RavonakContext);
  if (!c) throw new Error("useRavonak inside provider");
  return c;
}
