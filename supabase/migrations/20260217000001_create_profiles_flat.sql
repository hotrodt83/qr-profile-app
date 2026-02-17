-- Flat profiles table for QR profile links.
-- If you already have a "profiles" table with a different schema, rename or drop it first.

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  whatsapp text,
  facebook text,
  instagram text,
  tiktok text,
  telegram text,
  linkedin text,
  email text,
  phone text,
  x text,
  website text,
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: allow anyone (for public profile viewing by username)
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

-- INSERT: only the owner (on signup or first create)
CREATE POLICY "profiles_insert_owner"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: only the owner
CREATE POLICY "profiles_update_owner"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Optional: allow delete for owner
CREATE POLICY "profiles_delete_owner"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

COMMENT ON TABLE public.profiles IS 'Flat profile links per user (id = auth.users.id).';
