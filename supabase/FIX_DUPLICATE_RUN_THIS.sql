-- =============================================================================
-- FIX: Delete duplicate 'hotrod' profile blocking your 'HotRod' profile
-- =============================================================================
-- RUN THIS IN SUPABASE DASHBOARD → SQL EDITOR
-- =============================================================================

-- Step 1: View the duplicate profiles
SELECT id, username, email, whatsapp, created_at 
FROM profiles 
WHERE LOWER(username) = 'hotrod';

-- Step 2: Delete the EMPTY duplicate (lowercase 'hotrod')
-- This profile has NO data and is blocking your real profile
DELETE FROM profiles 
WHERE id = 'ed64f1fe-8f3a-4fe2-9bbf-b2b120e5b2b4';

-- Step 3: Verify only ONE profile remains
SELECT id, username, email, whatsapp, whatsapp_public, email_public, website_public
FROM profiles 
WHERE LOWER(username) = 'hotrod';

-- Expected result: Only one row with username='HotRod' and your data
