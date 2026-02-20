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
   - **Production (Vercel)**: Set `NEXT_PUBLIC_SITE_URL` to your live URL (e.g. `https://your-app.vercel.app`) in Vercel Environment Variables so copy/email/QR on Share use a working link. See **Vercel (production)** below.
   - **Local**: In `.env.local` you can set `NEXT_PUBLIC_SITE_URL=http://localhost:3001`; for shareable links that work for others, deploy and use the Share page on the live site.

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

- **Project name**: You can rename the Vercel project to **smartqr** in [Vercel Dashboard](https://vercel.com) → Project Settings → General → Project Name. The app does not depend on the project name; all share and QR links use `NEXT_PUBLIC_SITE_URL`.
- **Required for share links**: In [Vercel Dashboard](https://vercel.com) → your project → **Settings** → **Environment Variables**, add:
  - **Name**: `NEXT_PUBLIC_SITE_URL`
  - **Value**: your live site URL, e.g. `https://qr-app-theta-tawny.vercel.app` or `https://smartqr.vercel.app` (no trailing slash)
  - **Environment**: Production (and Preview if you want share/QR to work in preview deployments)
- Redeploy after setting the variable. Copy, email, and QR on the Share page will then use this URL so links work for others. If this is missing on production, the app still runs but share links may be wrong; on localhost, the Share page shows a warning and asks you to use the live site.
