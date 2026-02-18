"use client";

import { useEffect, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import AuthPanel from "@/app/components/AuthPanel";
import EditLinksForm from "@/app/components/EditLinksForm";

type Props = {
  open: boolean;
  onClose: () => void;
  isAuthed: boolean;
  onAuthed: () => void;
  userId?: string | null;
  supabase?: ReturnType<typeof createBrowserClient> | null;
};

export default function LandingModal({
  open,
  onClose,
  isAuthed,
  onAuthed,
  userId,
  supabase,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  }

  if (!open) return null;

  const children =
    isAuthed && userId && supabase ? (
      <EditLinksForm userId={userId} supabase={supabase} onBack={onClose} />
    ) : isAuthed ? (
      <div className="edit-inner">
        <p style={{ color: "rgba(255,255,255,0.7)" }}>Loading…</p>
      </div>
    ) : (
      <AuthPanel supabase={supabase} onAuthed={onAuthed} onBack={onClose} />
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in or edit links"
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-lg mx-4 bg-[#0f0f0f] rounded-2xl border border-white/10 shadow-2xl p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
