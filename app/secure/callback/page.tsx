"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";

const SAFE_NEXT = ["/", "/create", "/edit", "/dashboard"];
const STEPUP_COOKIE = "smartqr_stepup";
const STEPUP_TTL_MS = 10 * 60 * 1000;

function getNext(sp: { get(key: string): string | null }): string {
  const n = sp.get("next") || "/edit";
  const path = n.split("?")[0];
  return SAFE_NEXT.includes(path) ? n : "/edit";
}

function setStepUpCookie() {
  const expiresAt = Date.now() + STEPUP_TTL_MS;
  document.cookie = `${STEPUP_COOKIE}=${expiresAt}; path=/; max-age=600; SameSite=Lax`;
}

export default function SecureCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = useMemo(() => getNext(sp), [sp]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    let mounted = true;

    async function verifyAndRedirect() {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data.user) {
          if (mounted) {
            setStatus("error");
            setErrorMsg("Session not found. Please try signing in again.");
          }
          return;
        }

        setStepUpCookie();

        if (mounted) {
          setStatus("success");
          setTimeout(() => {
            router.replace(next);
          }, 500);
        }
      } catch (err) {
        if (mounted) {
          setStatus("error");
          setErrorMsg("An unexpected error occurred.");
        }
      }
    }

    verifyAndRedirect();

    return () => {
      mounted = false;
    };
  }, [supabase, next, router]);

  if (status === "loading") {
    return (
      <main className="authEmailPage">
        <div className="authEmailCard">
          <div className="text-center">
            <p className="text-white/90 text-lg mb-2">Verifying…</p>
            <p className="text-white/60 text-sm">Please wait while we confirm your identity.</p>
          </div>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="authEmailPage">
        <div className="authEmailCard">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-2">Verification failed</p>
            <p className="text-white/60 text-sm mb-4">{errorMsg}</p>
            <button
              type="button"
              onClick={() => router.push("/secure?next=" + encodeURIComponent(next))}
              className="authBtnPrimary"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="authEmailPage">
      <div className="authEmailCard">
        <div className="text-center">
          <p className="text-green-400 text-lg mb-2">Verified!</p>
          <p className="text-white/60 text-sm">Redirecting…</p>
        </div>
      </div>
    </main>
  );
}
