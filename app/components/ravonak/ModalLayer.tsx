"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSheets } from "@/hooks/useAppSheets";
import { CartSheet } from "@/app/components/ravonak/sheets/CartSheet";
import { OrderSheet } from "@/app/components/ravonak/sheets/OrderSheet";
import { CheckoutSheet } from "@/app/components/ravonak/sheets/CheckoutSheet";

function AuthPageRedirect({ href }: { href: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(href);
  }, [href, router]);

  return null;
}

function ModalLayerInner() {
  const { sheet, orderNumber } = useAppSheets();

  if (!sheet) return null;

  switch (sheet) {
    case "auth-phone":
      return <AuthPageRedirect href="/register" />;
    case "auth-sms":
      return <AuthPageRedirect href="/verify" />;
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
