import { notFound } from "next/navigation";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { fetchProfileByUsername } from "@/lib/supabase/profile";
import { getProfileLink } from "@/lib/links";
import type { PlatformKey } from "@/lib/platforms";
import type { EditorField } from "@/lib/editor-fields";
import Link from "next/link";
import PublicProfileLinks from "@/app/components/PublicProfileLinks";

const LINK_KEYS: EditorField["key"][] = [
  "whatsapp", "facebook", "instagram", "tiktok", "telegram",
  "linkedin", "email", "phone", "x", "website",
];

type Props = { params: Promise<{ slug: string }> };

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = await params;
  if (!isSupabaseConfigured()) notFound();
  const supabase = createServerClient();
  const profile = await fetchProfileByUsername(supabase, slug);

  if (!profile) notFound();

  const links = LINK_KEYS.filter((key) => {
    const v = profile[key];
    const pubKey = `${key}_public`;
    const isPublic = profile[pubKey as keyof typeof profile];
    return v != null && String(v).trim() !== "" && !!isPublic;
  }).map((key) => {
    const value = String(profile[key]).trim();
    const href = getProfileLink(key as PlatformKey, value);
    const label = key === "instagram" ? "IG" : key.charAt(0).toUpperCase() + key.slice(1);
    return { key, label, href };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#070812] to-black text-white">
      <div className="mx-auto max-w-xl px-5 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <div className="min-w-0">
            <div className="text-2xl font-semibold truncate">{profile.username || "Profile"}</div>
            {profile.username && <div className="text-white/60 truncate">@{profile.username}</div>}
          </div>
          <PublicProfileLinks links={links} />
          <div className="mt-6 text-center text-white/50 text-sm">
            Want your own QR profile? <Link className="text-white underline" href="/">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
