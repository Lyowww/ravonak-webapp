"use client";

import { useCallback, useEffect, useState } from "react";
import {
  checkoutPay,
  checkoutPreview,
  createAddress,
  createRecipient,
  getAddresses,
  getRecipients,
  selectAddressDefault,
  selectRecipientDefault,
  type CheckoutPreviewResponse,
} from "@/lib/api";
import { useRavonak } from "@/context/RavonakContext";
import { useAppSheets } from "@/hooks/useAppSheets";
import { useTelegramMainButton } from "@/hooks/useTelegramMainButton";
import { SheetModal } from "@/app/components/ravonak/SheetModal";
import { useToast } from "@/app/components/ravonak/ToastProvider";

export function CheckoutSheet() {
  const { tgId, authStage, refreshBootstrap, refreshCart } = useRavonak();
  const { closeSheet } = useAppSheets();
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<
    Awaited<ReturnType<typeof getAddresses>>
  >([]);
  const [recipients, setRecipients] = useState<
    Awaited<ReturnType<typeof getRecipients>>
  >([]);
  const [addrId, setAddrId] = useState<number | null>(null);
  const [recId, setRecId] = useState<number | null>(null);
  const [preview, setPreview] = useState<CheckoutPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [city, setCity] = useState("Самарканд");
  const [street, setStreet] = useState("");
  const [house, setHouse] = useState("");
  const [flat, setFlat] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientSurname, setRecipientSurname] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");

  useEffect(() => {
    if (tgId == null || authStage !== "verified") {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [a, r] = await Promise.all([getAddresses(tgId), getRecipients(tgId)]);
        if (cancelled) return;
        setAddresses(a);
        setRecipients(r);
        const da = a.find((x) => x.is_default)?.id ?? a[0]?.id ?? null;
        const dr = r.find((x) => x.is_default)?.id ?? r[0]?.id ?? null;
        setAddrId(da);
        setRecId(dr);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tgId, authStage]);

  async function runPreview() {
    if (tgId == null) return;
    try {
      const p = await checkoutPreview({
        tg_id: tgId,
        address_id: addrId,
        recipient_id: recId,
      });
      setPreview(p);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Ошибка расчёта");
    }
  }

  useEffect(() => {
    if (tgId == null || authStage !== "verified" || loading) return;
    void runPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tgId, authStage, loading, addrId, recId]);

  const pay = useCallback(async () => {
    if (tgId == null || addrId == null || recId == null) {
      showToast("Выберите адрес и получателя");
      return;
    }
    setPaying(true);
    try {
      const r = await checkoutPay({
        tg_id: tgId,
        address_id: addrId,
        recipient_id: recId,
      });
      showToast(r.message);
      await refreshBootstrap();
      await refreshCart();
      closeSheet();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Ошибка оплаты");
    } finally {
      setPaying(false);
    }
  }, [
    tgId,
    addrId,
    recId,
    showToast,
    refreshBootstrap,
    refreshCart,
    closeSheet,
  ]);

  const canPay =
    Boolean(preview?.can_pay) &&
    addrId != null &&
    recId != null &&
    !paying;

  useTelegramMainButton(canPay, "Оплатить", paying, pay);

  if (authStage !== "verified" || tgId == null) {
    return (
      <SheetModal title="Оформление" onClose={closeSheet}>
        <p className="py-6 text-[#949494]">Сначала войдите в аккаунт.</p>
        <button
          type="button"
          onClick={closeSheet}
          className="w-full rounded-xl bg-[#046c6d] py-3 text-white"
        >
          Закрыть
        </button>
      </SheetModal>
    );
  }

  return (
    <SheetModal title="Оформление" onClose={closeSheet}>
      <div className="space-y-6 pb-4">
        {loading ? (
          <p className="text-[#949494]">Загрузка адресов…</p>
        ) : (
          <>
            <section>
              <h2 className="mb-2 text-[16px] font-semibold">Адрес доставки</h2>
              {addresses.length > 0 ? (
                <ul className="space-y-2">
                  {addresses.map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setAddrId(a.id);
                          if (tgId != null) {
                            void selectAddressDefault(a.id, tgId).catch(() => {
                              /* ignore */
                            });
                          }
                        }}
                        className={`w-full rounded-xl border px-4 py-3 text-left text-[14px] ${
                          addrId === a.id
                            ? "border-[#046c6d] bg-[#e8f5f5]"
                            : "border-[#eee]"
                        }`}
                      >
                        {a.full_text}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-2 text-[13px] text-[#949494]">
                  Нет сохранённых адресов — создайте ниже.
                </p>
              )}
              <div className="mt-3 space-y-2 rounded-xl border border-[#eee] p-3">
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Город"
                  className="w-full rounded-lg bg-[#eee] px-3 py-2 text-[14px]"
                />
                <input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Улица"
                  className="w-full rounded-lg bg-[#eee] px-3 py-2 text-[14px]"
                />
                <div className="flex gap-2">
                  <input
                    value={house}
                    onChange={(e) => setHouse(e.target.value)}
                    placeholder="Дом"
                    className="w-1/2 rounded-lg bg-[#eee] px-3 py-2 text-[14px]"
                  />
                  <input
                    value={flat}
                    onChange={(e) => setFlat(e.target.value)}
                    placeholder="Кв."
                    className="w-1/2 rounded-lg bg-[#eee] px-3 py-2 text-[14px]"
                  />
                </div>
                <button
                  type="button"
                  className="w-full rounded-xl bg-[#046c6d] py-2 text-[14px] font-medium text-white"
                  onClick={async () => {
                    if (!city.trim() || !street.trim()) {
                      showToast("Укажите город и улицу");
                      return;
                    }
                    const a = await createAddress({
                      tg_id: tgId,
                      city: city.trim(),
                      street: street.trim(),
                      house: house.trim() || null,
                      flat: flat.trim() || null,
                      is_default: true,
                    });
                    const list = await getAddresses(tgId);
                    setAddresses(list);
                    setAddrId(a.id);
                    showToast("Адрес сохранён");
                  }}
                >
                  Сохранить адрес
                </button>
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-[16px] font-semibold">Получатель</h2>
              {recipients.length > 0 ? (
                <ul className="space-y-2">
                  {recipients.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setRecId(r.id);
                          if (tgId != null) {
                            void selectRecipientDefault(r.id, tgId).catch(() => {
                              /* ignore */
                            });
                          }
                        }}
                        className={`w-full rounded-xl border px-4 py-3 text-left text-[14px] ${
                          recId === r.id
                            ? "border-[#046c6d] bg-[#e8f5f5]"
                            : "border-[#eee]"
                        }`}
                      >
                        {r.name} · {r.phone}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-2 text-[13px] text-[#949494]">
                  Нет получателей — создайте ниже.
                </p>
              )}
              <div className="mt-3 space-y-2 rounded-xl border border-[#eee] p-3">
                <input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Имя"
                  className="w-full rounded-lg bg-[#eee] px-3 py-2 text-[14px]"
                />
                <input
                  value={recipientSurname}
                  onChange={(e) => setRecipientSurname(e.target.value)}
                  placeholder="Фамилия (необязательно)"
                  className="w-full rounded-lg bg-[#eee] px-3 py-2 text-[14px]"
                />
                <input
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="Телефон +998…"
                  className="w-full rounded-lg bg-[#eee] px-3 py-2 text-[14px]"
                />
                <button
                  type="button"
                  className="w-full rounded-xl bg-[#046c6d] py-2 text-[14px] font-medium text-white"
                  onClick={async () => {
                    if (!recipientName.trim() || !recipientPhone.trim()) {
                      showToast("Укажите имя и телефон");
                      return;
                    }
                    const r = await createRecipient({
                      tg_id: tgId,
                      name: recipientName.trim(),
                      surname: recipientSurname.trim() || null,
                      phone: recipientPhone.trim(),
                      is_default: true,
                    });
                    const list = await getRecipients(tgId);
                    setRecipients(list);
                    setRecId(r.id);
                    showToast("Получатель сохранён");
                  }}
                >
                  Сохранить получателя
                </button>
              </div>
            </section>

            {preview ? (
              <section className="rounded-xl border border-[#eee] p-4 text-[14px]">
                <p className="mb-1 text-[#949494]">{preview.delivery_window}</p>
                <p>
                  Курс ЦБ: {preview.usd_rate.toLocaleString("ru-RU")} сум (
                  {preview.usd_rate_date})
                </p>
                <p className="mt-2 font-semibold">
                  Итого: {preview.total_sum_uzs.toLocaleString("ru-RU")} сум ≈{" "}
                  {preview.total_usd.toFixed(2)} USD
                </p>
                <p className="mt-1">Баланс: {preview.balance_usd.toFixed(2)} USD</p>
                {!preview.can_pay && preview.disable_reason ? (
                  <p className="mt-2 text-[#c83030]">{preview.disable_reason}</p>
                ) : null}
              </section>
            ) : null}

            <button
              type="button"
              disabled={!canPay}
              className="w-full rounded-2xl bg-[#046c6d] py-4 text-[16px] font-medium text-white disabled:opacity-40"
              onClick={() => void pay()}
            >
              {paying ? "Оплата…" : "Оплатить"}
            </button>
          </>
        )}
      </div>
    </SheetModal>
  );
}
