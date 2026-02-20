# SmartQR

Your identity in one scan. One QR code for your contact and social links. You choose what’s visible. No app required to scan.

## Stack

- Next.js 14 (App Router), React 18, TypeScript
- Supabase (Auth + Postgres)
- QR code generation via `qrcode`

## Setup

1. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - In SQL Editor, run the migration:  
     `supabase/migrations/001_profiles.sql`
   - In Project Settings → API: copy **Project URL** and **anon public** key.

2. **Env**
   - Copy `.env.example` to `.env.local`.
   - Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - For production (e.g. Vercel), set `NEXT_PUBLIC_SITE_URL` to your public URL (e.g. `https://smartqr.vercel.app`) so QR codes and share links use it. Locally use `http://localhost:3001`.

3. **Run**
   - `npm install`
   - `npm run dev` → [http://localhost:3001](http://localhost:3001)

**If you see “Cannot find module './72.js'” or a blank/white page:** the Next.js cache is stale. Stop the dev server (Ctrl+C), then run:
   - `npm run dev:clean`  
   or: `rm -rf .next` then `npm run dev`.  
   If port 3001 is in use, run `npm run dev:alt` for port 3000.

## Auth & user flow

**Authentication is email-only** (Supabase OTP or magic link). No SMS, no phone, no Twilio.

- **New user**: Landing → **Create SmartQR** → Edit → Save → confirmation → auto-redirect to **Share**.
- **Returning user**: Landing → **My SmartQR / Edit** → email verification → Edit → Save → auto-redirect to Share.
- After successful save we always redirect to Share. Verification is email-only; resend is rate-limited.

## Flow

- **Home** (`/`): Landing with "Create SmartQR" and "My SmartQR / Edit".
- **Edit** (`/edit`): Edit profile; guests must sign in (email OTP) to save.
- **Share** (`/share`): After save — Email, QR code, Copy URL.
- **Public profile** (`/u/[username]`): What scanners see.

Each user has one profile. Updating the profile updates `/u/[username]`.

## Vercel (production)

- **Project name**: You can rename the Vercel project to **smartqr** in [Vercel Dashboard](https://vercel.com) → Project Settings → General → Project Name. The app does not depend on the project name; all URLs come from `NEXT_PUBLIC_SITE_URL`.
- After renaming, set **Production** env var `NEXT_PUBLIC_SITE_URL` to your new URL (e.g. `https://smartqr.vercel.app`) and redeploy. QR and share links will use that URL.
