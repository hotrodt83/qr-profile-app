-- Idempotent RLS for public.profiles.
-- Ensures authenticated users can SELECT (any row for public profiles), INSERT/UPDATE own row only.
-- Run in Supabase Dashboard → SQL Editor if create profile fails with permission/RLS errors.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: allow read so users can fetch their own profile and public can read /u/username
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

-- INSERT: allow insert where id = auth.uid() (own row only)
DROP POLICY IF EXISTS "profiles_insert_owner" ON public.profiles;
CREATE POLICY "profiles_insert_owner"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: allow update where id = auth.uid() (own row only)
DROP POLICY IF EXISTS "profiles_update_owner" ON public.profiles;
CREATE POLICY "profiles_update_owner"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
