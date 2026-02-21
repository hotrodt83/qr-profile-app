"use client";

import { useEffect, useMemo } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";

const SAFE_NEXT = ["/", "/create", "/edit", "/dashboard"];

function getNext(sp: { get(key: string): string | null }): string {
  const n = sp.get("next") || "/edit";
  const path = n.split("?")[0];
  return SAFE_NEXT.includes(path) ? n : "/edit";
}

export default function SecureCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = useMemo(() => getNext(sp), [sp]);

  const supabase = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace(next);
      } else {
        router.replace("/auth/email?next=" + encodeURIComponent(next));
      }
    });
  }, [supabase, next, router]);

  return (
    <main className="authEmailPage">
      <div className="authEmailCard">
        <div className="text-center">
          <p className="text-white/90 text-lg mb-2">Verifying…</p>
          <p className="text-white/60 text-sm">Redirecting…</p>
        </div>
      </div>
    </main>
  );
}
