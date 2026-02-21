-- =============================================================================
-- SUPABASE PRODUCTION VERIFICATION SCRIPT
-- Run this in Supabase Dashboard → SQL Editor to ensure all required
-- RLS policies, functions, and permissions are correctly configured.
-- =============================================================================

-- 1. PROFILES TABLE: Enable RLS and create policies
-- =============================================================================

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Public read access (required for /u/[username] pages)
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public"
  ON public.profiles
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert their own profile
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Authenticated users can update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. GET_PUBLIC_PROFILE FUNCTION: Returns only fields marked as public
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_public_profile(p_username text)
RETURNS TABLE (
  id uuid,
  username text,
  display_name text,
  bio text,
  avatar_url text,
  email text,
  phone text,
  whatsapp text,
  telegram text,
  facebook text,
  instagram text,
  tiktok text,
  x_handle text,
  linkedin text,
  website text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.display_name,
    p.bio,
    p.avatar_url,
    CASE WHEN COALESCE(p.email_public, false) THEN p.email ELSE NULL END AS email,
    CASE WHEN COALESCE(p.phone_public, false) THEN p.phone ELSE NULL END AS phone,
    CASE WHEN COALESCE(p.whatsapp_public, false) THEN p.whatsapp ELSE NULL END AS whatsapp,
    CASE WHEN COALESCE(p.telegram_public, false) THEN p.telegram ELSE NULL END AS telegram,
    CASE WHEN COALESCE(p.facebook_public, false) THEN p.facebook ELSE NULL END AS facebook,
    CASE WHEN COALESCE(p.instagram_public, false) THEN p.instagram ELSE NULL END AS instagram,
    CASE WHEN COALESCE(p.tiktok_public, false) THEN p.tiktok ELSE NULL END AS tiktok,
    CASE WHEN COALESCE(p.x_public, false) THEN p.x ELSE NULL END AS x_handle,
    CASE WHEN COALESCE(p.linkedin_public, false) THEN p.linkedin ELSE NULL END AS linkedin,
    CASE WHEN COALESCE(p.website_public, false) THEN p.website ELSE NULL END AS website
  FROM public.profiles p
  WHERE LOWER(TRIM(p.username)) = LOWER(TRIM(p_username));
END;
$$;

-- Grant execute to anon (public pages) and authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_profile(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile(text) TO authenticated;

-- 3. STORAGE AVATARS BUCKET: RLS policies
-- =============================================================================
-- NOTE: You must first create the 'avatars' bucket in Storage → New Bucket
-- Set it to Public if you want guests to see avatars without signed URLs.

-- Allow authenticated users to upload to their own folder
DROP POLICY IF EXISTS "avatar_upload_own" ON storage.objects;
CREATE POLICY "avatar_upload_own"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own files
DROP POLICY IF EXISTS "avatar_update_own" ON storage.objects;
CREATE POLICY "avatar_update_own"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own files
DROP POLICY IF EXISTS "avatar_delete_own" ON storage.objects;
CREATE POLICY "avatar_delete_own"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access to all avatars
DROP POLICY IF EXISTS "avatar_public_read" ON storage.objects;
CREATE POLICY "avatar_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- 4. VERIFICATION QUERIES
-- =============================================================================
-- Run these to confirm setup is correct:

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- List profiles policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check function exists
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'get_public_profile';

-- Test the function (replace 'testuser' with a real username)
-- SELECT * FROM get_public_profile('testuser');
