-- Add _public column for every link field so users can control visibility per icon.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS facebook_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS instagram_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tiktok_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS telegram_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS linkedin_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS x_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS website_public boolean DEFAULT false;
