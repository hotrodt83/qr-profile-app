-- =============================================================================
-- PROFILE_LINKS TABLE + RLS POLICIES
-- Safe to run on existing databases (idempotent)
-- =============================================================================

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.profile_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  value text NOT NULL,
  is_public boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Add unique constraint (user_id, platform) if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profile_links_user_platform_unique'
  ) THEN
    ALTER TABLE public.profile_links
      ADD CONSTRAINT profile_links_user_platform_unique UNIQUE (user_id, platform);
  END IF;
END $$;

-- 3. Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS profile_links_user_id_idx ON public.profile_links(user_id);

-- 4. Enable RLS
ALTER TABLE public.profile_links ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to avoid conflicts (idempotent)
DROP POLICY IF EXISTS "profile_links_public_read" ON public.profile_links;
DROP POLICY IF EXISTS "profile_links_owner_insert" ON public.profile_links;
DROP POLICY IF EXISTS "profile_links_owner_update" ON public.profile_links;
DROP POLICY IF EXISTS "profile_links_owner_delete" ON public.profile_links;
DROP POLICY IF EXISTS "profile_links_owner_select" ON public.profile_links;

-- 6. Public can read only public links
CREATE POLICY "profile_links_public_read"
  ON public.profile_links
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

-- 7. Authenticated user can select ALL their own links (including private)
CREATE POLICY "profile_links_owner_select"
  ON public.profile_links
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 8. Authenticated user can insert their own links
CREATE POLICY "profile_links_owner_insert"
  ON public.profile_links
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 9. Authenticated user can update their own links
CREATE POLICY "profile_links_owner_update"
  ON public.profile_links
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 10. Authenticated user can delete their own links
CREATE POLICY "profile_links_owner_delete"
  ON public.profile_links
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 11. Grant permissions
GRANT SELECT ON public.profile_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_links TO authenticated;
