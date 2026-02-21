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

const PROTECTED_ROUTES = ["/edit", "/dashboard"];
const AUTH_ROUTE = "/auth/email";
const STEPUP_COOKIE = "smartqr_stepup";

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

function isStepUpVerified(req: NextRequest): boolean {
  const stepupCookie = req.cookies.get(STEPUP_COOKIE);
  if (!stepupCookie?.value) return false;
  const ts = parseInt(stepupCookie.value, 10);
  if (isNaN(ts)) return stepupCookie.value === "1";
  return Date.now() < ts;
}

function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some((r) => path === r || path.startsWith(r + "/"));
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.searchParams.get("enroll") === "face") {
    return NextResponse.next();
  }

  const path = request.nextUrl.pathname;

  if (isProtectedRoute(path)) {
    const isAuthed = hasSupabaseSession(request);

    if (!isAuthed) {
      const url = request.nextUrl.clone();
      url.pathname = AUTH_ROUTE;
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }

    if (!isStepUpVerified(request)) {
      const url = request.nextUrl.clone();
      url.pathname = "/secure";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  if (
    path === "/" ||
    path === "/create" ||
    path.startsWith("/auth/") ||
    path.startsWith("/verify") ||
    path.startsWith("/secure")
  ) {
    return NextResponse.next();
  }

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
  matcher: [
    "/",
    "/create",
    "/edit/:path*",
    "/dashboard/:path*",
    "/verify/:path*",
    "/auth/:path*",
    "/secure/:path*",
    "/u/:path*",
  ],
};
