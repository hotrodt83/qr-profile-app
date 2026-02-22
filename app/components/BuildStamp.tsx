"use client";

import Link from "next/link";

const BUILD_COMMIT = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "dev";
const SHORT_SHA = BUILD_COMMIT.slice(0, 7);

export default function BuildStamp() {
  return (
    <footer className="fixed bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/30 font-mono pointer-events-auto z-50 flex items-center gap-2">
      <Link href="/privacy" className="hover:text-white/50 transition">
        Privacy
      </Link>
      <span>·</span>
      <Link href="/terms" className="hover:text-white/50 transition">
        Terms
      </Link>
      <span>·</span>
      <span className="select-all">build: {SHORT_SHA}</span>
    </footer>
  );
}
