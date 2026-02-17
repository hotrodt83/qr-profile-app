"use client";

import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

type Props = { value: string; onClick?: () => void };

export default function QRProfile({ value, onClick }: Props) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="qrClickTarget"
      onClick={() => (onClick ? onClick() : router.push("/edit"))}
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
