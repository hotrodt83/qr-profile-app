// app/layout.tsx
import "./globals.css";
import { getBaseUrl } from "@/lib/getBaseUrl";

const siteDescription =
  "Create a personal SmartQR profile. Share socials and contact details in one scan.";

function getSafeBaseUrl(): string {
  try {
    const url = getBaseUrl();
    if (url && typeof url === "string" && url.startsWith("http")) return url.trim();
  } catch (_) { }
  return "http://localhost:3001";
}

export const metadata = {
  metadataBase: new URL(getSafeBaseUrl()),
  title: "SmartQR",
  description: siteDescription,
  openGraph: {
    title: "SmartQR",
    description: siteDescription,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartQR",
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white" style={{ backgroundColor: "#000", color: "#fff" }}>{children}</body>
    </html>
  );
}
