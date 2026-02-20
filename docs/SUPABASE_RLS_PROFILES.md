# Supabase RLS for `profiles` table

The app requires these Row Level Security policies on `public.profiles` so that:

- **SELECT**: Anyone can read (for public profile pages `/u/username` and for the app to fetch the current user's profile).
- **INSERT**: Only the authenticated user can insert a row where `id = auth.uid()`.
- **UPDATE**: Only the authenticated user can update their own row (`auth.uid() = id`).

## If create profile fails with permission errors

1. Open **Supabase Dashboard** → **SQL Editor**.
2. Run the migration:  
   `supabase/migrations/20260219110000_profiles_rls_idempotent.sql`  
   Or run:

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "profiles_insert_owner" ON public.profiles;
CREATE POLICY "profiles_insert_owner"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_owner" ON public.profiles;
CREATE POLICY "profiles_update_owner"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

3. In the browser **Network** tab, check calls to `/rest/v1/profiles`: they should return **200**, not 401/403.
