import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RATE_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_MAX = 60; // max requests per window per IP for /u/*

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

function getClientId(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(id: string): boolean {
  const now = Date.now();
  let entry = store.get(id);
  if (!entry) {
    store.set(id, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + RATE_WINDOW_MS };
    store.set(id, entry);
    return false;
  }
  entry.count++;
  if (entry.count > RATE_MAX) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith("/u/")) {
    return NextResponse.next();
  }
  const clientId = getClientId(request);
  if (isRateLimited(clientId)) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/u/:path*"],
};
