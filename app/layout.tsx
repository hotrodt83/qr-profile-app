// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "QR App",
  description: "Personal QR Profile",
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
