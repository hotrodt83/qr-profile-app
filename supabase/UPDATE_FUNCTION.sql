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
  website text,
  links jsonb
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
    CASE WHEN COALESCE(p.website_public, false) THEN p.website ELSE NULL END AS website,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'platform', pl.platform,
            'value', pl.value,
            'sort_order', pl.sort_order
          )
          ORDER BY pl.sort_order
        )
        FROM public.profile_links pl
        WHERE pl.user_id = p.id AND pl.is_public = true
      ),
      '[]'::jsonb
    ) AS links
  FROM public.profiles p
  WHERE LOWER(TRIM(p.username)) = LOWER(TRIM(p_username));
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_public_profile(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile(text) TO authenticated;
