/** Canonical app URL for QR codes and OpenGraph (no trailing slash). Safe fallback if env missing. */
export function getBaseUrl(): string {
  const fromEnv =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_APP_URL
      ? String(process.env.NEXT_PUBLIC_APP_URL).replace(/\/$/, "")
      : "";
  if (fromEnv && fromEnv.startsWith("http")) return fromEnv;
  if (typeof process !== "undefined" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3001";
}
