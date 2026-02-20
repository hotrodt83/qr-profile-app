/**
 * Face recognition for owner verification (privacy unlock).
 * Uses face-api.js: load models from /models, compute 128-d descriptor, compare with euclidean distance.
 * No face images are stored—only the descriptor (embedding).
 * Security: strict single-face detection, confidence threshold, and descriptor validation.
 */

export type FaceDescriptor = number[];

const MODEL_BASE = "/models";
const EUCLIDEAN_THRESHOLD = 0.6; // Same person if distance < this (tune as needed)
/** Minimum detection score (0–1) to accept a face as "clear" for live feedback. */
const LIVE_SCORE_MIN = 0.55;
/** Minimum score for final capture (stricter than live). */
const CAPTURE_SCORE_MIN = 0.65;
/** Descriptor must have 128 dimensions. */
const DESCRIPTOR_LENGTH = 128;
/** Reject descriptor if L2 norm is too small (likely invalid). */
const DESCRIPTOR_MIN_NORM = 0.01;

let modelsLoaded = false;

async function loadFaceApi(): Promise<typeof import("face-api.js")> {
  const faceapi = await import("face-api.js");
  return faceapi;
}

export async function loadModels(): Promise<boolean> {
  if (modelsLoaded) return true;
  try {
    const faceapi = await loadFaceApi();
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_BASE),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_BASE),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_BASE),
    ]);
    modelsLoaded = true;
    return true;
  } catch (e) {
    console.error("[faceRecognition] Failed to load models:", e);
    return false;
  }
}

/** Result of a quick face check for live UI (no descriptor computed). */
export type FaceCheckResult = {
  ready: boolean;
  count: number;
  message: string;
};

/**
 * Lightweight check for live feedback: exactly one face, clearly detected.
 * Does not compute the full descriptor (faster for polling).
 */
export async function checkFaceForCapture(
  video: HTMLVideoElement
): Promise<FaceCheckResult> {
  const ok = await loadModels();
  if (!ok)
    return { ready: false, count: 0, message: "Models loading…" };
  const faceapi = await loadFaceApi();
  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 224,
    scoreThreshold: 0.4,
  });
  const detections = await faceapi
    .detectAllFaces(video, options)
    .withFaceLandmarks();
  if (detections.length === 0)
    return { ready: false, count: 0, message: "Position your face in the frame" };
  if (detections.length > 1)
    return { ready: false, count: detections.length, message: "Only one person in frame (security)" };
  const score = detections[0].detection.score;
  if (score < LIVE_SCORE_MIN)
    return {
      ready: false,
      count: 1,
      message: "Face not clear enough — look at camera, improve lighting",
    };
  return {
    ready: true,
    count: 1,
    message: "Face detected clearly — hold still, then capture",
  };
}

function descriptorNorm(d: number[]): number {
  let sum = 0;
  for (let i = 0; i < d.length; i++) sum += d[i] * d[i];
  return Math.sqrt(sum);
}

/**
 * Strict capture: exactly one face, high confidence, valid 128-d descriptor.
 * For security: rejects multiple faces, poor quality, or invalid descriptor.
 */
export async function getDescriptorFromVideoStrict(
  video: HTMLVideoElement
): Promise<FaceDescriptor> {
  const ok = await loadModels();
  if (!ok) throw new Error("Face models not loaded.");
  const faceapi = await loadFaceApi();
  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 224,
    scoreThreshold: 0.4,
  });
  const all = await faceapi
    .detectAllFaces(video, options)
    .withFaceLandmarks()
    .withFaceDescriptors();
  if (all.length === 0)
    throw new Error("No face detected. Look at the camera in good light.");
  if (all.length > 1)
    throw new Error("Only one person may be in frame for security.");
  const face = all[0];
  if (face.detection.score < CAPTURE_SCORE_MIN)
    throw new Error("Capture not clear enough. Face the camera directly in good light.");
  const descriptor = Array.from(face.descriptor);
  if (descriptor.length !== DESCRIPTOR_LENGTH)
    throw new Error("Invalid capture; try again.");
  const norm = descriptorNorm(descriptor);
  if (norm < DESCRIPTOR_MIN_NORM)
    throw new Error("Invalid capture; try again.");
  return descriptor;
}

/**
 * Get 128-d face descriptor from a video element (one frame).
 * Returns null if no face detected or models not loaded.
 * Prefer getDescriptorFromVideoStrict for enrollment (security).
 */
export async function getDescriptorFromVideo(
  video: HTMLVideoElement
): Promise<FaceDescriptor | null> {
  try {
    return await getDescriptorFromVideoStrict(video);
  } catch {
    return null;
  }
}

/** Euclidean distance between two descriptors. */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/** Returns true if the two descriptors are likely the same person. */
export function isMatch(stored: FaceDescriptor, current: FaceDescriptor): boolean {
  return euclideanDistance(stored, current) < EUCLIDEAN_THRESHOLD;
}
