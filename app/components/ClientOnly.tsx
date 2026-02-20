"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Mount-gate: renders children only after client mount.
 * Prevents hydration/runtime mismatch when children use window/document/localStorage/navigator.
 */
export default function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
