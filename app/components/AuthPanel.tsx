"use client";

import { useMemo, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type Props = {
  onAuthed: () => void;
  onBack?: () => void;
  supabase?: SupabaseClient<Database> | null;
  /** Redirect target after auth (e.g. "/edit?enroll=face"). Defaults to "/edit". */
  nextUrl?: string;
};

export default function AuthPanel({ onAuthed, onBack, supabase: supabaseProp, nextUrl = "/edit" }: Props) {
  const supabase = useMemo(() => {
    if (supabaseProp !== undefined) return supabaseProp;
    try {
      return createClient();
    } catch {
      return null;
    }
  }, [supabaseProp]);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) onAuthed();
    });
  }, [supabase, onAuthed]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !email.trim()) return;
    
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const redirectUrl = typeof window !== "undefined" 
        ? `${window.location.origin}/secure/callback?next=${encodeURIComponent(nextUrl)}`
        : nextUrl;

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (otpError) {
        setError(otpError.message);
      } else {
        setStep("otp");
        setMessage("Check your email! We sent you a 6-digit code.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !email.trim() || !otp.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: "email",
      });

      if (verifyError) {
        setError(verifyError.message);
      } else {
        onAuthed();
      }
    } catch (err) {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!supabase) {
    return (
      <div className="authCard">
        <h1>SmartQR</h1>
        <p className="authSubtitle" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
          Sign-in is not configured. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>.
        </p>
        {onBack && (
          <button type="button" onClick={onBack} className="authBack">
            Back to home
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="authCard">
      <h1>{step === "email" ? "Login to save" : "Enter code"}</h1>
      
      {step === "email" ? (
        <>
          <p className="authSubtitle">
            We'll send a one-time code to your email. No password needed.
          </p>
          <form onSubmit={handleSendOtp}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
              className="authInput"
              style={{
                width: "100%",
                padding: "12px 16px",
                marginBottom: 12,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                fontSize: 16,
              }}
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="authBtnPrimary"
              style={{ width: "100%", marginBottom: 12, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Sending..." : "Send code"}
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="authSubtitle" style={{ color: "#4ade80" }}>
            {message}
          </p>
          <p className="authSubtitle" style={{ fontSize: 14, marginTop: 8 }}>
            Sent to: <strong>{email}</strong>
          </p>
          <form onSubmit={handleVerifyOtp}>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              required
              disabled={loading}
              maxLength={6}
              className="authInput"
              style={{
                width: "100%",
                padding: "12px 16px",
                marginBottom: 12,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                fontSize: 24,
                textAlign: "center",
                letterSpacing: 8,
              }}
            />
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="authBtnPrimary"
              style={{ width: "100%", marginBottom: 12, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Verifying..." : "Verify code"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => { setStep("email"); setOtp(""); setError(null); }}
            className="authBack"
            style={{ marginTop: 8 }}
          >
            Use different email
          </button>
        </>
      )}

      {error && (
        <p style={{ color: "#f87171", marginTop: 8, fontSize: 14 }}>{error}</p>
      )}

      {onBack && (
        <button type="button" onClick={onBack} className="authBack" style={{ marginTop: 16 }}>
          Back
        </button>
      )}
    </div>
  );
}
