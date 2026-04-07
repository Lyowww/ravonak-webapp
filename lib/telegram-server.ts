const TELEGRAM_API = "https://api.telegram.org";

export function getTelegramBotToken(): string | undefined {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  return t && t.trim().length > 0 ? t.trim() : undefined;
}

export function getTelegramWebhookSecret(): string | undefined {
  const s = process.env.TELEGRAM_WEBHOOK_SECRET;
  return s && s.trim().length > 0 ? s.trim() : undefined;
}

export function verifyWebhookSecret(request: Request): boolean {
  const expected = getTelegramWebhookSecret();
  if (!expected) return true;
  const got = request.headers.get("x-telegram-bot-api-secret-token");
  return got === expected;
}

type TelegramApiOk<T> = { ok: true; result: T } | { ok: false; description?: string };

export async function telegramSendMessage(
  chatId: number,
  text: string,
): Promise<TelegramApiOk<{ message_id: number }>> {
  const token = getTelegramBotToken();
  if (!token) {
    return { ok: false, description: "TELEGRAM_BOT_TOKEN not configured" };
  }
  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML" as const,
    }),
  });
  return (await res.json()) as TelegramApiOk<{ message_id: number }>;
}

export type TelegramMessage = {
  message_id: number;
  chat: { id: number; type: string };
  text?: string;
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};
