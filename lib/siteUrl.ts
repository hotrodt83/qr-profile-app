import { getBaseUrl } from "@/lib/getBaseUrl";

const LOCALHOST_HOSTS = ["localhost", "127.0.0.1"];

function trimOrigin(url: string): string {
  return url ? String(url).replace(/\/$/, "").trim() : "";
}

/**
 * Canonical site origin for share links (no trailing slash).
 * - In browser: prefers window.location.origin; if that is localhost/127.0.0.1,
 *   falls back to NEXT_PUBLIC_SITE_URL so shared links point to production.
 * - On server: uses getBaseUrl().
 * Returns "" when on localhost and NEXT_PUBLIC_SITE_URL is not set (caller should show warning).
 */
export function getSiteOrigin(): string {
  if (typeof window !== "undefined") {
    const origin = trimOrigin(window.location.origin);
    const hostname = window.location.hostname?.toLowerCase() ?? "";
    const isLocal = LOCALHOST_HOSTS.some((h) => hostname === h);
    if (isLocal) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      const fallback = siteUrl && typeof siteUrl === "string" ? trimOrigin(siteUrl) : "";
      return fallback.startsWith("http") ? fallback : "";
    }
    return origin || "";
  }
  return getBaseUrl();
}

/**
 * Builds the public profile URL: `${origin}/u/${username}` (no trailing slash on origin).
 * Returns "" when getSiteOrigin() is "" (e.g. localhost without NEXT_PUBLIC_SITE_URL).
 */
export function buildProfileUrl(username: string): string {
  const origin = getSiteOrigin();
  if (!origin || !username?.trim()) return "";
  const segment = encodeURIComponent(username.trim());
  return `${origin}/u/${segment}`;
}

/**
 * True when running in browser and hostname is localhost or 127.0.0.1.
 */
export function isLocalhost(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname?.toLowerCase() ?? "";
  return LOCALHOST_HOSTS.some((h) => hostname === h);
}

/**
 * Canonical production base URL from env (no trailing slash).
 * Use for "Open Live Share Page" etc. when on localhost.
 * Returns "" if NEXT_PUBLIC_SITE_URL is not set.
 */
export function getProductionSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const trimmed = siteUrl && typeof siteUrl === "string" ? trimOrigin(siteUrl) : "";
  return trimmed.startsWith("http") ? trimmed : "";
}
