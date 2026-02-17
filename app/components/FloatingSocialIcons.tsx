"use client";

/*__ICON_RING_VERSION__=V999__*/

import React from "react";
import {
  Instagram,
  Facebook,
  Send,
  Globe,
  MessageCircle,
  Phone,
  Linkedin,
  Mail,
} from "lucide-react";

/** TikTok SVG icon (simple, clean) */
function TikTokIcon({
  size = 22,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M30 8c.7 6.2 5 10.2 10 10.6v5.4c-3.7-.1-7-1.3-10-3.5V31c0 7.2-5.8 13-13 13S4 38.2 4 31s5.8-13 13-13c.9 0 1.7.1 2.5.3v6.2c-.8-.4-1.6-.6-2.5-.6-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7V8h6Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** WhatsApp icon (lucide doesn't have official WA logo; we use MessageCircle as WA placeholder) */
function WhatsAppIcon({
  size = 22,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  // You can swap this to a real WA image later; keeps hologram style now.
  return <MessageCircle size={size} className={className} />;
}

/** X icon (use lucide Twitter but render as X using simple svg for accuracy) */
function XIcon({
  size = 22,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M18.9 3H21l-6.6 7.6L22 21h-6.2l-4.8-6.2L5.6 21H3l7.1-8.2L2 3h6.4l4.3 5.6L18.9 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

type Item = {
  key: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const ITEMS: Item[] = [
  { key: "wa", label: "WhatsApp", Icon: WhatsAppIcon },
  { key: "fb", label: "Facebook", Icon: Facebook },
  { key: "ig", label: "Instagram", Icon: Instagram },
  { key: "tt", label: "TikTok", Icon: TikTokIcon },
  { key: "tg", label: "Telegram", Icon: Send },
  { key: "in", label: "LinkedIn", Icon: Linkedin },
  { key: "mail", label: "Email", Icon: Mail },
  { key: "phone", label: "Phone", Icon: Phone },
  { key: "x", label: "X", Icon: XIcon },
  { key: "web", label: "Website", Icon: Globe },
];

export default function FloatingSocialIcons({
  radius = 170,
  size = 22,
  startAngle = -90,
}: {
  radius?: number;
  size?: number;
  startAngle?: number;
}) {
  const step = 360 / ITEMS.length;

  return (
    <div className="iconOrbit" aria-hidden="true">
      {ITEMS.map(({ key, Icon, label }, i) => {
        const angle = startAngle + step * i;

        return (
          <div
            key={key}
            className="holoIconPos"
            style={{
              transform: `rotate(${angle}deg) translateX(${radius}px) rotate(${-angle}deg)`,
            }}
            title={label}
          >
            <div className="holoIcon" style={{ animationDelay: `${i * 0.12}s` }}>
              <Icon className="holoSvg" size={size} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
