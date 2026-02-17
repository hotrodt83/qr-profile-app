import type { ProfileRow, ProfileFields, PublicProfile, PublicProfileField } from './types'
import type { PlatformKey } from './types'
import { PLATFORM_CONFIG } from './platforms'

export function toPublicProfile(row: ProfileRow): PublicProfile {
  const fields: PublicProfileField[] = []
  const raw = (row.fields || {}) as ProfileFields
  for (const key of Object.keys(PLATFORM_CONFIG) as PlatformKey[]) {
    const f = raw[key]
    if (!f || !f.visible || !String(f.value).trim()) continue
    fields.push({ key: key as PlatformKey, value: f.value.trim() })
  }
  return {
    slug: row.slug,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    fields,
  }
}

export function defaultFields(): ProfileFields {
  return {}
}

export function ensureSlug(userId: string): string {
  return userId.replace(/-/g, '').slice(0, 12)
}
