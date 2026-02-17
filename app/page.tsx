import { getBaseUrl } from "@/lib/getBaseUrl";
import LandingWithModal from "@/app/components/LandingWithModal";

export default function HomePage() {
  const baseUrl = getBaseUrl();
  const qrValue = baseUrl ? `${baseUrl.replace(/\/$/, "")}/` : "http://localhost:3001/";
  return <LandingWithModal qrValue={qrValue} />;
}
