"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Step =
  | "idle"
  | "starting"
  | "camera"
  | "capturing"
  | "verifying"
  | "saving"
  | "done"
  | "error";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Called when user clicks Done after successful enrollment (e.g. navigate to edit). */
  onEnrolled?: () => void;
  userId: string | null;
  supabase: SupabaseClient<Database> | null;
};

/** Frames we require "face ready" before enabling Capture (security). */
const READY_FRAMES_REQUIRED = 4;
const LIVE_CHECK_INTERVAL_MS = 280;

export default function FaceEnrollModal({
  open,
  onClose,
  onEnrolled,
  userId,
  supabase,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [message, setMessage] = useState("");
  const [modelsReady, setModelsReady] = useState(false);
  const [faceStatus, setFaceStatus] = useState<{ ready: boolean; message: string }>({
    ready: false,
    message: "Position your face in the frame",
  });
  const [readyCount, setReadyCount] = useState(0);
  const readyFramesRef = useRef(0);
  const faceApiRef = useRef<{
    loadModels: () => Promise<boolean>;
    checkFaceForCapture: (video: HTMLVideoElement) => Promise<{ ready: boolean; count: number; message: string }>;
    getDescriptorFromVideoStrict: (video: HTMLVideoElement) => Promise<number[]>;
  } | null>(null);

  useEffect(() => {
    if (!open || step !== "camera") return;
    let cancelled = false;
    (async () => {
      try {
        const { loadModels, checkFaceForCapture, getDescriptorFromVideoStrict } = await import(
          "@/lib/faceRecognition"
        );
        if (cancelled) return;
        faceApiRef.current = { loadModels, checkFaceForCapture, getDescriptorFromVideoStrict };
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

  // Live face detection: only enable Capture when one face is clearly detected for several frames.
  useEffect(() => {
    if (!open || step !== "camera" || !modelsReady || !faceApiRef.current) return;
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      const api = faceApiRef.current;
      if (!api) return;
      try {
        const result = await api.checkFaceForCapture(video);
        if (cancelled) return;
        setFaceStatus({ ready: result.ready, message: result.message });
        if (result.ready) {
          const next = Math.min(readyFramesRef.current + 1, READY_FRAMES_REQUIRED);
          readyFramesRef.current = next;
          setReadyCount(next);
        } else {
          readyFramesRef.current = 0;
          setReadyCount(0);
        }
      } catch {
        if (!cancelled) {
          readyFramesRef.current = 0;
          setReadyCount(0);
        }
      }
    };
    const id = setInterval(tick, LIVE_CHECK_INTERVAL_MS);
    tick();
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [open, step, modelsReady]);

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
    readyFramesRef.current = 0;
    setReadyCount(0);
    setFaceStatus({ ready: false, message: "Position your face in the frame" });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      setStep("camera");
      setMessage("Position your face clearly in the frame. Capture will enable when detected.");
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setStep("error");
      setMessage(`Camera error: ${err}`);
    }
  }, [open]);

  // Attach stream to video once the video element is in the DOM (step === "camera").
  // We can't attach in handleStartCamera because the <video> is only rendered when step is "camera".
  useEffect(() => {
    if (!open || step !== "camera") return;
    const stream = streamRef.current;
    const video = videoRef.current;
    if (!stream || !video) return;
    video.srcObject = stream;
    video.play().catch(() => {});
  }, [open, step]);

  const handleCapture = useCallback(async () => {
    const video = videoRef.current;
    const api = faceApiRef.current;
    if (!video || step !== "camera" || !modelsReady || !api || !supabase || !userId)
      return;
    setStep("verifying");
    setMessage("Verifying capture…");
    try {
      const descriptor = await api.getDescriptorFromVideoStrict(video);
      setStep("capturing");
      setMessage("Capture verified ✓");
      await new Promise((r) => setTimeout(r, 600));
      setStep("saving");
      setMessage("Saving securely…");
      const { updateFaceDescriptor } = await import("@/lib/supabase/profile");
      const { error } = await updateFaceDescriptor(supabase, userId, descriptor);
      if (error) throw error;
      stopCamera();
      setStep("done");
      setMessage("Face enrolled and verified");
    } catch (e) {
      setStep("camera");
      setMessage(
        e instanceof Error ? e.message : "Capture failed. Ensure one clear face in good light, then try again."
      );
      setFaceStatus({ ready: false, message: "Try again — face must be clear and alone in frame" });
      readyFramesRef.current = 0;
      setReadyCount(0);
    }
  }, [step, modelsReady, userId, supabase, stopCamera]);

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
      setFaceStatus({ ready: false, message: "Position your face in the frame" });
      setReadyCount(0);
      readyFramesRef.current = 0;
      faceApiRef.current = null;
    }
  }, [open, stopCamera]);

  if (!open) return null;

  const notLoggedIn = !userId || !supabase;

  return (
    <div
      className="faceModalOverlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="face-enroll-title"
    >
      <div className="faceModalPanel">
        <button
          type="button"
          onClick={handleClose}
          className="faceModalClose"
          aria-label="Close"
        >
          ✕
        </button>
        <h2 id="face-enroll-title" className="faceModalTitle">
          Enroll your face
        </h2>
        <p className="faceModalSubtitle">
          We store only a face signature (no photo). Used to verify it’s you when you tap your QR.
        </p>

        {notLoggedIn && (
          <p className="faceModalError">Please sign in to enroll your face.</p>
        )}

        {!notLoggedIn && step === "idle" && (
          <>
            <p className="faceModalBody">
              Click below to start your camera. Position your face in the frame, then capture.
            </p>
            <button
              type="button"
              onClick={handleStartCamera}
              className="faceModalBtnPrimary"
            >
              Start camera
            </button>
          </>
        )}

        {!notLoggedIn && step === "starting" && (
          <p className="faceModalMessage">{message}</p>
        )}

        {!notLoggedIn && (step === "camera" || step === "verifying" || step === "capturing" || step === "saving") && (
          <>
            <div className="faceModalVideoWrap">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
              />
              {step === "camera" && faceStatus.message && (
                <p className="faceModalVideoStatus" aria-live="polite">
                  {faceStatus.ready ? "✓ " : ""}{faceStatus.message}
                </p>
              )}
            </div>
            <p className="faceModalMessage">{message}</p>
            {step === "camera" && modelsReady && (
              <button
                type="button"
                onClick={handleCapture}
                disabled={readyCount < READY_FRAMES_REQUIRED}
                className="faceModalBtnPrimary"
                title={readyCount < READY_FRAMES_REQUIRED ? "Face must be clearly detected first" : "Capture verified face"}
              >
                {readyCount < READY_FRAMES_REQUIRED ? "Face not detected yet…" : "Capture my face"}
              </button>
            )}
          </>
        )}

        {!notLoggedIn && step === "done" && (
          <>
            <p className="faceModalSuccess">{message} ✓</p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEnrolled?.();
              }}
              className="faceModalBtnPrimary"
            >
              Done
            </button>
          </>
        )}

        {!notLoggedIn && step === "error" && (
          <>
            <p className="faceModalError">{message}</p>
            <div className="faceModalActions">
              <button
                type="button"
                onClick={() => {
                  setStep("idle");
                  setMessage("");
                }}
                className="faceModalBtnSecondary"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="faceModalBtnSecondary"
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
