"use client";

import { Suspense } from "react";
import { useAppSheets } from "@/hooks/useAppSheets";
import { AuthPhoneSheet } from "@/app/components/ravonak/sheets/AuthPhoneSheet";
import { AuthSmsSheet } from "@/app/components/ravonak/sheets/AuthSmsSheet";
import { CartSheet } from "@/app/components/ravonak/sheets/CartSheet";
import { OrderSheet } from "@/app/components/ravonak/sheets/OrderSheet";
import { CheckoutSheet } from "@/app/components/ravonak/sheets/CheckoutSheet";

function ModalLayerInner() {
  const { sheet, orderNumber } = useAppSheets();

  if (!sheet) return null;

  switch (sheet) {
    case "auth-phone":
      return <AuthPhoneSheet />;
    case "auth-sms":
      return <AuthSmsSheet />;
    case "cart":
      return <CartSheet />;
    case "order":
      return <OrderSheet orderNumber={orderNumber} />;
    case "checkout":
      return <CheckoutSheet />;
    default:
      return null;
  }
}

export function ModalLayer() {
  return (
    <Suspense fallback={null}>
      <ModalLayerInner />
    </Suspense>
  );
}
