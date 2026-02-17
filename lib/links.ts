import { PLATFORM_MAP } from "./platforms"
import type { PlatformKey } from "./platforms"

/**
 * Normalize and build the final URL for a platform link.
 * - Website / LinkedIn: if value is already a full URL, return as-is (with https if missing); else use buildUrl.
 */
export function getProfileLink(platform: PlatformKey, value: string): string {
  const v = value.trim()
  if (!v) return ""

  const def = PLATFORM_MAP.get(platform)
  if (!def) return v

  if (platform === "website" || platform === "linkedin") {
    if (v.startsWith("http://") || v.startsWith("https://")) return v
    if (platform === "website") return v.startsWith("http") ? v : `https://${v}`
  }

  const normalized = def.normalize ? def.normalize(v) : v
  return def.buildUrl(normalized)
}
