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

  return (
    <div
      className="landingModalOverlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in or edit links"
    >
      <div className="landingModalPanel" ref={panelRef}>
        <button
          type="button"
          className="landingModalClose"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {isAuthed && userId && supabase ? (
          <EditLinksForm userId={userId} supabase={supabase} onBack={onClose} />
        ) : isAuthed ? (
          <div className="edit-inner">
            <p style={{ color: "rgba(255,255,255,0.7)" }}>Loading…</p>
          </div>
        ) : (
          <AuthPanel onAuthed={onAuthed} onBack={onClose} />
        )}
      </div>
    </div>
  );
}
