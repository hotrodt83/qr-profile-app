-- Add display/bio and privacy/verification columns to profiles.
-- Sensitive fields (phone, email, whatsapp) are private by default; only shown when *_public and email_verified.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

COMMENT ON COLUMN public.profiles.phone_public IS 'If true and email_verified, show phone on public profile';
COMMENT ON COLUMN public.profiles.email_public IS 'If true and email_verified, show email on public profile';
COMMENT ON COLUMN public.profiles.whatsapp_public IS 'If true and email_verified, show whatsapp on public profile';
COMMENT ON COLUMN public.profiles.email_verified IS 'Set when user has confirmed email; required to show contact fields publicly';
