import { notFound } from "next/navigation";
import { createServerClient, isSupabaseConfigured, getPublicAvatarUrl } from "@/lib/supabase/server";
import { fetchPublicProfileByUsername } from "@/lib/supabase/profile";
import { getBaseUrl } from "@/lib/getBaseUrl";
import PublicProfileClient, { type PublicProfileData } from "./PublicProfileClient";

type Props = {
  params: { username: string };
};

export const dynamic = "force-dynamic";

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

  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const row = await fetchPublicProfileByUsername(supabase, decodedUsername);

    if (row) {
      const avatarUrl = await getPublicAvatarUrl(row.avatar_url);
      profile = {
        id: row.id,
        username: row.username,
        display_name: row.display_name ?? null,
        bio: row.bio ?? null,
        avatar_url: avatarUrl ?? null,
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

  const baseUrl = getBaseUrl();
  const publicUrl = `${baseUrl}/u/${encodeURIComponent(decodedUsername)}`;

  return (
    <PublicProfileClient
      profile={profile}
      username={decodedUsername}
      publicUrl={publicUrl}
    />
  );
}
