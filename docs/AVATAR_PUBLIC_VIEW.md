# Avatar on public profile (/u/[username])

Public profile pages show the user’s avatar so that anyone scanning the SmartQR (including logged-out guests on mobile) can see the profile photo.

## Root cause (mobile avatar not loading)

If the avatar shows on desktop but **not on phone** when opening the public profile (e.g. after scanning the QR), the usual cause is:

- **Supabase Storage bucket `avatars` is private**  
  The app stores the **public** URL form (`/storage/v1/object/public/avatars/...`). If the bucket is not set to Public, that URL returns **403** for unauthenticated requests. Mobile guests have no session, so the image fails to load.

## Fix options (choose one)

### Option A1: Public bucket (MVP, simplest)

1. In **Supabase Dashboard** → **Storage** → **Buckets**.
2. Open the **avatars** bucket (or create it with that name).
3. Set **Public** = **ON**.
4. No code or env changes needed. The existing public URL in the DB will work for everyone.

### Option A2: Private bucket + signed URLs (secure)

Keep the bucket private and serve avatars via short-lived signed URLs:

1. In Supabase Dashboard → **Project Settings** → **API**, copy the **service_role** key (secret).
2. In your deployment (e.g. Vercel), add:
   - `SUPABASE_SERVICE_ROLE_KEY` = that key (do **not** expose it to the client).
3. Redeploy. The public profile page will:
   - Detect Supabase storage URLs in `avatar_url`,
   - Generate a signed URL (1 hour) using the service role,
   - Pass that URL to the client so the `<img>` loads for guests.

If `SUPABASE_SERVICE_ROLE_KEY` is not set, the app uses `avatar_url` as stored (so the bucket must be public for guest access).

## Code / behavior summary

- **Server** (`app/u/[username]/page.tsx`): Resolves `avatar_url` with `getPublicAvatarUrl()`. For Supabase storage URLs and when the service role is set, this returns a signed URL; otherwise the stored URL is used.
- **Client** (`PublicProfileClient.tsx`): Renders a plain `<img>` with `loading="eager"` and explicit dimensions so the avatar loads and displays reliably on mobile.
- **next.config.mjs**: `images.remotePatterns` includes the Supabase host so `next/image` can be used for Supabase storage URLs elsewhere if needed.

## Verification

- Open `/u/<username>` in an **incognito/private** window (no login).
- On **desktop**: avatar should load (check Network tab: avatar request **200**).
- On **phone** (real device): scan QR or open the same URL; avatar should be visible.
- If the avatar request is **401/403**, use either Option A1 (public bucket) or A2 (set `SUPABASE_SERVICE_ROLE_KEY`).
