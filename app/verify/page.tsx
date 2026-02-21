"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/useSession";

const SAFE_NEXT = ["/", "/create", "/edit"];
function getNext(sp: { get(key: string): string | null }): string {
  const n = sp.get("next") || "/create";
  const path = n.split("?")[0];
  return SAFE_NEXT.includes(path) ? n : "/create";
}

export default function VerifyPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = useMemo(() => getNext(sp), [sp]);
  const { user, loading: sessionLoading } = useSession();

  useEffect(() => {
    if (sessionLoading) return;
    if (user) {
      router.replace(next);
    }
  }, [sessionLoading, user, next, router]);

  if (sessionLoading) {
    return (
      <main className="verifyPage">
        <div className="verifyCard">
          <p className="verifyCard__message">Loading…</p>
        </div>
      </main>
    );
  }

  if (user) {
    return (
      <main className="verifyPage">
        <div className="verifyCard">
          <p className="verifyCard__message">Redirecting…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="verifyPage">
      <div className="verifyCard">
        <div className="verifyCard__icon verifyCard__icon--lock" aria-hidden />
        <h1 className="verifyCard__title">Verify by email</h1>
        <p className="verifyCard__subtitle">
          Sign in with your email to unlock and continue to your edit page. We’ll send a one-time code to your inbox.
        </p>
        <div className="verifyCard__actions">
          <Link
            href={`/auth/email?next=${encodeURIComponent(next)}`}
            className="verifyCard__btnPrimary"
          >
            Continue with email
          </Link>
        </div>
      </div>
    </main>
  );
}
