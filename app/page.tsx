import Link from "next/link";
import { getBaseUrl } from "@/lib/getBaseUrl";
import QRProfile from "@/app/components/QRProfile";
import FloatingSocialIcons from "@/app/components/FloatingSocialIcons";

export default function HomePage() {
  const baseUrl = getBaseUrl();
  const demoProfileUrl = `${baseUrl}/u/demo`;
  return (
    <main className="homeStage">
      <div className="homeCenter">
        <FloatingSocialIcons />
        <div className="landingBlock">
          <QRProfile value={demoProfileUrl} />
          <h1 className="landingTitle">SmartQR</h1>
          <p className="landingTagline">
            Create a personal profile page. Share one link—socials, contact, and more.
          </p>
          <div className="landingCTAs">
            <Link href="/auth" className="landingBtn landingBtnPrimary">
              Create your QR profile
            </Link>
            <Link href="/u/demo" className="landingBtn landingBtnSecondary">
              View demo
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
