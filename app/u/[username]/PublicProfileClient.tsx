"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { EDIT_FIELDS } from "@/lib/editor-fields";

const isOn = (v: unknown) => v === true || v === "true" || v === 1;
const stripAt = (s: string) => String(s).replace(/^@+/, "").trim();
const ensureHttps = (url: string) =>
  url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;

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
  instagram?: string | null;
  facebook?: string | null;
  x?: string | null;
  website?: string | null;
  phone_public?: unknown;
  email_public?: unknown;
  whatsapp_public?: unknown;
  telegram_public?: unknown;
  instagram_public?: unknown;
  facebook_public?: unknown;
  x_public?: unknown;
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
          href: `https://t.me/${stripAt(profile.telegram)}`,
          value: profile.telegram,
        },
        profile.instagram && (profile.instagram_public == null || isOn(profile.instagram_public)) && {
          label: "Instagram",
          href: `https://instagram.com/${stripAt(profile.instagram)}`,
          value: profile.instagram,
        },
        profile.facebook && (profile.facebook_public == null || isOn(profile.facebook_public)) && {
          label: "Facebook",
          href: `https://facebook.com/${stripAt(profile.facebook)}`,
          value: profile.facebook,
        },
        profile.x && (profile.x_public == null || isOn(profile.x_public)) && {
          label: "X",
          href: `https://x.com/${stripAt(profile.x)}`,
          value: profile.x,
        },
        profile.website && (profile.website_public == null || isOn(profile.website_public)) && {
          label: "Website",
          href: ensureHttps(profile.website),
          value: profile.website,
        },
      ].filter(Boolean) as ContactItem[]
    : [];

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [publicUrl]);

  const displayName = invalidLink ? "Invalid link" : (profile?.display_name || profile?.username || username || "Profile");
  const handle = invalidLink ? undefined : (profile?.username || username);

  return (
    <div className="publicProfileShell">
      <div className="publicProfileCard">
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
        </div>

        <div className="publicProfileCTAs">
          <Link
            href={`/auth/email?ref=${encodeURIComponent(handle ?? username)}`}
            className="publicProfileBtn publicProfileBtn--primary"
          >
            Create your own QR profile
          </Link>
        </div>
      </div>
    </div>
  );
}
