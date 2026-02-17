/**
 * Profile field: value + visibility. Private fields are never shown in QR output.
 */
export type ProfileField = {
  value: string
  visible: boolean
}

/**
 * All supported platform keys. Extensible for future platforms.
 */
export type PlatformKey =
  | 'phone'
  | 'email'
  | 'website'
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'telegram'
  | 'linkedin'
  | 'x'
  | 'youtube'
  | 'tiktok'
  | 'messenger'

/**
 * Stored profile fields: key -> { value, visible }
 */
export type ProfileFields = Partial<Record<PlatformKey, ProfileField>>

/**
 * Profile row as stored in DB (matches Supabase schema).
 */
export type ProfileRow = {
  id: string
  user_id: string
  slug: string
  display_name: string | null
  avatar_url: string | null
  fields: ProfileFields
  created_at: string
  updated_at: string
}

/**
 * Public view: only visible fields with values.
 */
export type PublicProfileField = {
  key: PlatformKey
  value: string
}

export type PublicProfile = {
  slug: string
  display_name: string | null
  avatar_url: string | null
  fields: PublicProfileField[]
}
