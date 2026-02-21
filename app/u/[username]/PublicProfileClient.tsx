"use client";

import { useState } from "react";
import BuildStamp from "@/app/components/BuildStamp";

type ContactItem = {
  label: string;
  href: string;
  value: string;
};

type ProfileLink = {
  platform: string;
  value: string;
  sort_order: number;
};

function stripAt(s: string): string {
  return s.replace(/^@+/, "").trim();
}

function ensureHttps(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

const PLATFORM_LABELS: Record<string, string> = {
  email: "Email",
  phone: "Phone",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  x: "X",
  linkedin: "LinkedIn",
  website: "Website",
};

function buildHrefForPlatform(platform: string, value: string): string {
  switch (platform) {
    case "email":
      return `mailto:${value}`;
    case "phone":
      return `tel:${value}`;
    case "whatsapp":
      return `https://wa.me/${value.replace(/[^0-9]/g, "")}`;
    case "telegram":
      return `https://t.me/${stripAt(value)}`;
    case "facebook":
      return `https://facebook.com/${stripAt(value)}`;
    case "instagram":
      return `https://instagram.com/${stripAt(value)}`;
    case "tiktok":
      return `https://tiktok.com/@${stripAt(value)}`;
    case "x":
      return `https://x.com/${stripAt(value)}`;
    case "linkedin":
      return `https://linkedin.com/in/${stripAt(value)}`;
    case "website":
      return ensureHttps(value);
    default:
      return ensureHttps(value);
  }
}

function buildContactItemsFromLinks(links: ProfileLink[]): ContactItem[] {
  return links
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(link => ({
      label: PLATFORM_LABELS[link.platform] ?? link.platform,
      href: buildHrefForPlatform(link.platform, link.value),
      value: link.value,
    }));
}

function buildContactItemsFromProfile(profile: any): ContactItem[] {
  const items: ContactItem[] = [];

  if (profile.email) {
    items.push({ label: "Email", href: `mailto:${profile.email}`, value: profile.email });
  }
  if (profile.phone) {
    items.push({ label: "Phone", href: `tel:${profile.phone}`, value: profile.phone });
  }
  if (profile.whatsapp) {
    items.push({
      label: "WhatsApp",
      href: `https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}`,
      value: profile.whatsapp,
    });
  }
  if (profile.telegram) {
    items.push({
      label: "Telegram",
      href: `https://t.me/${stripAt(profile.telegram)}`,
      value: profile.telegram,
    });
  }
  if (profile.facebook) {
    items.push({
      label: "Facebook",
      href: `https://facebook.com/${stripAt(profile.facebook)}`,
      value: profile.facebook,
    });
  }
  if (profile.instagram) {
    items.push({
      label: "Instagram",
      href: `https://instagram.com/${stripAt(profile.instagram)}`,
      value: profile.instagram,
    });
  }
  if (profile.tiktok) {
    items.push({
      label: "TikTok",
      href: `https://tiktok.com/@${stripAt(profile.tiktok)}`,
      value: profile.tiktok,
    });
  }
  if (profile.x) {
    items.push({
      label: "X",
      href: `https://x.com/${stripAt(profile.x)}`,
      value: profile.x,
    });
  }
  if (profile.linkedin) {
    items.push({
      label: "LinkedIn",
      href: `https://linkedin.com/in/${stripAt(profile.linkedin)}`,
      value: profile.linkedin,
    });
  }
  if (profile.website) {
    items.push({
      label: "Website",
      href: ensureHttps(profile.website),
      value: profile.website,
    });
  }

  return items;
}

export default function PublicProfileClient({ profile }: { profile: any }) {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/60">Profile not found</p>
      </div>
    );
  }

  const links = profile.links || [];
  const displayName = profile.display_name || profile.username || "";
  const items = links.length > 0 
    ? buildContactItemsFromLinks(links) 
    : buildContactItemsFromProfile(profile);

  const profileUrl = typeof window !== "undefined" ? window.location.href : "";

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = profileUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setShowShareMenu(false);
  }

  function handleShareEmail() {
    const subject = encodeURIComponent(`Check out ${displayName}'s profile`);
    const body = encodeURIComponent(`Hey!\n\nCheck out this profile:\n${profileUrl}\n`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareMenu(false);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto px-4 py-12">
        <a
          href="/edit"
          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Edit Profile
        </a>

        {profile.avatar_url && (
          <div className="flex justify-center mb-6">
            <img
              src={profile.avatar_url}
              alt=""
              className="w-24 h-24 rounded-full object-cover ring-2 ring-cyan-500/30"
              width={96}
              height={96}
            />
          </div>
        )}

        <h1 className="text-2xl font-bold text-center">{displayName}</h1>

        {profile.username && (
          <p className="text-cyan-400/80 text-center mt-1">@{profile.username}</p>
        )}

        {profile.bio && (
          <p className="text-white/80 text-center mt-4">{profile.bio}</p>
        )}

        {items.length > 0 ? (
          <div className="mt-8 space-y-3">
            {items.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="block w-full rounded-xl bg-neutral-900 border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-neutral-800 transition px-4 py-3"
              >
                <span className="font-medium text-cyan-400">{item.label}</span>
                <span className="float-right text-white/70">{item.value}</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-8 text-center">
            <p className="text-white/50 text-sm">
              No public links yet.{" "}
              <a href="/edit" className="text-cyan-400 hover:text-cyan-300 underline">
                Visit /edit
              </a>{" "}
              to add links and toggle them public.
            </p>
          </div>
        )}

        {/* Share Button */}
        <div className="mt-10 relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="w-full py-3 px-4 rounded-xl bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 hover:border-cyan-500/60 transition flex items-center justify-center gap-2 text-cyan-400 font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share Profile
          </button>

          {showShareMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-neutral-900 border border-cyan-500/30 rounded-xl overflow-hidden shadow-lg shadow-black/50">
              <button
                onClick={handleCopyLink}
                className="w-full px-4 py-3 text-left hover:bg-neutral-800 transition flex items-center gap-3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-cyan-400"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
              <button
                onClick={handleShareEmail}
                className="w-full px-4 py-3 text-left hover:bg-neutral-800 transition flex items-center gap-3 border-t border-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-cyan-400"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span>Share via Email</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <BuildStamp />
    </div>
  );
}
