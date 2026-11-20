import { useCallback, useEffect, useRef, useState } from "react";
import type { HandLandmarker } from "@mediapipe/tasks-vision";
import { classifyHand, EMPTY_GESTURE_FRAME, GestureStabilizer, mapHandToCursor, type GestureFrame, type HandPoint } from "./gestureRecognition";

interface UseGestureProps {
  onFrame?: (frame: GestureFrame) => void;
  enabled?: boolean;
  sensitivity?: number;
}
const cameraError = (error: unknown) => {
  const name = error && typeof error === "object" && "name" in error ? String(error.name) : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "Permiso de cámara denegado. Permítelo en el navegador o continúa con el mouse.";
  if (name === "NotFoundError") return "No se encontró una cámara. Conecta una o utiliza el mouse.";
  if (name === "NotReadableError") return "La cámara está ocupada. Cierra otras aplicaciones que la estén usando.";
  return error && typeof error === "object" && "message" in error ? String(error.message) : "No se pudo iniciar la cámara. Puedes seguir usando el mouse.";
};

export const useGesture = ({ onFrame, enabled = false, sensitivity = 1 }: UseGestureProps = {}) => {
  const [stage, setStage] = useState<"off" | "permission" | "model" | "ready">("off");
  const [error, setError] = useState<string | null>(null);
  const [frame, setFrame] = useState<GestureFrame>(EMPTY_GESTURE_FRAME);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const modelRef = useRef<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const sessionRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const callbackRef = useRef({ onFrame, sensitivity });
  const filterRef = useRef(new GestureStabilizer());
  const centerRef = useRef<HandPoint>({ x: 0.5, y: 0.5 });
  const handRef = useRef<HandPoint | null>(null);

  useEffect(() => { callbackRef.current = { onFrame, sensitivity }; }, [onFrame, sensitivity]);

  const release = useCallback(() => {
    sessionRef.current += 1;
    requestRef.current?.abort();
    requestRef.current = null;
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    streamRef.current?.getTracks().forEach((track) => { track.onended = null; track.stop(); });
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    modelRef.current?.close();
    modelRef.current = null;
    filterRef.current.reset();
    handRef.current = null;
  }, []);

  const stopCamera = useCallback(() => {
    release();
    setStage("off");
    setFrame(EMPTY_GESTURE_FRAME);
    callbackRef.current.onFrame?.(EMPTY_GESTURE_FRAME);
  }, [release]);

  const startCamera = useCallback(async () => {
    if (!enabled || requestRef.current || streamRef.current) return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError("La cámara necesita HTTPS o localhost. En el teléfono no funciona desde una dirección HTTP de la red local.");
      return;
    }
    const session = ++sessionRef.current;
    const request = new AbortController();
    requestRef.current = request;
    setError(null);
    setStage("permission");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24, max: 30 } } });
      if (session !== sessionRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      stream.getVideoTracks().forEach((track) => { track.onended = () => { stopCamera(); setError("La cámara se desconectó o se revocó el permiso."); }; });
      const video = videoRef.current;
      if (!video) throw new Error("No se encontró la vista previa de cámara.");
      video.srcObject = stream;
      await video.play();
      if (session !== sessionRef.current) return;
      setStage("model");
      const { createHandLandmarker } = await import("./loadHandLandmarker");
      if (session !== sessionRef.current) return;
      const model = await createHandLandmarker(request.signal);
      if (session !== sessionRef.current) { model.close(); return; }
      modelRef.current = model;
      requestRef.current = null;
      centerRef.current = { x: 0.5, y: 0.5 };
      setStage("ready");
      let lastVideoTime = -1;
      let lastInference = -Infinity;
      let smoothed = { x: 0.5, y: 0.5 };
      let wasTracking = false;
      const process = (now: number) => {
        if (session !== sessionRef.current) return;
        if (video.readyState >= 2 && video.currentTime !== lastVideoTime && now - lastInference >= 50) {
          lastVideoTime = video.currentTime;
          lastInference = now;
          try {
            const result = model.detectForVideo(video, now);
            const points = result.landmarks[0];
            const score = result.handedness[0]?.[0]?.score ?? 0;
            const tracking = Boolean(points?.length === 21 && score >= 0.6);
            const candidate = tracking ? classifyHand(points) : "none";
            const stable = filterRef.current.update(candidate, now, tracking);
            if (tracking) {
              handRef.current = points[9];
              const mapped = mapHandToCursor(points[9], centerRef.current, callbackRef.current.sensitivity);
              smoothed = wasTracking ? { x: smoothed.x + (mapped.x - smoothed.x) * 0.35, y: smoothed.y + (mapped.y - smoothed.y) * 0.35 } : mapped;
            } else {
              handRef.current = null;
            }
            wasTracking = tracking;
            const next: GestureFrame = { ...stable, candidate, ...smoothed, isTracking: tracking, handedness: tracking ? result.handedness[0][0].categoryName : "" };
            setFrame(next);
            callbackRef.current.onFrame?.(next);
          } catch (cause) {
            stopCamera();
            setError(`Se detuvo la detección de manos. ${cameraError(cause)}`);
            return;
          }
        }
        animationRef.current = requestAnimationFrame(process);
      };
      animationRef.current = requestAnimationFrame(process);
    } catch (cause) {
      if (session !== sessionRef.current) return;
      stopCamera();
      setError(cameraError(cause));
    }
  }, [enabled, stopCamera]);

  const calibrate = useCallback(() => {
    if (handRef.current) centerRef.current = { ...handRef.current };
  }, []);

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) stopCamera(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { document.removeEventListener("visibilitychange", onVisibility); release(); };
  }, [release, stopCamera]);
  return {
    stage, frame, error, videoRef, startCamera, stopCamera, calibrate,
    isLoading: stage === "permission" || stage === "model",
    isActive: stage === "model" || stage === "ready",
  };
};
