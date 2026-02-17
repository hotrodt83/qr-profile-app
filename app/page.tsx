import Link from "next/link";
import { getBaseUrl } from "@/lib/getBaseUrl";
import QRProfile from "@/app/components/QRProfile";
import FloatingSocialIcons from "@/app/components/FloatingSocialIcons";

export default function HomePage() {
  const baseUrl = getBaseUrl();
  const demoProfileUrl = `${baseUrl}/u/demo`;
  return (
    <main className="homeStage" role="main">
      <div className="homeCenter">
        <div className="landingContainer">
          <h1 className="landingTitle">SmartQR</h1>
          <p className="landingTagline">Your identity in one scan.</p>
          <div className="landingCTAs">
            <Link href="/auth" className="landingBtn landingBtnPrimary">
              Create your SmartQR
            </Link>
            <Link href="/u/demo" className="landingBtn landingBtnSecondary">
              View demo
            </Link>
          </div>
          <div className="qrStage">
            <div className="qrOrbit">
              <FloatingSocialIcons />
            </div>
            <div className="qrCenter">
              <QRProfile value={demoProfileUrl} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
