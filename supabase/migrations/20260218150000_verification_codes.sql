-- DEPRECATED: This table was for phone/SMS verification. Auth is now email-only.
-- Table is dropped in 20260219100000_drop_verification_codes.sql.
-- Phone verification codes for unlock step (SMS). One-time use, short-lived.
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_user_phone_exp
  ON public.verification_codes(user_id, phone, expires_at);

ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Users can insert their own row (when requesting a code)
CREATE POLICY "verification_codes_insert_own"
  ON public.verification_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read/delete their own rows (to verify code)
CREATE POLICY "verification_codes_select_own"
  ON public.verification_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "verification_codes_delete_own"
  ON public.verification_codes FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.verification_codes IS 'One-time SMS codes for phone verification before edit page.';
