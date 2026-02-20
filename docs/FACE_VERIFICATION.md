# Face verification (owner unlock)

When you **tap the QR code** on the landing page, you can optionally verify it’s you with your face before opening the edit page. No face photos are stored—only a 128‑dimensional “descriptor” (embedding) used for matching.

## Flow

1. **Tap QR** → opens `/verify?next=/edit`.
2. If not signed in → sign in with email (OTP), then return to verify.
3. If signed in but **no face enrolled** → you can “Enroll face” (camera) or “Skip to edit”.
4. If signed in and **face enrolled** → camera opens; click “Verify my face”. On match → redirect to `/edit`.

## Enrolling your face

- From the verify page: click **Enroll face** → you’re taken to `/edit?enroll=face`.
- Or open **/edit?enroll=face** when signed in.
- Allow camera, position your face, click **Capture my face**. The descriptor is saved to your profile (`face_descriptor`).

## Models

Face detection/recognition uses **face-api.js** (Tiny Face Detector + 68 landmarks + face recognition). Models live in **public/models** and are loaded from `/models`.

If you cloned the repo without the models, run once:

```bash
node scripts/download-face-models.mjs
```

## Database

- **Migration:** `supabase/migrations/20260218130000_profiles_face_descriptor.sql` adds `profiles.face_descriptor` (JSONB).
- If you use **run-in-dashboard.sql**, it also adds `face_descriptor`; run it in Supabase SQL Editor if needed.

## Privacy

- Only the numeric descriptor (128 floats) is stored; no images.
- Descriptor is in your own profile row; RLS ensures only you can read/update it.
