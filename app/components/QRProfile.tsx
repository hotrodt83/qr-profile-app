"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

type Props = {
  value: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  title?: string;
};

const qrContent = (value: string, disabled?: boolean) => (
  <div className={`qrWrap ${disabled ? "qrWrap--disabled" : "cursor-pointer"}`}>
    <div className="qrHolo">
      <div className="qrFace qrFace--scannable">
        <div className="qrInner qrInner--scannable">
          <QRCode
            value={value}
            size={168}
            level="H"
            bgColor="#FFFFFF"
            fgColor="#000000"
            title="Scan with your phone to open SmartQR"
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          />
        </div>
      </div>
    </div>
  </div>
);

export default function QRProfile({ value, onClick, href, disabled, title }: Props) {
  const tooltip = title ?? (disabled ? "Create your SmartQR first" : undefined);
  const ariaLabel = disabled ? "Create your SmartQR first" : "Open edit page";

  if (disabled) {
    return (
      <div
        className="qrClickTarget qrClickTarget--disabled"
        title={tooltip}
        role="img"
        aria-label={ariaLabel}
      >
        {qrContent(value, true)}
      </div>
    );
  }
  // Single source of truth: when onClick is provided, never use Link (avoids double navigation)
  if (onClick) {
    return (
      <button
        type="button"
        className="qrClickTarget"
        onClick={onClick}
        aria-label={ariaLabel}
        title={tooltip}
      >
        {qrContent(value)}
      </button>
    );
  }
  if (href) {
    return (
      <Link href={href} className="qrClickTarget" aria-label={ariaLabel} title={tooltip}>
        {qrContent(value)}
      </Link>
    );
  }
  const router = useRouter();
  return (
    <button
      type="button"
      className="qrClickTarget"
      onClick={() => router.push("/edit")}
      aria-label={ariaLabel}
      title={tooltip}
    >
      {qrContent(value)}
    </button>
  );
}
