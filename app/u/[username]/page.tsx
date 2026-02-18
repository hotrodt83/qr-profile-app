import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getBaseUrl } from "@/lib/getBaseUrl";
import PublicProfileClient from "./PublicProfileClient";
import type { Metadata } from "next";

type Props = { params: Promise<{ username: string }> };

type PublicProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  website: string | null;
  phone_public: boolean | null;
  email_public: boolean | null;
  whatsapp_public: boolean | null;
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
    const description = trimmed ? `QR profile for @${trimmed}` : "QR profile";
    const url = trimmed ? getPublicUrl(trimmed) : "";
    return {
      title: `${title} | QR Profile`,
      description: description.slice(0, 160),
      openGraph: { title: `${title} | QR Profile`, description: description.slice(0, 160), url, siteName: "QR Profile" },
      twitter: { card: "summary_large_image", title: `${title} | QR Profile`, description: description.slice(0, 160) },
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
  const description = profile?.bio || `QR profile for @${trimmed}`;
  const url = trimmed ? getPublicUrl(trimmed) : "";

  return {
    title: `${title} | QR Profile`,
    description: description.slice(0, 160),
    openGraph: {
      title: `${title} | QR Profile`,
      description: description.slice(0, 160),
      url,
      siteName: "QR Profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | QR Profile`,
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
        contactFields={{}}
        profileUrl={getPublicUrl(trimmed)}
      />
    );
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, phone, email, whatsapp, website, phone_public, email_public, whatsapp_public, email_verified")
    .eq("username", trimmed)
    .maybeSingle();
  const row = data as PublicProfile | null;

  if (error) {
    console.error("[u/[username]] Supabase error:", error.message, error.code);
  }

  const publicUrl = getPublicUrl(trimmed);
  const verified = !!row?.email_verified;
  const contactFields: PublicContactFields = {};
  if (row && verified) {
    if (row.phone_public && row.phone) contactFields.phone = row.phone;
    if (row.email_public && row.email) contactFields.email = row.email;
    if (row.whatsapp_public && row.whatsapp) contactFields.whatsapp = row.whatsapp;
    if (row.website) contactFields.website = row.website;
  } else if (row && row.website) {
    contactFields.website = row.website;
  }

  const profileForClient = row
    ? { id: row.id, username: row.username, display_name: row.display_name, bio: row.bio }
    : null;

  return (
    <PublicProfileClient
      profile={error ? null : profileForClient}
      username={trimmed}
      publicUrl={publicUrl}
      contactFields={contactFields}
      profileUrl={publicUrl}
    />
  );
}
