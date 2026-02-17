"use client";

import { EDIT_FIELDS } from "@/lib/editor-fields";
import type { EditorField } from "@/lib/editor-fields";

export type ProfileLinkItem = {
  key: EditorField["key"];
  label: string;
  href: string;
};

export default function PublicProfileLinks({ links }: { links: ProfileLinkItem[] }) {
  if (links.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-white/70">
        No public links yet.
      </div>
    );
  }

  const iconMap = new Map(EDIT_FIELDS.map((f) => [f.key, f.Icon]));

  return (
    <div className="mt-6 space-y-3">
      {links.map(({ key, label, href }) => {
        const Icon = iconMap.get(key);
        const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
        return (
          <a
            key={key}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 hover:bg-black/45 transition text-white no-underline"
          >
            {Icon && (
              <span className="flex-shrink-0 text-[rgba(0,255,255,0.9)]">
                <Icon size={22} />
              </span>
            )}
            <span className="font-medium">{label}</span>
          </a>
        );
      })}
    </div>
  );
}
