# Personal QR Profile

One QR code for your contact and social links. You choose what’s visible. No app required to scan.

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
   - Optionally set `NEXT_PUBLIC_APP_URL` (e.g. `https://yourapp.com`) for QR/link domain.

3. **Run**
   - `npm install`
   - `npm run dev` → [http://localhost:3001](http://localhost:3001)

**If you see “Cannot find module './72.js'” or a blank/white page:** the Next.js cache is stale. Stop the dev server (Ctrl+C), then run:
   - `npm run dev:clean`  
   or: `rm -rf .next` then `npm run dev`.  
   If port 3001 is in use, run `npm run dev:alt` for port 3000.

## Flow

- **Home** (`/`): Landing; redirects to dashboard if signed in.
- **Auth** (`/auth`): Sign up / sign in (email + password).
- **Dashboard** (`/dashboard`): Edit display name, avatar URL, and all contact/social fields; toggle “Show on profile” per field; see QR and profile link; save.
- **Public profile** (`/p/[slug]`): What scanners see — one-tap Call, Email, open link, or “Add to contacts” (vCard).

Each user has one profile and one permanent `/p/[slug]`. Updating the profile updates the page at that URL; the QR code does not change.
