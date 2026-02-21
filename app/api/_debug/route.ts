import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return NextResponse.json({
    hasUrl: Boolean(url),
    hasAnonKey: Boolean(anon),
    supabaseUrlHost: (() => {
      try {
        return new URL(url).host;
      } catch {
        return null;
      }
    })(),
    anonKeyPrefix: anon ? anon.slice(0, 12) + "..." : null,
    nodeEnv: process.env.NODE_ENV,
  });
}
