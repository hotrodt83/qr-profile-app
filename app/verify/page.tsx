"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/useSession";

const SAFE_NEXT = ["/", "/create", "/edit", "/dashboard"];
function getNext(sp: { get(key: string): string | null }): string {
  const n = sp.get("next") || "/edit";
  const path = n.split("?")[0];
  return SAFE_NEXT.includes(path) ? n : "/edit";
}

export default function VerifyPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = useMemo(() => getNext(sp), [sp]);
  const { user, loading: sessionLoading } = useSession();

  useEffect(() => {
    if (sessionLoading) return;
    router.replace(user ? next : "/");
  }, [sessionLoading, user, next, router]);

  return (
    <main className="verifyPage">
      <div className="verifyCard">
        <p className="verifyCard__message">Redirecting…</p>
      </div>
    </main>
  );
}
