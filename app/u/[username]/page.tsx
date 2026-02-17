import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ username: string }> };

type PublicProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
};

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  if (!username?.trim()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black text-white">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <div className="text-2xl font-semibold">Invalid link</div>
          <Link href="/" className="mt-4 inline-block text-cyan-300 hover:underline">Go home</Link>
        </div>
      </div>
    );
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio")
    .eq("username", username.trim())
    .maybeSingle();
  const profile = data as PublicProfile | null;

  if (error) {
    console.error("[u/[username]] Supabase error:", error.message, error.code);
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black text-white">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <div className="text-2xl font-semibold">Profile not found</div>
          <div className="mt-2 text-white/70">
            This QR link is invalid or the profile was removed.
          </div>
          <Link href="/" className="mt-4 inline-block text-cyan-300 hover:underline">Go home</Link>
        </div>
      </div>
    );
  }

  // If found → show profile
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <h1 className="text-3xl font-bold">{profile.display_name || profile.username || "Profile"}</h1>

        {profile.username && <p className="mt-2 text-white/70">@{profile.username}</p>}

        {profile.bio && (
          <p className="mt-4 text-white/80">{profile.bio}</p>
        )}
      </div>
    </div>
  );
}
