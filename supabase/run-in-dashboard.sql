-- Run this in Supabase Dashboard → SQL Editor to fix Save on /edit (RLS + missing columns).
-- Idempotent: safe to run more than once.

-- 1) Ensure all profile columns exist (phone, display_name, bio, privacy, etc.)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS phone_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS facebook_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS instagram_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tiktok_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS telegram_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS linkedin_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS x_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS website_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS face_descriptor jsonb DEFAULT NULL;

-- 2) Ensure RLS is on
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3) Policies: authenticated users can only insert/update their own row (auth.uid() = id)
DROP POLICY IF EXISTS "profiles_insert_owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_owner" ON public.profiles;

CREATE POLICY "profiles_insert_owner"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_owner"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
