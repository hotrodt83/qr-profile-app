import dynamic from "next/dynamic";
import { getBaseUrl } from "@/lib/getBaseUrl";

const LandingWithModal = dynamic(
  () => import("@/app/components/LandingWithModal"),
  { ssr: false, loading: () => <div className="landingContainer min-h-[60vh]" role="main" aria-busy="true" /> }
);

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
  return <LandingWithModal qrValue={qrValue} />;
}
