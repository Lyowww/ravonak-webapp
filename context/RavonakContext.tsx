"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addCartItem,
  authCheck,
  authSendCodeDebug,
  authVerifyCode,
  deleteCartItem,
  getCart,
  getMainScreen,
  type MainScreenResponse,
  updateCartItem,
} from "@/lib/api";
import { normalizeUzPhone } from "@/lib/phone";
import { resolveTgId } from "@/lib/telegram";
import type { CartLine } from "@/lib/types";

type AuthStage = "guest" | "pending_otp" | "verified";

type RavonakState = {
  balanceUsd: number;
  userName: string;
  userPhone: string;
  authStage: AuthStage;
  cart: CartLine[];
  mainScreen: MainScreenResponse | null;
  role: string | null;
};

const initial: RavonakState = {
  balanceUsd: 0,
  userName: "",
  userPhone: "",
  authStage: "guest",
  cart: [],
  mainScreen: null,
  role: null,
};

function mapCartItems(items: {
  basket_item_id: number;
  product_id: number;
  product_name: string;
  unit: string;
  amount: number;
  price_sum: number;
  image_url?: string | null;
}[]): CartLine[] {
  return items.map((i) => ({
    basketItemId: i.basket_item_id,
    productId: i.product_id,
    productName: i.product_name,
    unit: i.unit,
    qty: i.amount,
    lineTotalSum: i.price_sum,
    imageUrl: i.image_url,
  }));
}

type Ctx = RavonakState & {
  tgId: number | null;
  ready: boolean;
  isRegistered: boolean;
  sumPerUsd: number;
  setPendingPhone: (phoneE164: string) => void;
  sendSmsCode: (
    rawPhone: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  verifyOtp: (
    code: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
  refreshMainScreen: () => Promise<void>;
  refreshCart: () => Promise<void>;
  refreshBootstrap: () => Promise<void>;
  addToCart: (productId: number, amount: number) => Promise<void>;
  setCartQty: (index: number, qty: number) => Promise<void>;
  removeCartLine: (index: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotalSum: number;
  cartTotalUsd: number;
  canCheckout: boolean;
};

const RavonakContext = createContext<Ctx | null>(null);

export function RavonakProvider({ children }: { children: React.ReactNode }) {
  const [tgId, setTgId] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [state, setState] = useState<RavonakState>(initial);

  const applyCartResponse = useCallback((c: { items: Parameters<typeof mapCartItems>[0]; total_sum?: number }) => {
    setState((s) => ({ ...s, cart: mapCartItems(c.items) }));
  }, []);

  const refreshCart = useCallback(async () => {
    if (tgId == null || state.authStage !== "verified") return;
    const c = await getCart(tgId);
    applyCartResponse(c);
  }, [tgId, state.authStage, applyCartResponse]);

  const refreshMainScreen = useCallback(async () => {
    if (tgId == null || state.authStage !== "verified") return;
    const main = await getMainScreen(tgId);
    setState((s) => ({
      ...s,
      mainScreen: main,
      balanceUsd: main.balance_usd,
      userName: main.user_name,
    }));
  }, [tgId, state.authStage]);

  const bootstrap = useCallback(async () => {
    const id = resolveTgId();
    setTgId(id);
    if (id == null) {
      setReady(true);
      return;
    }
    try {
      const r = await authCheck({ tg_id: id });
      if (r.success && r.is_registered) {
        setIsRegistered(true);
        const main = await getMainScreen(id);
        const cart = await getCart(id);
        setState({
          balanceUsd: main.balance_usd,
          userName: main.user_name,
          userPhone: r.phone_number ?? "",
          authStage: "verified",
          cart: mapCartItems(cart.items),
          mainScreen: main,
          role: r.role ?? null,
        });
      } else {
        setIsRegistered(false);
        setState((s) => ({ ...s, authStage: "guest", cart: [], mainScreen: null }));
      }
    } catch {
      setIsRegistered(false);
      setState((s) => ({ ...s, authStage: "guest" }));
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void bootstrap();
    });
  }, [bootstrap]);

  const refreshBootstrap = useCallback(async () => {
    setReady(false);
    await bootstrap();
  }, [bootstrap]);

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

  const setPendingPhone = useCallback((phoneE164: string) => {
    setState((s) => ({
      ...s,
      userPhone: phoneE164,
      authStage: "pending_otp",
    }));
  }, []);

  const sendSmsCode = useCallback(
    async (rawPhone: string) => {
      const phone = normalizeUzPhone(rawPhone);
      if (!phone) {
        return { ok: false, error: "Не верный формат номера телефона" } as const;
      }
      try {
        const r = await authSendCodeDebug({ phone_number: phone });
        if (r.success) {
          setPendingPhone(phone);
          return { ok: true } as const;
        }
        return {
          ok: false,
          error: r.message || "Не удалось отправить код",
        } as const;
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : "Не удалось отправить код",
        } as const;
      }
    },
    [setPendingPhone],
  );

  const verifyOtp = useCallback(
    async (
      code: string,
    ): Promise<{ ok: true } | { ok: false; error: string }> => {
      const id = tgId ?? resolveTgId();
      if (id == null) return { ok: false, error: "Нет Telegram ID" };
      const phone = normalizeUzPhone(state.userPhone);
      if (!phone) return { ok: false, error: "Неверный номер телефона" };
      const tgUser =
        typeof window !== "undefined"
          ? (
              window as unknown as {
                Telegram?: {
                  WebApp?: {
                    initDataUnsafe?: {
                      user?: {
                        first_name?: string;
                        last_name?: string;
                        username?: string;
                      };
                    };
                  };
                };
              }
            ).Telegram?.WebApp?.initDataUnsafe?.user
          : undefined;
      try {
        const r = await authVerifyCode({
          phone_number: phone,
          code,
          tg_id: id,
          name: tgUser?.first_name ?? "User",
          surname: tgUser?.last_name ?? null,
          username: tgUser?.username ?? null,
        });
        if (r.success) {
          setIsRegistered(true);
          const main = await getMainScreen(id);
          const cart = await getCart(id);
          setState((s) => ({
            ...s,
            authStage: "verified",
            userName: main.user_name,
            userPhone: r.phone_number ?? phone,
            balanceUsd: main.balance_usd,
            cart: mapCartItems(cart.items),
            mainScreen: main,
            role: r.role ?? null,
          }));
          return { ok: true };
        }
        return { ok: false, error: r.message || "Код не принят" };
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Не удалось подтвердить код";
        return { ok: false, error: msg };
      }
    },
    [tgId, state.userPhone],
  );

  const logout = useCallback(() => {
    setIsRegistered(false);
    setState({
      ...initial,
      authStage: "guest",
    });
  }, []);

  const addToCart = useCallback(
    async (productId: number, amount: number) => {
      const id = tgId ?? resolveTgId();
      if (id == null || amount <= 0) return;
      const c = await addCartItem({ tg_id: id, product_id: productId, amount });
      applyCartResponse(c);
    },
    [tgId, applyCartResponse],
  );

  const setCartQty = useCallback(
    async (index: number, qty: number) => {
      const id = tgId ?? resolveTgId();
      if (id == null) return;
      const line = state.cart[index];
      if (!line) return;
      if (qty <= 0) {
        const c = await deleteCartItem(line.basketItemId, id);
        applyCartResponse(c);
        return;
      }
      const c = await updateCartItem(line.basketItemId, id, qty);
      applyCartResponse(c);
    },
    [tgId, state.cart, applyCartResponse],
  );

  const removeCartLine = useCallback(
    async (index: number) => {
      const id = tgId ?? resolveTgId();
      if (id == null) return;
      const line = state.cart[index];
      if (!line) return;
      const c = await deleteCartItem(line.basketItemId, id);
      applyCartResponse(c);
    },
    [tgId, state.cart, applyCartResponse],
  );

  const clearCart = useCallback(async () => {
    const id = tgId ?? resolveTgId();
    if (id == null) return;
    for (const line of state.cart) {
      await deleteCartItem(line.basketItemId, id);
    }
    const c = await getCart(id);
    applyCartResponse(c);
  }, [tgId, state.cart, applyCartResponse]);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      tgId,
      ready,
      isRegistered,
      sumPerUsd,
      setPendingPhone,
      sendSmsCode,
      verifyOtp,
      logout,
      refreshMainScreen,
      refreshCart,
      refreshBootstrap,
      addToCart,
      setCartQty,
      removeCartLine,
      clearCart,
      cartTotalSum,
      cartTotalUsd,
      canCheckout,
    }),
    [
      state,
      tgId,
      ready,
      isRegistered,
      sumPerUsd,
      setPendingPhone,
      sendSmsCode,
      verifyOtp,
      logout,
      refreshMainScreen,
      refreshCart,
      refreshBootstrap,
      addToCart,
      setCartQty,
      removeCartLine,
      clearCart,
      cartTotalSum,
      cartTotalUsd,
      canCheckout,
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
