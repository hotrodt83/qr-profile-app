/**
 * Canonical app URL for QR codes and OpenGraph (no trailing slash).
 * Prefers NEXT_PUBLIC_SITE_URL, then NEXT_PUBLIC_APP_URL, then VERCEL_URL, then localhost.
 * Safe for build: never throws.
 */
export function getBaseUrl(): string {
  if (typeof process === "undefined") return "http://localhost:3001";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const siteTrimmed =
    siteUrl && typeof siteUrl === "string"
      ? String(siteUrl).replace(/\/$/, "").trim()
      : "";
  if (siteTrimmed.startsWith("http")) return siteTrimmed;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const appTrimmed =
    appUrl && typeof appUrl === "string"
      ? String(appUrl).replace(/\/$/, "").trim()
      : "";
  if (appTrimmed.startsWith("http")) return appTrimmed;
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && typeof vercelUrl === "string") {
    return `https://${vercelUrl}`;
  }
  return "http://localhost:3001";
}
