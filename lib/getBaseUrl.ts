/**
 * Canonical app URL for QR codes and OpenGraph (no trailing slash).
 * Safe for build: never throws; falls back to VERCEL_URL or localhost if env missing.
 */
export function getBaseUrl(): string {
  if (typeof process === "undefined") return "http://localhost:3001";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const fromEnv =
    appUrl && typeof appUrl === "string"
      ? String(appUrl).replace(/\/$/, "")
      : "";
  if (fromEnv.startsWith("http")) return fromEnv;
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && typeof vercelUrl === "string") {
    return `https://${vercelUrl}`;
  }
  return "http://localhost:3001";
}
