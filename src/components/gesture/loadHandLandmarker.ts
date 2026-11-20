import wasmLoaderPath from "@mediapipe/tasks-vision/vision_wasm_internal.js?url";
import wasmBinaryPath from "@mediapipe/tasks-vision/vision_wasm_internal.wasm?url";

const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export const createHandLandmarker = async (signal: AbortSignal) => {
  const [{ HandLandmarker }, response] = await Promise.all([
    import("@mediapipe/tasks-vision"), fetch(MODEL_URL, { signal }),
  ]);
  if (!response.ok) throw new Error("No se pudo descargar el modelo de manos. Comprueba tu conexión e inténtalo de nuevo.");
  const modelAssetBuffer = new Uint8Array(await response.arrayBuffer());
  signal.throwIfAborted();
  const fileset = { wasmLoaderPath, wasmBinaryPath };
  const options = {
    runningMode: "VIDEO" as const, numHands: 1,
    minHandDetectionConfidence: 0.65, minHandPresenceConfidence: 0.65, minTrackingConfidence: 0.65,
  };
  try {
    return await HandLandmarker.createFromOptions(fileset, { ...options, baseOptions: { modelAssetBuffer, delegate: "GPU" } });
  } catch {
    signal.throwIfAborted();
    // Some phones/browsers do not expose a compatible WebGL context.
    return HandLandmarker.createFromOptions(fileset, { ...options, baseOptions: { modelAssetBuffer, delegate: "CPU" } });
  }
};
