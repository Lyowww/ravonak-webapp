import { NextRequest, NextResponse } from "next/server";
import { telegramSendMessage } from "@/lib/telegram-server";

const UPSTREAM =
  process.env.RAVONAK_API_ORIGIN?.replace(/\/$/, "") ||
  "https://r-express.online";
const DEBUG_NOTIFY_PHONE = "998901234567";

type DebugSendCodeRequest = {
  phone_number?: string;
};

type DebugSendCodeResponse = {
  success?: boolean;
  message?: string;
  debug_sms_code?: string | null;
};

function digitsOnly(value: string | undefined | null) {
  return (value ?? "").replace(/\D/g, "");
}

async function maybeNotifyTelegramWithDebugCode(params: {
  pathParts: string[];
  rawRequestBody: string;
  rawResponseBody: string;
  tgIdHeader: string | null;
}) {
  const { pathParts, rawRequestBody, rawResponseBody, tgIdHeader } = params;
  if (pathParts.join("/") !== "auth/send-code-debug") return;
  if (!tgIdHeader) return;

  const phoneRequest = JSON.parse(rawRequestBody || "{}") as DebugSendCodeRequest;
  if (digitsOnly(phoneRequest.phone_number) !== DEBUG_NOTIFY_PHONE) return;

  const chatId = Number(tgIdHeader);
  if (!Number.isFinite(chatId)) return;

  const payload = JSON.parse(rawResponseBody || "{}") as DebugSendCodeResponse;
  if (!payload.success || !payload.debug_sms_code) return;

  const result = await telegramSendMessage(
    chatId,
    `Ваш код подтверждения для регистрации: <b>${payload.debug_sms_code}</b>`,
  );

  if (!result.ok) {
    console.warn("Failed to send debug SMS code via Telegram bot", result.description);
  }
}

async function proxy(req: NextRequest, pathParts: string[]) {
  const path = pathParts.join("/");
  const url = new URL(req.url);
  const target = `${UPSTREAM}/api/${path}${url.search}`;
  const headers: HeadersInit = {
    accept: req.headers.get("accept") || "application/json",
  };
  const ct = req.headers.get("content-type");
  if (ct) {
    (headers as Record<string, string>)["content-type"] = ct;
  }
  const init: RequestInit = {
    method: req.method,
    headers,
  };
  let rawRequestBody = "";
  if (req.method !== "GET" && req.method !== "HEAD") {
    rawRequestBody = await req.text();
    init.body = rawRequestBody;
  }
  const res = await fetch(target, init);
  const body = await res.text();
  try {
    await maybeNotifyTelegramWithDebugCode({
      pathParts,
      rawRequestBody,
      rawResponseBody: body,
      tgIdHeader: req.headers.get("x-ravonak-tg-id"),
    });
  } catch (error) {
    console.warn("Debug SMS bot notification failed", error);
  }
  const out = new NextResponse(body, { status: res.status });
  const outCt = res.headers.get("content-type");
  if (outCt) out.headers.set("content-type", outCt);
  return out;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
