"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { EDIT_FIELDS } from "@/lib/editor-fields";
import { downloadVCard, type VCardInput } from "@/lib/vcard";
import type { PublicContactFields } from "./page";

export type PublicProfileData = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url?: string | null;
} | null;

type Props = {
  profile: PublicProfileData;
  username: string;
  publicUrl: string;
  /** When true, show "Invalid link" and QR points to publicUrl (e.g. home). */
  invalidLink?: boolean;
  /** Contact fields to show and include in vCard (only when public + verified). */
  contactFields?: PublicContactFields;
  /** Profile URL for vCard. */
  profileUrl?: string;
};

export default function PublicProfileClient({ profile, username, publicUrl, invalidLink, contactFields = {}, profileUrl }: Props) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const isEmpty = !profile || invalidLink;

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
      a.download = downloadFilename;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, [invalidLink, username]);

  const downloadFilename = invalidLink ? "qr-home.png" : `qr-${username}.png`;
  const displayName = invalidLink ? "Invalid link" : (profile?.display_name || profile?.username || username || "Profile");
  const handle = invalidLink ? undefined : (profile?.username || username);

  const hasContactForVCard =
    contactFields?.phone || contactFields?.email || contactFields?.whatsapp || contactFields?.website;
  const saveContact = useCallback(() => {
    const vcardData: VCardInput = {
      displayName: profile?.display_name || profile?.username || username,
      username: handle ? `@${handle}` : null,
      bio: profile?.bio ?? undefined,
      phone: contactFields?.phone ?? undefined,
      email: contactFields?.email ?? undefined,
      whatsapp: contactFields?.whatsapp ?? undefined,
      website: contactFields?.website ?? undefined,
      url: profileUrl ?? publicUrl,
    };
    downloadVCard(vcardData, `${username || "contact"}.vcf`);
  }, [profile, username, handle, contactFields, profileUrl, publicUrl]);

  return (
    <div className="publicProfileShell">
      <div className="publicProfileCard">
        {/* QR above the fold */}
        <div className="publicProfileQRWrap" ref={qrRef}>
          <div className="publicProfileQRInner">
            <QRCode value={publicUrl} size={200} level="M" />
          </div>
        </div>

        {/* Profile photo */}
        {profile?.avatar_url && (
          <div className="publicProfileAvatarWrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar_url}
              alt=""
              className="publicProfileAvatar"
              loading="eager"
              decoding="async"
              width={120}
              height={120}
            />
          </div>
        )}

        {/* Title */}
        <h1 className="publicProfileTitle">{displayName}</h1>
        {handle && <p className="publicProfileHandle">@{handle}</p>}

        {/* Bio or empty state message */}
        {!invalidLink && profile?.bio ? (
          <p className="publicProfileBio">{profile.bio}</p>
        ) : isEmpty ? (
          <p className="publicProfileEmptyMessage">{invalidLink ? "This link isn’t valid. Use the QR to go home or create your profile." : "Profile coming soon"}</p>
        ) : null}

        {/* Placeholder links (empty state only; hide for invalid link) */}
        <div className="publicProfileLinks">
          {isEmpty && !invalidLink
            ? EDIT_FIELDS.slice(0, 6).map(({ key, label, Icon }) => (
              <div key={key} className="publicProfileLinkItem publicProfileLinkItem--disabled">
                <span className="publicProfileLinkIcon"><Icon size={20} /></span>
                <span>{label}</span>
                <span className="publicProfileLinkPlaceholder">Not set yet</span>
              </div>
            ))
            : null}
        </div>

        {/* Contact links (when public + verified) */}
        {hasContactForVCard && (
          <div className="publicProfileLinks">
            {contactFields?.phone && (
              <a href={`tel:${contactFields.phone}`} className="publicProfileLinkItem">
                <span className="publicProfileLinkIcon">📞</span>
                <span>Phone</span>
              </a>
            )}
            {contactFields?.email && (
              <a href={`mailto:${contactFields.email}`} className="publicProfileLinkItem">
                <span className="publicProfileLinkIcon">✉️</span>
                <span>Email</span>
              </a>
            )}
            {contactFields?.whatsapp && (
              <a href={`https://wa.me/${contactFields.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="publicProfileLinkItem">
                <span className="publicProfileLinkIcon">WhatsApp</span>
                <span>WhatsApp</span>
              </a>
            )}
            {contactFields?.website && (
              <a href={contactFields.website.startsWith("http") ? contactFields.website : `https://${contactFields.website}`} target="_blank" rel="noopener noreferrer" className="publicProfileLinkItem">
                <span className="publicProfileLinkIcon">🌐</span>
                <span>Website</span>
              </a>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="publicProfileActions">
          <button type="button" onClick={copyLink} className="publicProfileBtn publicProfileBtn--secondary">
            {copied ? "Copied!" : "Share"}
          </button>
          <button type="button" onClick={downloadQR} className="publicProfileBtn publicProfileBtn--secondary">
            Download QR
          </button>
          {hasContactForVCard && (
            <button type="button" onClick={saveContact} className="publicProfileBtn publicProfileBtn--secondary">
              Save Contact
            </button>
          )}
        </div>

        {/* CTAs */}
        <div className="publicProfileCTAs">
          <Link href="/edit" className="publicProfileBtn publicProfileBtn--primary">
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
