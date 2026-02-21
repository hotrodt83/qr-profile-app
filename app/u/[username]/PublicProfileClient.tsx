"use client";

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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto px-4 py-12">
        {profile.avatar_url && (
          <div className="flex justify-center mb-6">
            <img
              src={profile.avatar_url}
              alt=""
              className="w-24 h-24 rounded-full object-cover"
              width={96}
              height={96}
            />
          </div>
        )}

        <h1 className="text-2xl font-bold text-center">{displayName}</h1>

        {profile.username && (
          <p className="text-white/60 text-center mt-1">@{profile.username}</p>
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
                className="block w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 transition px-4 py-3"
              >
                <span className="font-medium">{item.label}</span>
                <span className="float-right text-white/70">{item.value}</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-8 text-center">
            <p className="text-white/50 text-sm">
              No public links yet.{" "}
              <a href="/edit" className="text-blue-400 hover:text-blue-300 underline">
                Visit /edit
              </a>{" "}
              to add links and toggle them public.
            </p>
          </div>
        )}
      </div>
      <BuildStamp />
    </div>
  );
}
