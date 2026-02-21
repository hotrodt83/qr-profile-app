import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 60;

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

function hasSupabaseSession(req: NextRequest): boolean {
  const allCookies = req.cookies.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.includes("sb-") && cookie.name.includes("-auth-token")) {
      try {
        const value = cookie.value;
        if (value && value.length > 10) {
          return true;
        }
      } catch {
        continue;
      }
    }
  }
  return false;
}

function isPublicRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/create") return true;
  if (pathname.startsWith("/u/")) return true;
  if (pathname.startsWith("/p/")) return true;
  if (pathname.startsWith("/auth/")) return true;
  if (pathname.startsWith("/verify")) return true;
  if (pathname.startsWith("/secure")) return true;
  if (pathname.startsWith("/api/")) return true;
  return false;
}

function isProtectedRoute(pathname: string): boolean {
  if (pathname === "/edit" || pathname.startsWith("/edit/")) return true;
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isPublicRoute(pathname)) {
    if (pathname.startsWith("/u/")) {
      const clientId = getClientId(request);
      if (isRateLimited(clientId)) {
        return new NextResponse("Too Many Requests", { status: 429 });
      }
    }
    return NextResponse.next();
  }

  if (isProtectedRoute(pathname)) {
    if (!hasSupabaseSession(request)) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/email";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/create",
    "/edit/:path*",
    "/dashboard/:path*",
    "/auth/:path*",
    "/verify/:path*",
    "/secure/:path*",
    "/u/:path*",
    "/p/:path*",
  ],
};
