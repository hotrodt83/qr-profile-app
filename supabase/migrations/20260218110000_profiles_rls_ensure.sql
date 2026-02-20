-- Ensure authenticated users can insert/update their own profile row only (user_id = auth.uid()).
-- Idempotent: drop then recreate so policies are correct even if applied out of order.

DROP POLICY IF EXISTS "profiles_insert_owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_owner" ON public.profiles;

CREATE POLICY "profiles_insert_owner"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_owner"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
