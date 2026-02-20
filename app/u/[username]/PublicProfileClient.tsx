"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { EDIT_FIELDS } from "@/lib/editor-fields";
import { downloadVCard, type VCardInput } from "@/lib/vcard";

const isOn = (v: unknown) => v === true || v === "true" || v === 1;

export type PublicProfileData = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
  website?: string | null;
  phone_public?: unknown;
  email_public?: unknown;
  whatsapp_public?: unknown;
  telegram_public?: unknown;
  website_public?: unknown;
} | null;

type ContactItem = { label: string; href: string; value: string };

type Props = {
  profile: PublicProfileData;
  username: string;
  publicUrl: string;
  /** When true, show "Invalid link" and QR points to publicUrl (e.g. home). */
  invalidLink?: boolean;
  /** Profile URL for vCard. */
  profileUrl?: string;
};

export default function PublicProfileClient({ profile, username, publicUrl, invalidLink, profileUrl }: Props) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const isEmpty = !profile || invalidLink;

  const items: ContactItem[] = profile
    ? [
        profile.phone && (profile.phone_public == null || isOn(profile.phone_public)) && {
          label: "Phone",
          href: `tel:${profile.phone}`,
          value: profile.phone,
        },
        profile.email && (profile.email_public == null || isOn(profile.email_public)) && {
          label: "Email",
          href: `mailto:${profile.email}`,
          value: profile.email,
        },
        profile.whatsapp && (profile.whatsapp_public == null || isOn(profile.whatsapp_public)) && {
          label: "WhatsApp",
          href: `https://wa.me/${String(profile.whatsapp).replace(/[^0-9]/g, "")}`,
          value: profile.whatsapp,
        },
        profile.telegram && (profile.telegram_public == null || isOn(profile.telegram_public)) && {
          label: "Telegram",
          href: `https://t.me/${String(profile.telegram).replace("@", "")}`,
          value: profile.telegram,
        },
      ].filter(Boolean) as ContactItem[]
    : [];

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

  const hasContactForVCard = items.length > 0;
  const saveContact = useCallback(() => {
    const phoneItem = items.find((i) => i.label === "Phone");
    const emailItem = items.find((i) => i.label === "Email");
    const whatsappItem = items.find((i) => i.label === "WhatsApp");
    const vcardData: VCardInput = {
      displayName: profile?.display_name || profile?.username || username,
      username: handle ? `@${handle}` : null,
      bio: profile?.bio ?? undefined,
      phone: phoneItem?.value ?? undefined,
      email: emailItem?.value ?? undefined,
      whatsapp: whatsappItem?.value ?? undefined,
      website: profile?.website ?? undefined,
      url: profileUrl ?? publicUrl,
    };
    downloadVCard(vcardData, `${username || "contact"}.vcf`);
  }, [profile, username, handle, items, profileUrl, publicUrl]);

  return (
    <div className="publicProfileShell">
      <div className="publicProfileCard">
        {/* QR + avatar + name area */}
        <div className="publicProfileQRWrap" ref={qrRef}>
          <div className="publicProfileQRInner">
            <div className="publicProfileQRCircle">
              <QRCode value={publicUrl} size={200} level="M" />
            </div>
          </div>
        </div>

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

        <h1 className="publicProfileTitle">{displayName}</h1>
        {handle && <p className="publicProfileHandle">@{handle}</p>}

        {!invalidLink && profile?.bio ? (
          <p className="publicProfileBio">{profile.bio}</p>
        ) : isEmpty ? (
          <p className="publicProfileEmptyMessage">{invalidLink ? "This link isn’t valid. Use the QR to go home or create your profile." : "Profile coming soon"}</p>
        ) : null}

        {/* Placeholder links (empty state only) */}
        {isEmpty && !invalidLink && (
          <div className="publicProfileLinks">
            {EDIT_FIELDS.slice(0, 6).map(({ key, label, Icon }) => (
              <div key={key} className="publicProfileLinkItem publicProfileLinkItem--disabled">
                <span className="publicProfileLinkIcon"><Icon size={20} /></span>
                <span>{label}</span>
                <span className="publicProfileLinkPlaceholder">Not set yet</span>
              </div>
            ))}
          </div>
        )}

        {/* Visible contact items (value exists + public flag not set or true) */}
        {!isEmpty && items.length > 0 && (
          <div className="mt-6 flex flex-col gap-3 w-full max-w-sm mx-auto">
            {items.map((it) => (
              <a
                key={it.label}
                href={it.href}
                target={it.href.startsWith("http") ? "_blank" : undefined}
                rel={it.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 transition px-4 py-3 flex items-center justify-between"
              >
                <span className="font-medium">{it.label}</span>
                <span className="opacity-80">{it.value}</span>
              </a>
            ))}
          </div>
        )}

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
