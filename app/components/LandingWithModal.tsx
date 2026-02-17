"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import QRProfile from "@/app/components/QRProfile";
import FloatingSocialIcons from "@/app/components/FloatingSocialIcons";
import LandingModal from "@/app/components/LandingModal";

type Props = {
  qrValue: string;
};

export default function LandingWithModal({ qrValue: qrValueProp }: Props) {
  const qrValue = qrValueProp && qrValueProp.trim() !== "" ? qrValueProp : "http://localhost:3001/";
  const [modalOpen, setModalOpen] = useState(false);
  const [session, setSession] = useState<{ user: { id: string } } | null>(null);

  const supabase = useMemo(() => {
    try {
      return createBrowserClient();
    } catch {
      return null;
    }
  }, []);

  function refetchSessionAndShowEditForm() {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
    });
  }

  useEffect(() => {
    if (!supabase) return;
    refetchSessionAndShowEditForm();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refetchSessionAndShowEditForm();
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <>
      <main className="landingContainer" role="main">
        <h1 className="landingTitle">SmartQR</h1>
        <p className="landingTagline">Your identity in one scan.</p>
        <div className="ctaRow">
          <button
            type="button"
            className="landingBtn landingBtnPrimary"
            onClick={() => setModalOpen(true)}
          >
            Create your SmartQR
          </button>
        </div>
        <div className="qrStage">
          <div className="qrOrbit">
            <FloatingSocialIcons />
          </div>
          <div className="qrCenter">
            <QRProfile value={qrValue} />
          </div>
        </div>
      </main>

      <LandingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        isAuthed={!!session}
        onAuthed={refetchSessionAndShowEditForm}
        userId={session?.user?.id ?? null}
        supabase={supabase}
      />
    </>
  );
}
