"use client";

import { useEffect, useRef, useState } from "react";
import { loadModels, getDescriptorFromVideo } from "@/lib/faceRecognition";
import { updateFaceDescriptor } from "@/lib/supabase/profile";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Props = {
  supabase: SupabaseClient<Database>;
  userId: string;
  onDone: () => void;
  onSkip?: () => void;
};

export default function FaceEnroll({ supabase, userId, onDone, onSkip }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [step, setStep] = useState<"camera" | "capturing" | "saving" | "done" | "error">("camera");
  const [message, setMessage] = useState("Position your face in the frame, then click Capture.");
  const [modelsReady, setModelsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await loadModels();
      if (cancelled) return;
      setModelsReady(ok);
      if (!ok) {
        setStep("error");
        setMessage("Face models could not be loaded. Try again later.");
        return;
      }
      const video = videoRef.current;
      if (!video) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();
      } catch (e) {
        if (!cancelled) {
          setStep("error");
          setMessage("Camera access denied.");
        }
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video || step !== "camera" || !modelsReady) return;
    setStep("capturing");
    setMessage("Detecting face…");
    try {
      const descriptor = await getDescriptorFromVideo(video);
      if (!descriptor) {
        setMessage("No face detected. Look at the camera and try again.");
        setStep("camera");
        return;
      }
      setStep("saving");
      setMessage("Saving…");
      const { error } = await updateFaceDescriptor(supabase, userId, descriptor);
      if (error) throw error;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setStep("done");
      setMessage("Face enrolled. You can use face verification when you tap your QR.");
      setTimeout(onDone, 1500);
    } catch (e) {
      setStep("error");
      setMessage("Enrollment failed. Try again.");
    }
  };

  return (
    <div className="authEmailCard" style={{ maxWidth: 400 }}>
      <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>Enroll your face</h2>
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginBottom: 16 }}>
        We store only a face signature (no photo). Used to verify it’s you when you tap your QR.
      </p>
      {(step === "camera" || step === "capturing" || step === "saving") && (
        <>
          <div className="faceVerifyFrame">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{ width: "100%", borderRadius: 12, background: "#111" }}
            />
          </div>
          <p style={{ marginTop: 12, fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>{message}</p>
          {step === "camera" && modelsReady && (
            <button type="button" onClick={handleCapture} className="authBtnPrimary" style={{ marginTop: 16 }}>
              Capture my face
            </button>
          )}
        </>
      )}
      {step === "done" && <p style={{ color: "rgba(100,255,180,0.9)" }}>{message}</p>}
      {step === "error" && (
        <>
          <p style={{ color: "rgba(255,200,100,0.95)" }}>{message}</p>
          <button type="button" onClick={() => setStep("camera")} className="authBtnSecondary" style={{ marginTop: 12 }}>
            Try again
          </button>
        </>
      )}
      {onSkip && (step === "camera" || step === "error") && (
        <button type="button" onClick={onSkip} className="authBack" style={{ marginTop: 16 }}>
          Skip for now
        </button>
      )}
    </div>
  );
}
