/**
 * Build a vCard 3.0 string from public profile fields. Only include fields that are provided.
 * Used for "Save Contact" on public profile.
 */
function escapeVcf(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/\n/g, "\\n").replace(/\r/g, "");
}

export type VCardInput = {
  displayName?: string | null;
  username?: string | null;
  bio?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  /** Public profile URL */
  url?: string | null;
};

export function buildVCard(data: VCardInput): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];
  const fn = [data.displayName || data.username || "Contact"].filter(Boolean).join(" ");
  lines.push(`FN:${escapeVcf(fn)}`);
  const n = (data.displayName || data.username || "").replace(/\s+/, ";");
  if (n) lines.push(`N:${escapeVcf(n)};;;`);
  if (data.phone) lines.push(`TEL;TYPE=CELL:${escapeVcf(data.phone)}`);
  if (data.email) lines.push(`EMAIL:${escapeVcf(data.email)}`);
  if (data.whatsapp) lines.push(`TEL;TYPE=WhatsApp:${escapeVcf(data.whatsapp)}`);
  if (data.website) lines.push(`URL:${escapeVcf(data.website)}`);
  if (data.url) lines.push(`URL:${escapeVcf(data.url)}`);
  if (data.bio) lines.push(`NOTE:${escapeVcf(data.bio)}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export function downloadVCard(data: VCardInput, filename: string = "contact.vcf"): void {
  const vcf = buildVCard(data);
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename.endsWith(".vcf") ? filename : `${filename}.vcf`;
  a.click();
  URL.revokeObjectURL(a.href);
}
