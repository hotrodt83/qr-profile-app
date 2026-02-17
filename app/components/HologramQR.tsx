"use client";

import React from "react";
import QRCode from "react-qr-code";
import FloatingSocialIcons from "./FloatingSocialIcons";

export default function HologramQR({
  value,
  onQrClick,
}: {
  value: string;
  onQrClick?: () => void;
}) {
  const center = (
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

  return (
    <div className="qrStage">
      <div className="qrCenterStack">
        <FloatingSocialIcons radius={170} />
        {onQrClick ? (
          <button type="button" className="qrClickTarget" onClick={onQrClick} aria-label="Open edit page">
            {center}
          </button>
        ) : (
          center
        )}
      </div>
    </div>
  );
}
