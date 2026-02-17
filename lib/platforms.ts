// lib/platforms.ts
// Single source of truth for all supported platforms

export type PlatformKey =
  | "phone"
  | "email"
  | "website"
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "telegram"
  | "linkedin"
  | "x"
  | "youtube"
  | "tiktok"
  | "messenger"
  | "discord"
  | "snapchat"
  | "reddit"
  | "signal"
  | "pinterest"
  | "threads"
  | "viber"
  | "line"
  | "wechat";

export type PlatformDef = {
  key: PlatformKey;
  label: string;
  placeholder: string;
  buildUrl: (value: string) => string;
  normalize?: (value: string) => string;
};

// helpers
const stripAt = (s: string) => s.replace(/^@+/, "").trim();
const onlyNumbers = (s: string) => s.replace(/\D/g, "");

export const PLATFORMS: PlatformDef[] = [
  // Core
  {
    key: "phone",
    label: "Phone",
    placeholder: "+1 555 555 555",
    buildUrl: (v) => `tel:${onlyNumbers(v)}`,
  },
  {
    key: "email",
    label: "Email",
    placeholder: "name@email.com",
    buildUrl: (v) => `mailto:${v}`,
  },
  {
    key: "website",
    label: "Website",
    placeholder: "your-site.com",
    normalize: (v) =>
      v.startsWith("http://") || v.startsWith("https://")
        ? v
        : `https://${v}`,
    buildUrl: (v) =>
      v.startsWith("http://") || v.startsWith("https://")
        ? v
        : `https://${v}`,
  },

  {
    key: "whatsapp",
    label: "WhatsApp",
    placeholder: "+9715xxxxxxx",
    buildUrl: (v) => `https://wa.me/${onlyNumbers(v)}`,
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "@username",
    normalize: stripAt,
    buildUrl: (v) => `https://instagram.com/${stripAt(v)}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "profile name",
    buildUrl: (v) => `https://facebook.com/${stripAt(v)}`,
  },
  {
    key: "telegram",
    label: "Telegram",
    placeholder: "@username",
    normalize: stripAt,
    buildUrl: (v) => `https://t.me/${stripAt(v)}`,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "in/username",
    buildUrl: (v) => `https://linkedin.com/in/${stripAt(v)}`,
  },
  {
    key: "x",
    label: "X (Twitter)",
    placeholder: "@username",
    normalize: stripAt,
    buildUrl: (v) => `https://x.com/${stripAt(v)}`,
  },
  {
    key: "youtube",
    label: "YouTube",
    placeholder: "@channel",
    buildUrl: (v) =>
      v.startsWith("http") ? v : `https://youtube.com/${stripAt(v)}`,
  },
  {
    key: "tiktok",
    label: "TikTok",
    placeholder: "@username",
    normalize: stripAt,
    buildUrl: (v) => `https://tiktok.com/@${stripAt(v)}`,
  },
  {
    key: "messenger",
    label: "Messenger",
    placeholder: "username",
    buildUrl: (v) => `https://m.me/${stripAt(v)}`,
  },

  // Optional
  {
    key: "discord",
    label: "Discord",
    placeholder: "username",
    buildUrl: (v) => `https://discord.com/users/${v}`,
  },
  {
    key: "snapchat",
    label: "Snapchat",
    placeholder: "username",
    buildUrl: (v) => `https://snapchat.com/add/${stripAt(v)}`,
  },
  {
    key: "reddit",
    label: "Reddit",
    placeholder: "u/username",
    buildUrl: (v) => `https://reddit.com/user/${stripAt(v)}`,
  },
  {
    key: "signal",
    label: "Signal",
    placeholder: "number",
    buildUrl: (v) => `https://signal.me/#p/${onlyNumbers(v)}`,
  },
  {
    key: "pinterest",
    label: "Pinterest",
    placeholder: "username",
    buildUrl: (v) => `https://pinterest.com/${stripAt(v)}`,
  },
  {
    key: "threads",
    label: "Threads",
    placeholder: "@username",
    normalize: stripAt,
    buildUrl: (v) => `https://www.threads.net/@${stripAt(v)}`,
  },

  // Regional
  {
    key: "viber",
    label: "Viber",
    placeholder: "number",
    buildUrl: (v) => `viber://chat?number=${onlyNumbers(v)}`,
  },
  {
    key: "line",
    label: "LINE",
    placeholder: "line id",
    buildUrl: (v) => `https://line.me/R/ti/p/~${stripAt(v)}`,
  },
  {
    key: "wechat",
    label: "WeChat",
    placeholder: "wechat id",
    buildUrl: (v) => `weixin://dl/chat?${stripAt(v)}`,
  },
];

export const PLATFORM_MAP = new Map(
  PLATFORMS.map((p) => [p.key, p])
);

export const PLATFORM_KEYS = PLATFORMS.map((p) => p.key);

export type PlatformConfigItem = {
  label: string;
  placeholder: string;
  inputType: "text" | "url" | "email" | "tel";
  urlTemplate: (value: string) => string;
  action: "url" | "tel" | "mailto";
};

export const PLATFORM_CONFIG: Record<PlatformKey, PlatformConfigItem> = Object.fromEntries(
  PLATFORMS.map((p) => [
    p.key,
    {
      label: p.label,
      placeholder: p.placeholder,
      inputType: p.key === "email" ? "email" : p.key === "phone" ? "tel" : p.key === "website" ? "url" : "text",
      urlTemplate: (v: string) => {
        const normalized = p.normalize ? p.normalize(v) : v;
        return p.buildUrl(normalized);
      },
      action: p.key === "phone" ? "tel" : p.key === "email" ? "mailto" : "url",
    },
  ])
) as Record<PlatformKey, PlatformConfigItem>;
