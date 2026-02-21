"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const SAFE_NEXT = ["/", "/create", "/edit", "/dashboard"];
const RESEND_COOLDOWN_SEC = 60;

function getNext(sp: { get(key: string): string | null }): string {
  const n = sp.get("next") || "/edit";
  const path = n.split("?")[0];
  return SAFE_NEXT.includes(path) ? n : "/edit";
}

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const at = trimmed.indexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return false;
  const domain = trimmed.slice(at + 1);
  if (!domain.includes(".") || domain.startsWith(".") || domain.endsWith(".")) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export default function SecurePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = useMemo(() => getNext(sp), [sp]);

  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(true);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const resendCooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const supabase = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email);
        setEmail(data.user.email);
      }
      setLoading(false);
    });
  }, [supabase]);

  useEffect(() => {
    if (!loading && !userEmail) {
      router.replace("/auth/email?next=" + encodeURIComponent("/secure?next=" + encodeURIComponent(next)));
    }
  }, [loading, userEmail, next, router]);

  const handleEmailPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const fromEvent = e.clipboardData?.getData?.("text/plain") ?? e.clipboardData?.getData?.("text") ?? "";
    if (fromEvent) {
      const value = fromEvent.trim();
      setEmail(value);
      if (emailInputRef.current) emailInputRef.current.value = value;
    }
  };

  const sendVerification = async () => {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (userEmail && trimmed.toLowerCase() !== userEmail.toLowerCase()) {
      setError("Email must match the logged-in account.");
      return;
    }

    setBusy(true);
    setError(null);

    const redirectTo = typeof window !== "undefined"
      ? `${window.location.origin}/secure/callback?next=${encodeURIComponent(next)}`
      : undefined;

    const { error: err } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: redirectTo,
      },
    });

    setBusy(false);
    if (err) return setError(err.message);

    setSent(true);
    setResendCooldown(RESEND_COOLDOWN_SEC);
    if (resendCooldownRef.current) clearInterval(resendCooldownRef.current);
    resendCooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (resendCooldownRef.current) {
            clearInterval(resendCooldownRef.current);
            resendCooldownRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => {
    if (resendCooldownRef.current) clearInterval(resendCooldownRef.current);
  }, []);

  if (loading) {
    return (
      <main className="authEmailPage">
        <div className="authEmailCard">
          <p className="text-white/70 text-center">Loading…</p>
        </div>
      </main>
    );
  }

  if (!userEmail) {
    return (
      <main className="authEmailPage">
        <div className="authEmailCard">
          <p className="text-white/70 text-center">Redirecting to sign in…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="authEmailPage">
      <div className="authEmailCard">
        <header className="authEmailHeader">
          <h1>Confirm it&apos;s you</h1>
          <p>To manage or edit your SmartQR profile, confirm via email.</p>
          {sent && (
            <p className="authEmailHint">
              Check your inbox. Click the <strong>link</strong> in the email to verify and continue.
            </p>
          )}
        </header>

        <div className="authEmailForm">
          {!sent ? (
            <>
              <div className="authField">
                <label htmlFor="secure-email">Email</label>
                <input
                  ref={emailInputRef}
                  id="secure-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onPaste={handleEmailPaste}
                  placeholder="you@domain.com"
                  autoComplete="email"
                  readOnly={!!userEmail}
                  className={userEmail ? "opacity-70" : ""}
                />
                {userEmail && (
                  <p className="text-xs text-white/50 mt-1">
                    Verification will be sent to your logged-in email.
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={!email.trim() || busy}
                onClick={sendVerification}
                className="authBtnPrimary"
              >
                {busy ? "Sending…" : "Send verification link"}
              </button>
              {error && (
                <div className="authMessage" role="alert">
                  {error}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-white/70 text-center py-4">
                Verification link sent to <strong>{email}</strong>
              </p>
              <button
                type="button"
                disabled={busy || resendCooldown > 0}
                onClick={sendVerification}
                className="authBtnSecondary"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend link"}
              </button>
              {error && (
                <div className="authMessage" role="alert">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        <footer className="authEmailFooter">
          <Link href="/" className="authBack">
            ← Back to home
          </Link>
        </footer>
      </div>
    </main>
  );
}
