import { NextRequest, NextResponse } from "next/server";

const UPSTREAM =
  process.env.RAVONAK_API_ORIGIN?.replace(/\/$/, "") ||
  "https://r-express.online";

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
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }
  const res = await fetch(target, init);
  const body = await res.text();
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
