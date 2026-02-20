# Supabase Auth – make sign up / sign in work

**Authentication is email-only.** This app uses **Email OTP** (one-time code or magic link): no password, no SMS, no phone. User enters email → receives a code/link → enters code or clicks link → signed in. Do not enable or use Twilio or any phone/SMS provider for auth.

If you see **"Invalid login credentials"** (password flow) or OTP doesn’t work, check the following in your **Supabase project**.

---

## 1. Environment variables

In the app (e.g. `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL` = your project URL (e.g. `https://xxxxx.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your project **anon public** key

Get both from: **Supabase Dashboard → Project Settings → API**.

Restart the dev server after changing env vars.

---

## 2. Enable Email provider and OTP

1. In **Supabase Dashboard** go to **Authentication → Providers**.
2. Open **Email**.
3. Ensure **Email** is **Enabled** (toggle ON).
4. For **Email OTP** (one-time code): enable **“Confirm email”** is optional; the app uses `signInWithOtp` and `verifyOtp` so users get a code in the email and enter it. No password needed.
5. Save.

---

## 3. Email confirmation (most common cause of “Invalid login credentials”)

If **Confirm email** is ON, users must click the link in the confirmation email before they can sign in. Until then, **Sign in with password** returns “Invalid login credentials”.

**Option A – Require confirmation (recommended for production)**  
- Leave **Confirm email** ON.  
- After sign up, tell users to check inbox (and spam) and click the link, then sign in.

**Option B – Allow sign in without confirmation (easier for testing)**  
1. **Authentication → Providers → Email**.  
2. Turn **OFF** “Confirm email”.  
3. Save.  
4. New sign-ups can sign in immediately with email + password.

---

## 4. Redirect URLs (for “Confirm email” and magic links)

1. **Authentication → URL Configuration**.
2. **Site URL**: your app URL (e.g. `http://localhost:3001` for dev or `https://yourdomain.com` for prod).
3. **Redirect URLs**: add your auth page and edit page, e.g.  
   `http://localhost:3001/auth/email`  
   `http://localhost:3001/edit`  
   `https://yourdomain.com/auth/email`  
   `https://yourdomain.com/edit`  
   so confirmation and magic links land on your app.

---

## 5. Show 6-digit code in the email (instead of only a link)

By default Supabase sends a **Magic Link** email (“Follow this link to login” with a “Log In” button). The app supports that: **clicking the link signs you in** and sends you to the edit page.

If you want users to see a **6-digit code** in the email and type it on the page:

1. In **Supabase Dashboard** go to **Authentication → Email Templates**.
2. Open the **Magic Link** template.
3. Change the **Message body** to include the OTP code. For example:

```html
<h2>Your login code</h2>
<p>Enter this code on the sign-in page:</p>
<p style="font-size:24px; font-weight:700; letter-spacing:4px;">{{ .Token }}</p>
<p>Or <a href="{{ .ConfirmationURL }}">click here to log in</a>.</p>
```

4. **Subject** can stay “Your Magic Link” or be changed to e.g. “Your login code”.
5. Save.

After this, the email will show the 6-digit code (`{{ .Token }}`) so users can enter it in the “Enter code” field. The link still works if they prefer to click it.

---

## 6. Check that real keys are used

If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing or wrong, the app may use a placeholder and auth will never work.  
In the browser console or network tab, requests should go to **your** `https://xxxxx.supabase.co`, not to a placeholder URL.

---

## Quick checklist

- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the correct project.
- [ ] **Authentication → Providers → Email** is **Enabled**.
- [ ] Either **Confirm email** is OFF (for testing) or users confirm email before signing in.
- [ ] **Authentication → URL Configuration**: **Site URL** and **Redirect URLs** include `.../auth/email` and `.../edit`.
- [ ] (Optional) **Email Templates → Magic Link**: add `{{ .Token }}` to the body if you want the 6-digit code in the email.
- [ ] (Optional) **Authentication → Settings**: set OTP/magic link expiry to 5–10 minutes for security.
- [ ] Dev server restarted after changing env vars.

After this, sign up and sign in should work. If you still get “Invalid login credentials”, use **Confirm email OFF** for testing, or ensure the user has clicked the confirmation link before signing in.
