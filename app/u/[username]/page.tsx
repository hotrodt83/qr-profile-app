import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { getBaseUrl } from "@/lib/getBaseUrl";
import PublicProfileClient from "./PublicProfileClient";
import type { Metadata } from "next";

type Props = { params: Promise<{ username: string }> };

type PublicProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
};

function getPublicUrl(username: string): string {
  const base = getBaseUrl();
  return `${base}/u/${encodeURIComponent(username)}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = createServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("display_name, username, bio")
    .eq("username", username.trim())
    .maybeSingle();
  const profile = data as PublicProfile | null;
  const title = profile?.display_name || profile?.username || username;
  const description = profile?.bio || `QR profile for @${username}`;
  const url = getPublicUrl(username);

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
    return (
      <div className="publicProfileShell">
        <div className="publicProfileCard">
          <h1 className="publicProfileTitle">Invalid link</h1>
          <Link href="/" className="publicProfileBtn publicProfileBtn--primary">Back to home</Link>
        </div>
      </div>
    );
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio")
    .eq("username", trimmed)
    .maybeSingle();
  const profile = data as PublicProfile | null;

  if (error) {
    console.error("[u/[username]] Supabase error:", error.message, error.code);
  }

  const publicUrl = getPublicUrl(trimmed);

  return (
    <PublicProfileClient
      profile={error ? null : profile}
      username={trimmed}
      publicUrl={publicUrl}
    />
  );
}
