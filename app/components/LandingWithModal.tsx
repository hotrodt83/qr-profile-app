"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ClientOnly from "@/app/components/ClientOnly";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import QRProfile from "@/app/components/QRProfile";
import FloatingSocialIcons from "@/app/components/FloatingSocialIcons";
import RuntimeErrorLogger from "@/app/components/RuntimeErrorLogger";
import LandingTitleBrain, { type LandingTitleTheme } from "@/app/components/LandingTitleBrain";
import { createBrowserClient } from "@/lib/supabase/client";
import { useHasProfile } from "@/lib/useHasProfile";
import { getBaseUrl } from "@/lib/getBaseUrl";

type Props = {
  qrValue: string;
};

function LandingWithModalInner({ qrValue: qrValueProp }: Props) {
  const router = useRouter();
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null);
  const navInFlightRef = useRef(false);
  const { hasProfile, profile, loading: profileLoading } = useHasProfile();

  useEffect(() => {
    setSupabase(createBrowserClient());
  }, []);

  const isFirstTimeUser = !profileLoading && !hasProfile;

  const authEmailNext = "/auth/email?next=" + encodeURIComponent("/verify?next=" + encodeURIComponent("/create"));

  const handleQrClick = useCallback(async () => {
    if (navInFlightRef.current) return;
    navInFlightRef.current = true;
    try {
      if (!supabase) {
        router.push(authEmailNext);
        return;
      }
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        router.push(authEmailNext);
        return;
      }
      if (!hasProfile) {
        router.push("/create");
        return;
      }
      router.push("/verify?next=" + encodeURIComponent("/edit"));
    } catch {
      router.push(authEmailNext);
    } finally {
      navInFlightRef.current = false;
    }
  }, [supabase, router, hasProfile]);

  const qrValue =
    qrValueProp && qrValueProp.trim() !== ""
      ? qrValueProp
      : `${getBaseUrl().replace(/\/$/, "").trim()}/`;

  const profileUrl = hasProfile && profile?.username?.trim()
    ? `${getBaseUrl().replace(/\/$/, "").trim()}/u/${encodeURIComponent(profile.username.trim())}`
    : undefined;

  /** Landing wordmark colour. Options: qr (matches QR ring), cyan, futuristic, gold, violet, mint, coral. */
  const titleTheme: LandingTitleTheme = "qr";

  return (
    <main className="landingContainer" role="main">
      <RuntimeErrorLogger />
      <h1 className="landingTitle" data-theme={titleTheme}>
        <span className="landingTitleText">SMART</span>
        <LandingTitleBrain theme={titleTheme} />
        <span className="landingTitleText">R</span>
      </h1>
      <p className="landingTagline">Your identity in one scan.</p>
      <div className="ctaRow">
        <Link href="/create" className="landingBtn landingBtnPrimary">
          Create SmartQR
        </Link>
      </div>
      <div className="qrStage qrStage--landing">
        <div className="qrOrbit">
          <FloatingSocialIcons />
        </div>
        <div className="qrCenter relative z-10">
          <QRProfile
            value={profileUrl ?? qrValue}
            onClick={isFirstTimeUser ? undefined : handleQrClick}
            href={isFirstTimeUser ? undefined : profileUrl}
            disabled={isFirstTimeUser}
            title={isFirstTimeUser ? "Create your SmartQR first" : undefined}
          />
        </div>
      </div>
    </main>
  );
}

export default function LandingWithModal(props: Props) {
  return (
    <ErrorBoundary>
      <ClientOnly>
        <LandingWithModalInner {...props} />
      </ClientOnly>
    </ErrorBoundary>
  );
}
