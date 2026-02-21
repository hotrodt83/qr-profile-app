"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const SAFE_NEXT = ["/", "/create", "/edit", "/dashboard"];
const RESEND_COOLDOWN_SEC = 60;
const REF_STORAGE_KEY = "smartqr_ref";

function isValidRef(ref: string): boolean {
  if (ref.length < 3 || ref.length > 30) return false;
  return /^[a-zA-Z0-9_]+$/.test(ref);
}

function getValidRef(ref: string | null): string | null {
  if (!ref) return null;
  const cleaned = ref.toLowerCase();
  if (!isValidRef(cleaned)) return null;
  return cleaned;
}

function storeRefParam(ref: string | null): void {
  const valid = getValidRef(ref);
  if (!valid) return;
  try {
    localStorage.setItem(REF_STORAGE_KEY, valid);
  } catch {
    // localStorage not available
  }
}

function getNext(sp: { get(key: string): string | null }): string {
  const n = sp.get("next") || "/create";
  const path = n.split("?")[0];
  return SAFE_NEXT.includes(path) ? n : "/create";
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

export default function EmailAuthPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = useMemo(() => getNext(sp), [sp]);
  const validRef = useMemo(() => getValidRef(sp.get("ref")), [sp]);

  // Store ref param in localStorage on mount
  useEffect(() => {
    storeRefParam(validRef);
  }, [validRef]);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const resendCooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const supabase = useMemo(() => createBrowserClient(), []);

  const handleEmailPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const fromEvent = e.clipboardData?.getData?.("text/plain") ?? e.clipboardData?.getData?.("text") ?? "";
    if (fromEvent) {
      const value = fromEvent.trim();
      setEmail(value);
      if (emailInputRef.current) emailInputRef.current.value = value;
      return;
    }
    if (typeof navigator?.clipboard?.readText === "function") {
      navigator.clipboard.readText().then((text) => {
        const value = (text ?? "").trim();
        setEmail(value);
        if (emailInputRef.current) emailInputRef.current.value = value;
      }).catch(() => {});
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const fromEvent = e.clipboardData?.getData?.("text/plain") ?? e.clipboardData?.getData?.("text") ?? "";
    if (fromEvent) {
      e.preventDefault();
      const digits = fromEvent.replace(/\D/g, "");
      setCode(digits);
      if (codeInputRef.current) codeInputRef.current.value = digits;
      return;
    }
    if (typeof navigator?.clipboard?.readText === "function") {
      navigator.clipboard.readText().then((text) => {
        const digits = (text ?? "").replace(/\D/g, "");
        if (digits) {
          setCode(digits);
          if (codeInputRef.current) codeInputRef.current.value = digits;
        }
      }).catch(() => {});
    }
    // If we got no clipboard data here, we did NOT call preventDefault, so the browser's
    // native paste will run and the field will get the pasted text via default behavior.
  };

  // If already signed in, or after magic-link redirect (tokens in URL hash), go to next
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(next);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") router.replace(next);
    });
    return () => subscription.unsubscribe();
  }, [supabase, next, router]);

  const sendCode = async () => {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    setError(null);
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/email?next=${encodeURIComponent(next)}` : undefined;
    const { error: err } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        shouldCreateUser: true,
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

  const verifyCode = async () => {
    if (!code.trim()) {
      setError("Please enter the code from your email.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    setBusy(false);
    if (err) return setError(err.message);
    router.replace(next);
  };

  useEffect(() => () => {
    if (resendCooldownRef.current) clearInterval(resendCooldownRef.current);
  }, []);

  return (
    <main className="authEmailPage">
      <div className="authEmailCard">
        <header className="authEmailHeader">
          <h1>Email login</h1>
          <p>We’ll send a one-time code to your email. No password.</p>
          {validRef && (
            <p className="text-sm text-emerald-400 mt-2">
              Referred by @{validRef}
            </p>
          )}
          {sent && (
            <p className="authEmailHint">
              Check your inbox. If you received a <strong>link</strong> instead of a code, click the link in the email to sign in.
            </p>
          )}
        </header>

        <div className="authEmailForm">
          {!sent ? (
            <>
              <div className="authField">
                <label htmlFor="auth-email-otp">Email</label>
                <input
                  ref={emailInputRef}
                  id="auth-email-otp"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onPaste={handleEmailPaste}
                  placeholder="you@domain.com"
                  autoComplete="email"
                />
              </div>
              <button
                type="button"
                disabled={!email.trim() || busy}
                onClick={sendCode}
                className="authBtnPrimary"
              >
                {busy ? "Sending…" : "Send code"}
              </button>
              {error && (
                <div className="authMessage" role="alert">
                  {error}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="authField authField--code">
                <label htmlFor="auth-code">Enter code</label>
                <input
                  ref={codeInputRef}
                  id="auth-code"
                  type="text"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onPaste={handleCodePaste}
                  placeholder="e.g. 11311557"
                  autoFocus
                  aria-label="One-time login code"
                />
              </div>
              <button
                type="button"
                disabled={!code.trim() || busy}
                onClick={verifyCode}
                className="authBtnPrimary"
              >
                {busy ? "Verifying…" : "Verify & continue"}
              </button>
              <button
                type="button"
                disabled={busy || resendCooldown > 0}
                onClick={sendCode}
                className="authBtnSecondary"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
              </button>
            </>
          )}

          {sent && error && (
            <div className="authMessage" role="alert">
              {error}
            </div>
          )}
        </div>

        <footer className="authEmailFooter">
          <Link href={next} className="authBack">
            ← Back
          </Link>
        </footer>
      </div>
    </main>
  );
}
