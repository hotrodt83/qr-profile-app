"use client";

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
import { PLATFORM_MAP } from "./platforms";
import type { PlatformKey } from "./platforms";

function TikTokIcon({
  size = 22,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path
        d="M30 8c.7 6.2 5 10.2 10 10.6v5.4c-3.7-.1-7-1.3-10-3.5V31c0 7.2-5.8 13-13 13S4 38.2 4 31s5.8-13 13-13c.9 0 1.7.1 2.5.3v6.2c-.8-.4-1.6-.6-2.5-.6-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7V8h6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function WhatsAppIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return <MessageCircle size={size} className={className} />;
}

function XIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M18.9 3H21l-6.6 7.6L22 21h-6.2l-4.8-6.2L5.6 21H3l7.1-8.2L2 3h6.4l4.3 5.6L18.9 3Z" fill="currentColor" />
    </svg>
  );
}

export type EditorField = {
  key: keyof Pick<
    import("./supabase/database.types").ProfilesRow,
    "whatsapp" | "facebook" | "instagram" | "tiktok" | "telegram" | "linkedin" | "email" | "phone" | "x" | "website"
  >;
  label: string;
  placeholder: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const PLATFORM_TO_DB: Record<string, EditorField["key"]> = {
  whatsapp: "whatsapp",
  facebook: "facebook",
  instagram: "instagram",
  tiktok: "tiktok",
  telegram: "telegram",
  linkedin: "linkedin",
  email: "email",
  phone: "phone",
  x: "x",
  website: "website",
};

export const EDIT_FIELDS: EditorField[] = [
  { key: "email", label: "Email", placeholder: PLATFORM_MAP.get("email" as PlatformKey)?.placeholder ?? "name@email.com", Icon: Mail },
  { key: "phone", label: "Phone", placeholder: PLATFORM_MAP.get("phone" as PlatformKey)?.placeholder ?? "+1 555 555 555", Icon: Phone },
  { key: "whatsapp", label: "WhatsApp", placeholder: PLATFORM_MAP.get("whatsapp" as PlatformKey)?.placeholder ?? "+9715xxxxxxx", Icon: WhatsAppIcon },
  { key: "telegram", label: "Telegram", placeholder: PLATFORM_MAP.get("telegram" as PlatformKey)?.placeholder ?? "@username", Icon: Send },
  { key: "facebook", label: "Facebook", placeholder: PLATFORM_MAP.get("facebook" as PlatformKey)?.placeholder ?? "profile name", Icon: Facebook },
  { key: "instagram", label: "IG", placeholder: PLATFORM_MAP.get("instagram" as PlatformKey)?.placeholder ?? "@username", Icon: Instagram },
  { key: "tiktok", label: "TikTok", placeholder: PLATFORM_MAP.get("tiktok" as PlatformKey)?.placeholder ?? "@username", Icon: TikTokIcon },
  { key: "x", label: "X", placeholder: PLATFORM_MAP.get("x" as PlatformKey)?.placeholder ?? "@username", Icon: XIcon },
  { key: "linkedin", label: "LinkedIn", placeholder: PLATFORM_MAP.get("linkedin" as PlatformKey)?.placeholder ?? "in/username", Icon: Linkedin },
  { key: "website", label: "Website", placeholder: PLATFORM_MAP.get("website" as PlatformKey)?.placeholder ?? "your-site.com", Icon: Globe },
];
