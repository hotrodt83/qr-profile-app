-- Remove SMS/phone verification table. Auth is email-only (Supabase OTP).
DROP TABLE IF EXISTS public.verification_codes;
