import Link from "next/link";
import { getBaseUrl } from "@/lib/getBaseUrl";
import QRProfile from "@/app/components/QRProfile";
import FloatingSocialIcons from "@/app/components/FloatingSocialIcons";

export default function HomePage() {
  const baseUrl = getBaseUrl();
  const qrValue = baseUrl ? `${baseUrl.replace(/\/$/, "")}/` : "http://localhost:3001/";
  return (
    <main className="landingContainer" role="main">
      <h1 className="landingTitle">SmartQR</h1>
      <p className="landingTagline">Your identity in one scan.</p>
      <div className="ctaRow">
        <Link href="/edit" className="landingBtn landingBtnPrimary">
          Create your SmartQR
        </Link>
      </div>
      <div className="qrStage">
        <div className="qrOrbit">
          <FloatingSocialIcons />
        </div>
        <div className="qrCenter">
          <QRProfile value={qrValue} />
        </div>
      </div>
    </main>
  );
}
