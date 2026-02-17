"use client";

import QRCode from "react-qr-code";

export default function QRProfile({ value }: { value: string }) {
  return (
    <div className="qrWrap">
      <div className="qrHolo">
        <div className="qrFace">
          <div className="qrInner">
            <QRCode value={value} size={220} />
          </div>
        </div>
      </div>
    </div>
  );
}
