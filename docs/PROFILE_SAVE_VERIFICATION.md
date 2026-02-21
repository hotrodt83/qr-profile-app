# Profile save persistence – verification checklist

Use this after deploying profile-save fixes to confirm persistence and avatar behavior.

## Root cause (fixed)

**One-sentence root cause:** Save was done only from the browser directly to Supabase; in production the client could be using placeholder env or the session/JWT might not be sent correctly, so the write either failed silently or never reached the real DB—and the UI showed "Saved" before confirming persistence. The edit page then re-fetched and got no row, so the form appeared empty.

**Fix:** Profile save now goes through **POST /api/profile/save** (server-side). The server uses the request’s `Authorization: Bearer <access_token>` to get the user and upsert the profile. The UI shows "Saved ✅" only when the API returns **200** with a profile that has a username. Failures are logged server-side and returned to the client so the UI shows the real error and never shows "Saved".

## Files changed

- **`app/api/profile/save/route.ts`** (new) – POST handler: validates session from Bearer token, validates payload, calls `upsertProfile`, returns 200 + profile or 4xx/5xx + error. Logs all failures with `console.error`.
- **`app/components/EditLinksForm.tsx`** – Save flow now calls `POST /api/profile/save` with JSON payload and `Authorization: Bearer <token>`. "Saved ✅" only on 200 and when returned profile has username. Load error UI has a **Retry** button that re-fetches from DB. Avatar upload prefers `/api/upload-avatar` so the DB stores a stable public URL (fallback: data URL).
- **`lib/supabase/profile.ts`** – (unchanged for save; already has `upsertProfile`, `validateProfilePayload`.)
- **`lib/useHasProfile.ts`** – Handles fetch errors via `profileError`; no redirect to `/create` on error.
- **`app/edit/page.tsx`** – Uses `profileError`; shows retry UI on load error.

## Verify in production (Vercel + Supabase)

### 1. Environment

- In **Vercel** → Project → Settings → Environment Variables, confirm:
  - `NEXT_PUBLIC_SUPABASE_URL` (e.g. `https://xxx.supabase.co`)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Redeploy after changing env vars so they are baked into the build.
- Optional (for signed avatar URLs): `SUPABASE_SERVICE_ROLE_KEY` for private storage.

### 2. Save request (exact endpoint / response)

- **Endpoint:** `POST /api/profile/save` (same origin as your app, e.g. `https://your-app.vercel.app/api/profile/save`).
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <access_token>`.
- **Body:** JSON object with `username`, `display_name`, `bio`, `avatar_url`, link fields, `*_public` booleans, etc. (same shape as `ProfilePayload`).
- **Success:** Status **200**, body `{ profile: { id, username, ... } }`. Only then does the UI show "Saved ✅" and redirect to the user's public profile (`/u/[username]`).
- **Failure:** Status **401** (not logged in), **400** (validation), **403** (RLS), **409** (username taken), **500** (server/DB error). Body `{ error: "..." }`. UI shows that message and does **not** show "Saved".

### 3. Reproduce and confirm (desktop)

1. Open production URL. Sign in, go to Edit (or Create then Edit), fill profile (username required), optionally add photo, click **Save**.
2. In **DevTools → Network**, find the request to **`/api/profile/save`** (not Supabase directly). Confirm **Method: POST**, **Status: 200**, response body has `profile` with `username`.
3. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R), then go to **Edit** again. Form should be re-hydrated from DB (not empty).
4. If save fails (e.g. disconnect Supabase), you should see the error message in the UI and **no** "Saved ✅".

### 4. Save and reload (mobile)

1. On a real device or mobile emulator, open the production URL, sign in, fill and save profile.
2. Close tab or refresh, then open **Edit** again. Form and photo should still be there.

### 5. Image on mobile and desktop

1. Upload a profile photo (prefer file upload so the app uses `/api/upload-avatar` and stores a stable public URL), save, then open the public profile (e.g. `/u/yourname`) on desktop and on mobile.
2. Avatar should render in both. If it’s missing only on mobile, ensure the stored `avatar_url` is a Supabase Storage public URL (not an overly long data URL).

### 6. When save fails

- UI must **not** show "Saved ✅". You should see the real error (e.g. "Username already taken", "Session expired", "You don't have permission...").
- In **Vercel** → Logs (or server console), you should see: `[api/profile/save] auth failed:` or `[api/profile/save] upsert failed:` with detail.

## RLS policies (Supabase)

If inserts/updates fail with permission or RLS errors, ensure these policies exist. Run in **Supabase Dashboard → SQL Editor**:

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

## Quick regression checklist

- [ ] Save works after hard refresh (form re-hydrates from DB).
- [ ] Save works on mobile (same behavior as desktop).
- [ ] Avatar renders on mobile and desktop on public profile.
- [ ] Network: **POST /api/profile/save** returns 200 and DB row is updated (check in Supabase Table Editor).
- [ ] On save failure, UI shows real error and does **not** show "Saved ✅".
- [ ] On profile load failure, edit page shows "Could not load your profile" with **Retry** and **Back** buttons.
