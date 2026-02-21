import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import PublicProfileClient from "./PublicProfileClient";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { username: string };
};

export default async function PublicProfilePage({ params }: PageProps) {
  const username = params.username;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !anon) {
    notFound();
  }

  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.rpc("get_public_profile", {
    p_username: username,
  });

  if (error || !data || data.length === 0) {
    return notFound();
  }

  return <PublicProfileClient profile={data[0]} />;
}
