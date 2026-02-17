# QR App – Cursor rules

- **Stack**: Next.js 14 (App Router), React 18, TypeScript, Supabase, `qrcode`.
- **App Router**: Use `app/` for routes and layouts; keep `page.tsx` as the route entry.
- **Client vs server**: Use `'use client'` only where needed (e.g. hooks, browser APIs, interactivity). Prefer server components by default. Use `dynamic(..., { ssr: false })` for client-only components that must not run on the server.
- **Components**: Keep UI in `app/components/`; use clear, descriptive names (e.g. `HologramQR`, `FloatingSocialIcons`).
- **Styles**: Prefer `app/globals.css` and inline styles where used in the codebase; avoid adding new CSS frameworks unless agreed.
- **Scripts**: One-off or build-time scripts live in `scripts/` (e.g. `generate-personalized-qr.js`). Use Node and existing deps where possible.
- **Types**: Use TypeScript for all new code; avoid `any`; add types for props and API/data shapes.
- **Assets**: Static assets in `public/`; reference with paths like `/qr-app-personalized.png`.
