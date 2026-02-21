"use client";

const BUILD_COMMIT = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "dev";
const SHORT_SHA = BUILD_COMMIT.slice(0, 7);

export default function BuildStamp() {
  return (
    <footer className="fixed bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/30 font-mono select-all pointer-events-auto z-50">
      build: {SHORT_SHA}
    </footer>
  );
}
