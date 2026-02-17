# Fix Supabase email confirmation redirect (production)

Email confirmation was redirecting to localhost because Supabase uses **Site URL** and **Redirect URLs** from the dashboard. Do this once:

## 1. Supabase Dashboard

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **URL Configuration**.
3. Set **Site URL** to your production URL:
   ```
   https://qr-app-theta-tawny.vercel.app
   ```
4. Under **Redirect URLs**, add (one per line):
   ```
   https://qr-app-theta-tawny.vercel.app/**
   http://localhost:3001/**
   ```
   Click **Save**.

## 2. App (already done)

- Sign-up now sends `emailRedirectTo` using the current origin (so production signups get the Vercel URL).
- After confirmation, the auth page recovers the session from the link and redirects to `/edit`.

## 3. Redeploy

Redeploy on Vercel so the auth change is live (or push to main if you use Git deploy).

## 4. Optional: custom domain

If you add a custom domain on Vercel, add it to **Redirect URLs** in Supabase as well, e.g. `https://yourdomain.com/**`.
