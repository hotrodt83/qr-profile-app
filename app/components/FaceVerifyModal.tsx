"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Step =
  | "idle"
  | "starting"
  | "camera"
  | "verifying"
  | "success"
  | "error";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Called only after successful verification; parent should navigate (e.g. router.push("/edit")). */
  onSuccess: () => void;
  storedDescriptor: number[];
};

export default function FaceVerifyModal({
  open,
  onClose,
  onSuccess,
  storedDescriptor,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [message, setMessage] = useState("");
  const [modelsReady, setModelsReady] = useState(false);
  const faceApiRef = useRef<{
    loadModels: () => Promise<boolean>;
    getDescriptorFromVideo: (video: HTMLVideoElement) => Promise<number[] | null>;
    isMatch: (stored: number[], current: number[]) => boolean;
  } | null>(null);

  useEffect(() => {
    if (!open || step !== "camera") return;
    let cancelled = false;
    (async () => {
      try {
        const { loadModels, getDescriptorFromVideo, isMatch } = await import(
          "@/lib/faceRecognition"
        );
        if (cancelled) return;
        faceApiRef.current = { loadModels, getDescriptorFromVideo, isMatch };
        const ok = await loadModels();
        if (cancelled) return;
        setModelsReady(ok);
        if (!ok) {
          setStep("error");
          setMessage("Face models could not be loaded. Try again later.");
        }
      } catch (e) {
        if (!cancelled) {
          setStep("error");
          setMessage(
            e instanceof Error ? e.message : "Failed to load face recognition."
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, step]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) video.srcObject = null;
  }, []);

  const handleStartCamera = useCallback(async () => {
    if (!open) return;
    setStep("starting");
    setMessage("Requesting camera…");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      setStep("camera");
      setMessage("Position your face in the frame, then click Verify.");
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setStep("error");
      setMessage(`Camera error: ${err}`);
    }
  }, [open]);

  const handleVerify = useCallback(async () => {
    const video = videoRef.current;
    const api = faceApiRef.current;
    if (
      !video ||
      step !== "camera" ||
      !modelsReady ||
      !api ||
      storedDescriptor.length === 0
    )
      return;
    setStep("verifying");
    setMessage("Verifying…");
    try {
      const current = await api.getDescriptorFromVideo(video);
      if (!current) {
        setMessage("No face detected. Look at the camera and try again.");
        setStep("camera");
        return;
      }
      const match = api.isMatch(storedDescriptor, current);
      if (!match) {
        setStep("error");
        setMessage("Face did not match. Please try again or use another device.");
        return;
      }
      stopCamera();
      setStep("success");
      setMessage("Verified ✓");
      onSuccess();
    } catch (e) {
      setStep("error");
      setMessage(
        e instanceof Error ? e.message : "Verification failed. Try again."
      );
    }
  }, [step, modelsReady, storedDescriptor, onSuccess, stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [onClose, stopCamera]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setStep("idle");
      setMessage("");
      setModelsReady(false);
      faceApiRef.current = null;
    }
  }, [open, stopCamera]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="face-verify-title"
    >
      <div className="relative w-full max-w-md mx-4 bg-[#0f0f0f] rounded-2xl border border-white/10 shadow-2xl p-6">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>
        <h2
          id="face-verify-title"
          className="text-lg font-semibold text-white mb-2"
        >
          Verify your face
        </h2>
        <p className="text-sm text-white/70 mb-4">
          We’ll compare your face to the one on file. No photo is stored.
        </p>

        {step === "idle" && (
          <>
            <p className="text-sm text-white/80 mb-4">
              Click below to start your camera, then click Verify.
            </p>
            <button
              type="button"
              onClick={handleStartCamera}
              className="w-full py-3 px-4 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              Start camera
            </button>
          </>
        )}

        {step === "starting" && (
          <p className="text-sm text-white/80">{message}</p>
        )}

        {(step === "camera" || step === "verifying") && (
          <>
            <div className="rounded-xl overflow-hidden bg-[#111] aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-3 text-sm text-white/80">{message}</p>
            {step === "camera" && modelsReady && (
              <button
                type="button"
                onClick={handleVerify}
                className="mt-4 w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors"
              >
                Verify
              </button>
            )}
          </>
        )}

        {step === "success" && (
          <p className="text-emerald-400 font-medium">{message}</p>
        )}

        {step === "error" && (
          <>
            <p className="text-amber-300 text-sm mb-4">{message}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep("idle");
                  setMessage("");
                }}
                className="flex-1 py-2 px-4 rounded-xl border border-white/20 text-white/90 hover:bg-white/10 transition-colors"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="py-2 px-4 rounded-xl text-white/70 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
