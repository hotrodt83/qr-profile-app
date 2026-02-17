"use client";

import QRCode from "react-qr-code";
import { useRouter } from "next/navigation";

export default function QRProfile({ value }: { value: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="qrClickTarget"
      onClick={() => router.push("/edit")}
      aria-label="Open edit page"
    >
      <div className="qrWrap">
        <div className="qrHolo">
          <div className="qrFace">
            <div className="qrInner">
              <QRCode value={value} size={220} />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
