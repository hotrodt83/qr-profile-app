-- Ensure all profile columns exist (fixes "Could not find the 'email' column" when table was created without them).
-- Safe to run multiple times; ADD COLUMN IF NOT EXISTS is idempotent.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS facebook text,
  ADD COLUMN IF NOT EXISTS instagram text,
  ADD COLUMN IF NOT EXISTS tiktok text,
  ADD COLUMN IF NOT EXISTS telegram text,
  ADD COLUMN IF NOT EXISTS linkedin text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS x text,
  ADD COLUMN IF NOT EXISTS website text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

ALTER TABLE public.profiles
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
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

-- updated_at: ensure it exists (original migration had it)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
