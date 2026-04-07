"use client";

import { useEffect, useRef } from "react";
import { getTelegramWebAppFull } from "@/lib/telegram-webapp";

/**
 * Binds Telegram MainButton (bottom bar) to an action. Hides when `visible` is false.
 */
export function useTelegramMainButton(
  visible: boolean,
  text: string,
  disabled: boolean,
  onClick: () => void | Promise<void>,
) {
  const ref = useRef(onClick);

  useEffect(() => {
    ref.current = onClick;
  }, [onClick]);

  useEffect(() => {
    const tw = getTelegramWebAppFull();
    const MB = tw?.MainButton;
    if (!MB) return;

    MB.setParams({ color: "#046c6d", text_color: "#ffffff" });
    MB.setText(text);
    if (disabled) MB.disable();
    else MB.enable();

    const fn = () => {
      void ref.current();
    };
    MB.onClick(fn);

    if (visible) MB.show();
    else MB.hide();

    return () => {
      MB.offClick(fn);
      MB.hide();
    };
  }, [visible, text, disabled]);
}
