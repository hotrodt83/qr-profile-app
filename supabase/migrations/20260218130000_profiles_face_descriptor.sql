-- Add optional face descriptor for owner verification (128-dim embedding, stored as JSONB array).
-- Only the embedding is stored; no face images. Used for face unlock when tapping QR.
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS face_descriptor jsonb DEFAULT NULL;

COMMENT ON COLUMN profiles.face_descriptor IS 'Face recognition embedding (128 floats) for owner verification; no image stored.';