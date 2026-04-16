"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  checkoutPay,
  checkoutPreview,
  getAddresses,
  getRecipients,
  type AddressResponse,
  type CheckoutPreviewResponse,
  type RecipientResponse,
} from "@/lib/api";
import { formatSum } from "@/lib/format";
import { useRavonak } from "@/context/RavonakContext";
import { PageHeader } from "@/app/components/ravonak/PageHeader";
import { useToast } from "@/app/components/ravonak/ToastProvider";

function formatQty(qty: number, unit: string) {
  if (unit === "grams") return `${qty}г`;
  return String(qty);
}

export default function CartPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    tgId,
    authStage,
    cart,
    cartTotalSum,
    setCartQty,
    removeCartLine,
    refreshBootstrap,
    refreshCart,
  } = useRavonak();

  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [recipients, setRecipients] = useState<RecipientResponse[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<number | null>(null);
  const [selectedRecId, setSelectedRecId] = useState<number | null>(null);
  const [preview, setPreview] = useState<CheckoutPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (tgId == null || authStage !== "verified") {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [addrs, recs] = await Promise.all([
          getAddresses(tgId),
          getRecipients(tgId),
        ]);
        if (cancelled) return;
        setAddresses(addrs);
        setRecipients(recs);
        const defaultAddr = addrs.find((a) => a.is_default)?.id ?? addrs[0]?.id ?? null;
        const defaultRec = recs.find((r) => r.is_default)?.id ?? recs[0]?.id ?? null;
        setSelectedAddrId(defaultAddr);
        setSelectedRecId(defaultRec);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tgId, authStage]);

  useEffect(() => {
    if (tgId == null || authStage !== "verified" || loading) return;
    let cancelled = false;
    (async () => {
      try {
        const p = await checkoutPreview({
          tg_id: tgId,
          address_id: selectedAddrId,
          recipient_id: selectedRecId,
        });
        if (!cancelled) setPreview(p);
      } catch {
        /* ignore */
      }
    })();
    return () => { cancelled = true; };
  }, [tgId, authStage, loading, selectedAddrId, selectedRecId]);

  const selectedAddr = addresses.find((a) => a.id === selectedAddrId);
  const selectedRec = recipients.find((r) => r.id === selectedRecId);

  const canPay =
    Boolean(preview?.can_pay) &&
    selectedAddrId != null &&
    selectedRecId != null &&
    !paying &&
    cart.length > 0;

  const pay = useCallback(async () => {
    if (tgId == null || selectedAddrId == null || selectedRecId == null) {
      showToast("Выберите адрес и получателя");
      return;
    }
    setPaying(true);
    try {
      await checkoutPay({
        tg_id: tgId,
        address_id: selectedAddrId,
        recipient_id: selectedRecId,
      });
      await refreshBootstrap();
      await refreshCart();
      router.replace("/market/order-success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Ошибка оплаты");
    } finally {
      setPaying(false);
    }
  }, [tgId, selectedAddrId, selectedRecId, showToast, refreshBootstrap, refreshCart, router]);

  if (authStage !== "verified" || tgId == null) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white">
        <PageHeader backHref="/" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
          <p className="text-center text-[16px] text-[#949494]">
            Войдите в аккаунт для оформления заказа
          </p>
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="w-full rounded-2xl bg-[#046c6d] py-4 text-[16px] font-medium text-white"
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  if (!loading && cart.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white">
        <PageHeader backHref="/" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
          <p className="text-center text-[16px] text-[#949494]">Корзина пуста</p>
          <button
            type="button"
            onClick={() => router.push("/market")}
            className="w-full rounded-2xl bg-[#046c6d] py-4 text-[16px] font-medium text-white"
          >
            В каталог
          </button>
        </div>
      </div>
    );
  }

  const insufficientFunds = preview != null && !preview.can_pay;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PageHeader backHref="/" />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-2">
        <h1 className="mb-4 text-[22px] font-bold text-[#151515]">Корзина</h1>

        {/* Delivery address */}
        <section className="mb-4">
          <p className="mb-2 text-[12px] uppercase tracking-wide text-[#949494]">Адрес доставки</p>
          {selectedAddr ? (
            <button
              type="button"
              onClick={() => router.push("/market/cart/addresses")}
              className="w-full border-b border-[#eee] pb-3 text-left"
            >
              <p className="text-[14px] text-[#151515]">{selectedAddr.full_text}</p>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/market/cart/addresses")}
              className="w-full rounded-2xl bg-[#046c6d] py-3.5 text-[15px] font-medium text-white active:opacity-90"
            >
              Добавить адрес
            </button>
          )}
        </section>

        {/* Recipient */}
        <section className="mb-4">
          <p className="mb-2 text-[12px] uppercase tracking-wide text-[#949494]">Получатель</p>
          {selectedRec ? (
            <button
              type="button"
              onClick={() => router.push("/market/cart/recipients")}
              className="w-full border-b border-[#eee] pb-3 text-left"
            >
              <p className="text-[15px] font-medium text-[#151515]">{selectedRec.name}</p>
              <p className="text-[13px] text-[#949494]">{selectedRec.phone}</p>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/market/cart/recipients")}
              className="w-full rounded-2xl bg-[#046c6d] py-3.5 text-[15px] font-medium text-white active:opacity-90"
            >
              Добавить получателя
            </button>
          )}
        </section>

        {/* Delivery window */}
        {preview?.delivery_window ? (
          <section className="mb-4">
            <p className="mb-2 text-[12px] uppercase tracking-wide text-[#949494]">Доставка</p>
            <div className="inline-flex items-center rounded-xl border border-[#046c6d] px-3 py-2">
              <span className="text-[13px] text-[#151515]">
                В течении{" "}
                <span className="font-bold text-[#046c6d]">
                  {preview.delivery_window.replace(/^В течени[еи]/i, "").trim() || preview.delivery_window}
                </span>
              </span>
            </div>
          </section>
        ) : null}

        {/* Cart items */}
        <section className="mb-4">
          <p className="mb-3 text-[12px] uppercase tracking-wide text-[#949494]">Товары в корзине</p>
          <ul className="space-y-3">
            {cart.map((line, idx) => {
              const step = line.unit === "grams" ? 200 : 1;
              return (
                <li key={line.basketItemId} className="flex items-center gap-3">
                  <div className="relative size-[54px] shrink-0 overflow-hidden rounded-xl bg-[#eee]">
                    {line.imageUrl?.startsWith("http") ? (
                      <Image src={line.imageUrl} alt="" fill className="object-contain p-0.5" unoptimized />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium leading-tight text-[#151515]">{line.productName}</p>
                    <p className="text-[12px] font-bold text-[#151515]">
                      {formatSum(line.lineTotalSum / (line.qty / (line.unit === "grams" ? 200 : 1) || 1))} сум
                    </p>
                    <p className="text-[11px] text-[#949494]">
                      {line.unit === "grams" ? `${line.qty / 200 * 200}г` : line.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-xl border border-[#eee] px-1.5 py-1">
                    <button
                      type="button"
                      className="flex size-6 items-center justify-center text-[16px] font-bold text-[#151515] active:opacity-60"
                      onClick={() => void setCartQty(idx, line.qty - step)}
                    >
                      −
                    </button>
                    <span className="min-w-[32px] text-center text-[13px] font-medium text-[#151515]">
                      {formatQty(line.qty, line.unit)}
                    </span>
                    <button
                      type="button"
                      className="flex size-6 items-center justify-center text-[16px] font-bold text-[#151515] active:opacity-60"
                      onClick={() => void setCartQty(idx, line.qty + step)}
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Total */}
        <div className="border-t border-[#eee] pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[14px] text-[#949494]">Сумма к оплате</span>
            <div className="text-right">
              <p className="text-[20px] font-bold text-[#151515]">
                {formatSum(preview?.total_sum_uzs ?? cartTotalSum)} сум
              </p>
              {preview?.total_usd != null ? (
                <p className="text-[13px] text-[#949494]">{preview.total_usd.toFixed(2)} $</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Pay button */}
      <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        {insufficientFunds ? (
          <button
            type="button"
            disabled
            className="w-full rounded-2xl bg-[#c83030] py-4 text-[16px] font-medium text-white opacity-80"
          >
            У вас недостаточно средств
          </button>
        ) : (
          <button
            type="button"
            disabled={!canPay}
            onClick={() => void pay()}
            className="w-full rounded-2xl bg-[#046c6d] py-4 text-[16px] font-medium text-white disabled:opacity-40 active:opacity-90"
          >
            {paying ? "Оплата…" : "Оплатить"}
          </button>
        )}
      </div>
    </div>
  );
}
