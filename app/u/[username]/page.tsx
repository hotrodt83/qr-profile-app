import { createServerClient, isSupabaseConfigured, getPublicAvatarUrl } from "@/lib/supabase/server";
import { getBaseUrl } from "@/lib/getBaseUrl";
import PublicProfileClient from "./PublicProfileClient";
import type { Metadata } from "next";

type Props = { params: Promise<{ username: string }> };

type PublicProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  telegram: string | null;
  instagram: string | null;
  facebook: string | null;
  x: string | null;
  website: string | null;
  phone_public: boolean | null;
  email_public: boolean | null;
  whatsapp_public: boolean | null;
  telegram_public: boolean | null;
  instagram_public: boolean | null;
  facebook_public: boolean | null;
  x_public: boolean | null;
  website_public: boolean | null;
  email_verified: boolean | null;
};

/** Contact fields to show on public profile and in vCard (only when public + verified). */
export type PublicContactFields = {
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  website?: string | null;
};

function getPublicUrl(username: string): string {
  const base = getBaseUrl();
  return `${base}/u/${encodeURIComponent(username)}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const trimmed = (username ?? "").trim();
  if (!isSupabaseConfigured()) {
    const title = trimmed || "Profile";
    const description = trimmed ? `SmartQR profile for @${trimmed}` : "SmartQR profile";
    const url = trimmed ? getPublicUrl(trimmed) : "";
    return {
      title: `${title} | SmartQR`,
      description: description.slice(0, 160),
      openGraph: { title: `${title} | SmartQR`, description: description.slice(0, 160), url, siteName: "SmartQR" },
      twitter: { card: "summary_large_image", title: `${title} | SmartQR`, description: description.slice(0, 160) },
    };
  }
  const supabase = createServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("display_name, username, bio")
    .eq("username", trimmed)
    .maybeSingle();
  const profile = data as PublicProfile | null;
  const title = profile?.display_name || profile?.username || trimmed || "Profile";
  const description = profile?.bio || `SmartQR profile for @${trimmed}`;
  const url = trimmed ? getPublicUrl(trimmed) : "";

  return {
    title: `${title} | SmartQR`,
    description: description.slice(0, 160),
    openGraph: {
      title: `${title} | SmartQR`,
      description: description.slice(0, 160),
      url,
      siteName: "SmartQR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | SmartQR`,
      description: description.slice(0, 160),
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const trimmed = username?.trim() || "";

  if (!trimmed) {
    const homeUrl = getBaseUrl() + "/";
    return (
      <PublicProfileClient
        profile={null}
        username=""
        publicUrl={homeUrl}
        invalidLink
      />
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <PublicProfileClient
        profile={null}
        username={trimmed}
        publicUrl={getPublicUrl(trimmed)}
        profileUrl={getPublicUrl(trimmed)}
      />
    );
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url, phone, email, whatsapp, telegram, instagram, facebook, x, website, phone_public, email_public, whatsapp_public, telegram_public, instagram_public, facebook_public, x_public, website_public, email_verified")
    .eq("username", trimmed)
    .maybeSingle();
  const row = data as PublicProfile | null;

  if (error) {
    console.error("[u/[username]] Supabase error:", error.message, error.code);
  }

  const publicUrl = getPublicUrl(trimmed);
  const resolvedAvatarUrl = row?.avatar_url ? await getPublicAvatarUrl(row.avatar_url) : null;
  const profileForClient = row
    ? {
        id: row.id,
        username: row.username,
        display_name: row.display_name,
        bio: row.bio,
        avatar_url: resolvedAvatarUrl ?? row.avatar_url,
        phone: row.phone,
        email: row.email,
        whatsapp: row.whatsapp,
        telegram: row.telegram,
        instagram: row.instagram,
        facebook: row.facebook,
        x: row.x,
        website: row.website,
        phone_public: row.phone_public,
        email_public: row.email_public,
        whatsapp_public: row.whatsapp_public,
        telegram_public: row.telegram_public,
        instagram_public: row.instagram_public,
        facebook_public: row.facebook_public,
        x_public: row.x_public,
        website_public: row.website_public,
      }
    : null;

  return (
    <PublicProfileClient
      profile={error ? null : profileForClient}
      username={trimmed}
      publicUrl={publicUrl}
      profileUrl={publicUrl}
    />
  );
}
