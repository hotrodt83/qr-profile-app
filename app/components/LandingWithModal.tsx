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
import { getBaseUrl } from "@/lib/getBaseUrl";

type Props = {
  qrValue: string;
  isAuthed?: boolean;
};

const STEPUP_COOKIE = "smartqr_stepup";

function checkStepUpCookie(): boolean {
  if (typeof document === "undefined") return false;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === STEPUP_COOKIE && value) {
      const ts = parseInt(value, 10);
      if (isNaN(ts)) return value === "1";
      return Date.now() < ts;
    }
  }
  return false;
}

function LandingWithModalInner({ qrValue: qrValueProp, isAuthed = false }: Props) {
  const router = useRouter();
  const navInFlightRef = useRef(false);
  const [stepUpOk, setStepUpOk] = useState(false);

  useEffect(() => {
    if (isAuthed) {
      setStepUpOk(checkStepUpCookie());
    }
  }, [isAuthed]);

  const authEmailNext = "/auth/email?next=" + encodeURIComponent("/verify?next=" + encodeURIComponent("/create"));
  const secureEditNext = "/secure?next=" + encodeURIComponent("/edit");

  const handleQrClick = useCallback(() => {
    if (!isAuthed) return;
    if (navInFlightRef.current) return;
    navInFlightRef.current = true;
    if (stepUpOk) {
      router.push("/edit");
    } else {
      router.push(secureEditNext);
    }
    navInFlightRef.current = false;
  }, [isAuthed, stepUpOk, router, secureEditNext]);

  const qrValue =
    qrValueProp && qrValueProp.trim() !== ""
      ? qrValueProp
      : `${getBaseUrl().replace(/\/$/, "").trim()}/`;

  const titleTheme: LandingTitleTheme = "qr";

  const createHref = isAuthed ? secureEditNext : authEmailNext;

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
