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
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
  },
  openGraph: {
    title: "SmartQR",
    description: siteDescription,
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "SmartQR - Share your profile with one scan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartQR",
    description: siteDescription,
    images: ["/logo.png"],
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
