"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  onAuthed: () => void;
  onBack?: () => void;
};

export default function AuthPanel({ onAuthed, onBack }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  // If already logged in, notify parent so modal can switch to edit form
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) onAuthed();
    });
  }, [supabase.auth, onAuthed]);

  // After email confirmation redirect, recover session and notify
  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return;
    const notifyIfSession = (session: unknown) => {
      if (session) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        onAuthed();
      }
    };
    supabase.auth.getSession().then(({ data: { session } }) => notifyIfSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      notifyIfSession(session);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth, onAuthed]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      if (mode === "signup") {
        const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth?next=/edit` : undefined;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
        });
        if (error) throw error;
        setMsg("Account created. Check email if confirmation is enabled, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthed();
        return;
      }
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authCard">
      <h1>Personal QR Profile</h1>
      <p className="authSubtitle">
        {mode === "signin"
          ? "Sign in to manage your profile"
          : "Create an account to start managing your profile"}
      </p>

      <form onSubmit={onSubmit} className="authForm">
        <div className="authField">
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@email.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="authField">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={6}
          />
        </div>

        {msg ? <div className="authMessage">{msg}</div> : null}

        <button type="submit" disabled={loading} className="authBtnPrimary">
          {loading ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          className="authBtnSecondary"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>

        {onBack && (
          <button type="button" onClick={onBack} className="authBack">
            Back to home
          </button>
        )}
      </form>
    </div>
  );
}
