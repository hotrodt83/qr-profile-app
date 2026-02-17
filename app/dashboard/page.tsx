// app/page.tsx
import QRProfile from "@/app/dashboard/QRProfile";

export default function HomePage() {
  // This is your QR destination (change later to your real public URL)
  const qrValue = "https://yourdomain.com/u/yourusername";

  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="relative w-[320px] h-[320px]">
        <QRProfile value={qrValue} />
      </div>
    </main>
  );
}
