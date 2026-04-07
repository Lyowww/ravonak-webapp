"use client";

import Image from "next/image";
import { useCallback } from "react";
import { formatSum } from "@/lib/format";
import { useRavonak } from "@/context/RavonakContext";
import { useAppSheets } from "@/hooks/useAppSheets";
import { useTelegramMainButton } from "@/hooks/useTelegramMainButton";
import { SheetModal } from "@/app/components/ravonak/SheetModal";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export function CartSheet() {
  const {
    cart,
    cartTotalSum,
    cartTotalUsd,
    balanceUsd,
    authStage,
    setCartQty,
    removeCartLine,
    clearCart,
    canCheckout,
  } = useRavonak();
  const { closeSheet, replaceSheet } = useAppSheets();
  const { showToast } = useToast();

  const goCheckout = useCallback(() => {
    if (!canCheckout) {
      showToast("Недостаточно средств на балансе");
      return;
    }
    replaceSheet("checkout");
  }, [canCheckout, replaceSheet, showToast]);

  const showMain =
    authStage === "verified" &&
    cart.length > 0 &&
    canCheckout;

  useTelegramMainButton(showMain, "Оформить заказ", false, goCheckout);

  if (authStage !== "verified") {
    return (
      <SheetModal title="Корзина" onClose={closeSheet}>
        <p className="py-4 text-center text-[#949494]">
          Войдите через регистрацию, чтобы пользоваться корзиной.
        </p>
        <button
          type="button"
          onClick={() => replaceSheet("auth-phone")}
          className="w-full rounded-2xl bg-[#046c6d] py-3 text-[16px] font-medium text-white"
        >
          Регистрация / вход
        </button>
      </SheetModal>
    );
  }

  return (
    <SheetModal title="Корзина" onClose={closeSheet}>
      {cart.length === 0 ? (
        <p className="py-10 text-center text-[#949494]">Корзина пуста</p>
      ) : (
        <>
          <ul className="space-y-3 pb-4">
            {cart.map((line, i) => (
              <li
                key={line.basketItemId}
                className="flex gap-3 rounded-xl border border-[#eee] p-3"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[#eee]">
                  {line.imageUrl?.startsWith("http") ? (
                    <Image
                      src={line.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-[#151515]">
                    {line.productName}
                  </p>
                  <p className="text-[12px] text-[#949494]">
                    {line.unit} · {line.qty}
                  </p>
                  <p className="mt-1 text-[14px] font-bold">
                    {formatSum(line.lineTotalSum)} сум
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="size-8 rounded-lg bg-[#eee] text-[16px]"
                      onClick={() => void setCartQty(i, line.qty - 1)}
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-[14px]">{line.qty}</span>
                    <button
                      type="button"
                      className="size-8 rounded-lg bg-[#eee] text-[16px]"
                      onClick={() => void setCartQty(i, line.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-[12px] text-[#c83030]"
                    onClick={() => void removeCartLine(i)}
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mb-4 text-[13px] text-[#046c6d]"
            onClick={() => {
              void clearCart();
              showToast("Корзина очищена");
            }}
          >
            Очистить корзину
          </button>
          <div className="border-t border-[#eee] pt-4">
            <p className="mb-1 text-[12px] text-[#949494]">
              Баланс: {balanceUsd} $ · к оплате ≈ {cartTotalUsd.toFixed(2)} $
            </p>
            <p className="mb-4 text-[18px] font-bold text-[#151515]">
              Итого: {formatSum(cartTotalSum)} сум
            </p>
            {!canCheckout ? (
              <p className="mb-3 rounded-xl bg-[#fff3cd] px-3 py-2 text-[13px] text-[#856404]">
                Недостаточно средств на балансе для оформления
              </p>
            ) : null}
            <button
              type="button"
              onClick={goCheckout}
              disabled={!canCheckout}
              className="mb-3 w-full rounded-xl bg-[#046c6d] py-3 text-[16px] font-medium text-white disabled:opacity-40"
            >
              Оформить заказ
            </button>
          </div>
        </>
      )}
    </SheetModal>
  );
}
