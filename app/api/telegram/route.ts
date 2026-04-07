import { NextResponse } from "next/server";
import { getTelegramBotToken, getTelegramWebhookSecret } from "@/lib/telegram-server";

export const dynamic = "force-dynamic";

/**
 * Health / config check (does not expose the token).
 * Register webhook with Telegram, e.g.:
 * curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<PUBLIC_URL>/api/telegram/webhook&secret_token=<SECRET>"
 */
export async function GET() {
  const configured = Boolean(getTelegramBotToken());
  const webhookSecretConfigured = Boolean(getTelegramWebhookSecret());
  return NextResponse.json({
    ok: true,
    telegram: {
      botTokenConfigured: configured,
      webhookSecretConfigured,
      webhookSecretRecommended:
        configured && !webhookSecretConfigured
          ? "Set TELEGRAM_WEBHOOK_SECRET and setWebhook secret_token for production."
          : null,
    },
  });
}
