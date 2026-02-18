// app/layout.tsx
import "./globals.css";
import { getBaseUrl } from "@/lib/getBaseUrl";

const siteDescription =
  "Create a personal QR profile. Share socials and contact details in one scan.";

export const metadata = {
  metadataBase: new URL(getBaseUrl()),
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
