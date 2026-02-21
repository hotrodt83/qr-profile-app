"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import ClientOnly from "@/app/components/ClientOnly";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import QRProfile from "@/app/components/QRProfile";
import FloatingSocialIcons from "@/app/components/FloatingSocialIcons";
import RuntimeErrorLogger from "@/app/components/RuntimeErrorLogger";
import LandingTitleBrain, { type LandingTitleTheme } from "@/app/components/LandingTitleBrain";
import BuildStamp from "@/app/components/BuildStamp";
import { getBaseUrl } from "@/lib/getBaseUrl";

type Props = {
  qrValue: string;
  isAuthed?: boolean;
};

function LandingWithModalInner({ qrValue: qrValueProp, isAuthed = false }: Props) {
  const router = useRouter();
  const navInFlightRef = useRef(false);

  const handleQrClick = useCallback(() => {
    if (!isAuthed) return;
    if (navInFlightRef.current) return;
    navInFlightRef.current = true;
    router.push("/edit");
    navInFlightRef.current = false;
  }, [isAuthed, router]);

  const qrValue =
    qrValueProp && qrValueProp.trim() !== ""
      ? qrValueProp
      : `${getBaseUrl().replace(/\/$/, "").trim()}/`;

  const titleTheme: LandingTitleTheme = "qr";

  const createHref = isAuthed ? "/edit" : "/create";

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
        <Link href={createHref} className="landingBtn landingBtnPrimary">
          Create SmartQR
        </Link>
      </div>
      <div className="qrStage qrStage--landing">
        <div className="qrOrbit">
          <FloatingSocialIcons />
        </div>
        <div className="qrCenter relative z-10">
          <QRProfile
            value={qrValue}
            onClick={isAuthed ? handleQrClick : undefined}
            href={undefined}
            disabled={!isAuthed}
            title={isAuthed ? "Manage your SmartQR" : "Create your SmartQR first"}
          />
        </div>
      </div>
      <BuildStamp />
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
