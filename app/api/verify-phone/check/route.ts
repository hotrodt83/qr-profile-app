import { NextResponse } from "next/server";

/** Phone verification is disabled; app uses email-only verification. */
export async function POST() {
  return NextResponse.json(
    { error: "Phone verification is not available. Use email verification only." },
    { status: 410 }
  );
}
