import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import PublicProfileClient, { type PublicProfileData } from "./PublicProfileClient";

type Props = {
  params: { username: string };
};

export const dynamic = "force-dynamic";

type PublicProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  telegram: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  x_handle: string | null;
  linkedin: string | null;
  website: string | null;
};

export default async function PublicProfilePage({ params }: Props) {
  const { username } = params;

  if (!username || typeof username !== "string") {
    notFound();
  }

  const decodedUsername = decodeURIComponent(username).toLowerCase().trim();

  if (!decodedUsername) {
    notFound();
  }

  let profile: PublicProfileData = null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.rpc("get_public_profile" as never, {
      p_username: decodedUsername,
    });

    if (!error && data) {
      const row: PublicProfileRow = Array.isArray(data) ? data[0] : data;
      if (row) {
        profile = {
          id: row.id,
          username: row.username,
          display_name: row.display_name ?? null,
          bio: row.bio ?? null,
          avatar_url: row.avatar_url ?? null,
          email: row.email,
          phone: row.phone,
          whatsapp: row.whatsapp,
          telegram: row.telegram,
          facebook: row.facebook,
          instagram: row.instagram,
          tiktok: row.tiktok,
          x: row.x_handle,
          linkedin: row.linkedin,
          website: row.website,
        };
      }
    }
  }

  return (
    <PublicProfileClient
      profile={profile}
      username={decodedUsername}
    />
  );
}
