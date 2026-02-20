import { notFound } from "next/navigation";
import { createServerClient, isSupabaseConfigured, getPublicAvatarUrl } from "@/lib/supabase/server";
import { fetchProfileByUsername } from "@/lib/supabase/profile";
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
    const row = await fetchProfileByUsername(supabase, decodedUsername);

    if (row) {
      const avatarUrl = await getPublicAvatarUrl(row.avatar_url);
      profile = {
        id: row.id,
        username: row.username,
        display_name: row.display_name ?? null,
        bio: row.bio ?? null,
        avatar_url: avatarUrl ?? null,
        phone: row.phone,
        email: row.email,
        whatsapp: row.whatsapp,
        telegram: row.telegram,
        instagram: row.instagram,
        facebook: row.facebook,
        x: row.x,
        website: row.website,
        phone_public: row.phone_public ?? null,
        email_public: row.email_public ?? null,
        whatsapp_public: row.whatsapp_public ?? null,
        telegram_public: row.telegram_public ?? null,
        instagram_public: row.instagram_public ?? null,
        facebook_public: row.facebook_public ?? null,
        x_public: row.x_public ?? null,
        website_public: row.website_public ?? null,
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
      profileUrl={publicUrl}
    />
  );
}
