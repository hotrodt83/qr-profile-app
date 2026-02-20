export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

/** Profile row (id = auth.users.id). Supports flat link fields + display/bio + privacy. */
export type ProfilesRow = {
  id: string
  username: string | null
  display_name?: string | null
  bio?: string | null
  avatar_url?: string | null
  whatsapp: string | null
  facebook: string | null
  instagram: string | null
  tiktok: string | null
  telegram: string | null
  linkedin: string | null
  email: string | null
  phone: string | null
  x: string | null
  website: string | null
  phone_public?: boolean | null
  email_public?: boolean | null
  whatsapp_public?: boolean | null
  facebook_public?: boolean | null
  instagram_public?: boolean | null
  tiktok_public?: boolean | null
  telegram_public?: boolean | null
  linkedin_public?: boolean | null
  x_public?: boolean | null
  website_public?: boolean | null
  email_verified?: boolean | null
  face_descriptor?: number[] | null
  updated_at: string
}

export type ProfilesInsert = {
  id: string
  username?: string | null
  display_name?: string | null
  bio?: string | null
  avatar_url?: string | null
  whatsapp?: string | null
  facebook?: string | null
  instagram?: string | null
  tiktok?: string | null
  telegram?: string | null
  linkedin?: string | null
  email?: string | null
  phone?: string | null
  x?: string | null
  website?: string | null
  phone_public?: boolean | null
  email_public?: boolean | null
  whatsapp_public?: boolean | null
  facebook_public?: boolean | null
  instagram_public?: boolean | null
  tiktok_public?: boolean | null
  telegram_public?: boolean | null
  linkedin_public?: boolean | null
  x_public?: boolean | null
  website_public?: boolean | null
  email_verified?: boolean | null
  face_descriptor?: number[] | null
  updated_at?: string
}

export type ProfilesUpdate = {
  username?: string | null
  display_name?: string | null
  bio?: string | null
  avatar_url?: string | null
  whatsapp?: string | null
  facebook?: string | null
  instagram?: string | null
  tiktok?: string | null
  telegram?: string | null
  linkedin?: string | null
  email?: string | null
  phone?: string | null
  x?: string | null
  website?: string | null
  phone_public?: boolean | null
  email_public?: boolean | null
  whatsapp_public?: boolean | null
  facebook_public?: boolean | null
  instagram_public?: boolean | null
  tiktok_public?: boolean | null
  telegram_public?: boolean | null
  linkedin_public?: boolean | null
  x_public?: boolean | null
  website_public?: boolean | null
  email_verified?: boolean | null
  face_descriptor?: number[] | null
  updated_at?: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfilesRow
        Insert: ProfilesInsert
        Update: ProfilesUpdate
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
