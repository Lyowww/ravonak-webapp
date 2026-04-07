import { NextResponse } from "next/server";
import {
  getTelegramBotToken,
  telegramSendMessage,
  verifyWebhookSecret,
  type TelegramUpdate,
} from "@/lib/telegram-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!getTelegramBotToken()) {
    return NextResponse.json(
      { ok: false, error: "TELEGRAM_BOT_TOKEN is not set" },
      { status: 503 },
    );
  }

  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ ok: false, error: "Invalid secret" }, { status: 401 });
  }

  let body: TelegramUpdate;
  try {
    body = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const msg = body.message;
  if (msg?.text && msg.chat?.id != null) {
    const text = msg.text.trim();
    const chatId = msg.chat.id;
    if (text === "/start" || text.startsWith("/start ")) {
      await telegramSendMessage(
        chatId,
        "Добро пожаловать в <b>Ravonak</b>. Откройте мини-приложение через кнопку меню бота.",
      );
    } else {
      await telegramSendMessage(
        chatId,
        "Используйте мини-приложение Ravonak для заказов и сервисов.",
      );
    }
  }

  return NextResponse.json({ ok: true });
}
