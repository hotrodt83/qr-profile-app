"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SAFE_NEXT_PATHS = ["/", "/edit", "/dashboard"];
function sanitizeNext(raw: string | null): string {
  const path = (raw || "/edit").split("?")[0];
  if (SAFE_NEXT_PATHS.includes(path)) return path;
  if (path.startsWith("/edit")) return "/edit";
  return "/edit";
}

export default function AuthPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sanitizeNext(sp.get("next"));
  const modeParam = sp.get("mode");
  const [mode, setMode] = useState<"signin" | "signup">(modeParam === "signup" ? "signup" : "signin");

  const supabase = useMemo(() => createClient(), []);

  // If already logged in, go straight to next (e.g. /edit)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace(next);
    });
  }, [supabase.auth, next, router]);

  // After email confirmation, Supabase redirects here with hash; recover session and redirect to next
  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return;
    const redirectIfSession = (session: unknown) => {
      if (session) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        router.replace(next);
      }
    };
    supabase.auth.getSession().then(({ data: { session } }) => redirectIfSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      redirectIfSession(session);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth, next, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      if (mode === "signup") {
        const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth?next=${encodeURIComponent(next)}` : undefined;
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
        router.replace(next);
        return;
      }
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
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

          <button type="button" onClick={() => router.push("/")} className="authBack">
            Back to home
          </button>

          <p className="authTip">
            Tip: after sign in you'll be redirected to <span>{next}</span>
          </p>
        </form>
      </div>
    </main>
  );
}
