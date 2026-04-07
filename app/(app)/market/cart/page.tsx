"use client";

import Link from "next/link";
import { getProduct } from "@/lib/catalog";
import { formatSum } from "@/lib/format";
import { useRavonak } from "@/context/RavonakContext";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export default function CartPage() {
  const {
    cart,
    cartTotalSum,
    cartTotalUsd,
    balanceUsd,
    canCheckout,
    setCartQty,
    removeCartLine,
    checkoutCart,
    clearCart,
  } = useRavonak();
  const { showToast } = useToast();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white pb-28">
      <PageHeader backHref="/market" title="Корзина" />
      <div className="flex-1 px-4 pt-2">
        {cart.length === 0 ? (
          <p className="py-12 text-center text-[#949494]">Корзина пуста</p>
        ) : (
          <ul className="space-y-3">
            {cart.map((line, i) => {
              const p = getProduct(line.productId);
              return (
                <li
                  key={`${line.productId}-${line.variantLabel}-${i}`}
                  className="flex gap-3 rounded-xl border border-[#eee] p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-[#151515]">
                      {p?.title ?? line.productId}
                    </p>
                    <p className="text-[12px] text-[#949494]">{line.variantLabel}</p>
                    <p className="mt-1 text-[14px] font-bold">
                      {formatSum(line.lineTotalSum)} сум
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="size-8 rounded-lg bg-[#eee] text-[16px]"
                        onClick={() => setCartQty(i, line.qty - 1)}
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-[14px]">{line.qty}</span>
                      <button
                        type="button"
                        className="size-8 rounded-lg bg-[#eee] text-[16px]"
                        onClick={() => setCartQty(i, line.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-[12px] text-[#c83030]"
                      onClick={() => removeCartLine(i)}
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {cart.length > 0 ? (
          <button
            type="button"
            className="mt-4 text-[13px] text-[#046c6d]"
            onClick={() => {
              clearCart();
              showToast("Корзина очищена");
            }}
          >
            Очистить корзину
          </button>
        ) : null}
      </div>

      {cart.length > 0 ? (
        <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[390px] -translate-x-1/2 border-t border-[#eee] bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          <p className="mb-1 text-[12px] text-[#949494]">
            Баланс: {balanceUsd} $ · к оплате ≈ {cartTotalUsd.toFixed(2)} $
          </p>
          <p className="mb-3 text-[18px] font-bold text-[#151515]">
            Итого: {formatSum(cartTotalSum)} сум
          </p>
          <button
            type="button"
            disabled={!canCheckout}
            onClick={() => {
              if (!canCheckout) {
                showToast("Недостаточно средств на балансе");
                return;
              }
              checkoutCart();
              showToast("Заказ оформлен — сборщик увидит его в приложении");
            }}
            className="mb-2 w-full rounded-xl bg-[#046c6d] py-3 text-[16px] font-medium text-white disabled:opacity-40"
          >
            Оформить заказ
          </button>
          <Link
            href="/market"
            className="block w-full py-2 text-center text-[14px] text-[#046c6d]"
          >
            Продолжить покупки
          </Link>
        </div>
      ) : null}
    </div>
  );
}
