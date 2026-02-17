"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { EDIT_FIELDS } from "@/lib/editor-fields";

export type PublicProfileData = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
} | null;

type Props = {
  profile: PublicProfileData;
  username: string;
  publicUrl: string;
};

export default function PublicProfileClient({ profile, username, publicUrl }: Props) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const isEmpty = !profile;

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [publicUrl]);

  const downloadQR = useCallback(() => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `qr-${username}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, [username]);

  const displayName = profile?.display_name || profile?.username || username || "Profile";
  const handle = profile?.username || username;

  return (
    <div className="publicProfileShell">
      <div className="publicProfileCard">
        {/* QR above the fold */}
        <div className="publicProfileQRWrap" ref={qrRef}>
          <div className="publicProfileQRInner">
            <QRCode value={publicUrl} size={200} level="M" />
          </div>
        </div>

        {/* Title */}
        <h1 className="publicProfileTitle">{displayName}</h1>
        {handle && <p className="publicProfileHandle">@{handle}</p>}

        {/* Bio or empty state message */}
        {profile?.bio ? (
          <p className="publicProfileBio">{profile.bio}</p>
        ) : isEmpty ? (
          <p className="publicProfileEmptyMessage">Profile coming soon</p>
        ) : null}

        {/* Placeholder links (empty state) or future: real links */}
        <div className="publicProfileLinks">
          {isEmpty
            ? EDIT_FIELDS.slice(0, 6).map(({ key, label, Icon }) => (
              <div key={key} className="publicProfileLinkItem publicProfileLinkItem--disabled">
                <span className="publicProfileLinkIcon"><Icon size={20} /></span>
                <span>{label}</span>
                <span className="publicProfileLinkPlaceholder">Not set yet</span>
              </div>
            ))
            : null}
        </div>

        {/* Actions */}
        <div className="publicProfileActions">
          <button type="button" onClick={copyLink} className="publicProfileBtn publicProfileBtn--secondary">
            {copied ? "Copied!" : "Share"}
          </button>
          <button type="button" onClick={downloadQR} className="publicProfileBtn publicProfileBtn--secondary">
            Download QR
          </button>
        </div>

        {/* CTAs */}
        <div className="publicProfileCTAs">
          <Link href="/auth" className="publicProfileBtn publicProfileBtn--primary">
            Create your own QR profile
          </Link>
          <Link href="/" className="publicProfileBtn publicProfileBtn--ghost">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
