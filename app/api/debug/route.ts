import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return NextResponse.json({
    ok: true,
    env: {
      hasUrl: Boolean(url),
      hasAnon: Boolean(anon),
    },
    runtime: "nodejs",
    timestamp: new Date().toISOString(),
  });
}
