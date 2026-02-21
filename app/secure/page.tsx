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

export default function SecurePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = useMemo(() => getNext(sp), [sp]);

  const supabase = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace(next);
      } else {
        router.replace("/");
      }
    });
  }, [supabase, next, router]);

  return (
    <main className="authEmailPage">
      <div className="authEmailCard">
        <p className="text-white/70 text-center">Redirecting…</p>
      </div>
    </main>
  );
}
