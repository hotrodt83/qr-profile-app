// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "SmartQR",
  description: "Your link in one QR — personal profile page, socials, and contact.",
  openGraph: {
    title: "SmartQR",
    description: "Your link in one QR — personal profile page, socials, and contact.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
