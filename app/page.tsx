import QRProfile from "@/app/components/QRProfile";
import FloatingSocialIcons from "@/app/components/FloatingSocialIcons";

export default function HomePage() {
  return (
    <main className="homeStage">
      <div className="homeCenter">
        {/* Icons orbit behind the QR (same layer so they’re visible) */}
        <FloatingSocialIcons />
        <QRProfile value="http://localhost:3001/u/test" />
      </div>
    </main>
  );
}
