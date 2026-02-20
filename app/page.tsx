import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import { getBaseUrl } from "@/lib/getBaseUrl";

const LandingWithModal = dynamic(
  () => import("@/app/components/LandingWithModal"),
  { ssr: false, loading: () => <div className="landingContainer min-h-[60vh]" role="main" aria-busy="true" /> }
);

function hasSupabaseSession(): boolean {
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.includes("sb-") && cookie.name.includes("-auth-token")) {
      if (cookie.value && cookie.value.length > 10) {
        return true;
      }
    }
  }
  return false;
}

export default function HomePage() {
  let qrValue: string;
  try {
    const baseUrl = getBaseUrl();
    qrValue = baseUrl && typeof baseUrl === "string"
      ? `${baseUrl.replace(/\/$/, "").trim()}/`
      : "http://localhost:3001/";
  } catch (_) {
    qrValue = "http://localhost:3001/";
  }

  const isAuthed = hasSupabaseSession();

  return <LandingWithModal qrValue={qrValue} isAuthed={isAuthed} />;
}
