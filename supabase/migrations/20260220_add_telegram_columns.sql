-- Ensure telegram and facebook columns exist (fixes schema mismatch / "column does not exist").
-- Safe to run multiple times; ADD COLUMN IF NOT EXISTS is idempotent.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_public boolean DEFAULT true;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS facebook text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS facebook_public boolean DEFAULT true;
