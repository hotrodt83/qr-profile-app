-- Ensure profiles.phone exists (fix production where column was missing).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text;
