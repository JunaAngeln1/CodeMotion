import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGesture } from "./useGesture";

const { createModel } = vi.hoisted(() => ({ createModel: vi.fn() }));
vi.mock("./loadHandLandmarker", () => ({ createHandLandmarker: createModel }));

let stop: ReturnType<typeof vi.fn>;
let close: ReturnType<typeof vi.fn>;
let getUserMedia: ReturnType<typeof vi.fn>;
let stream: MediaStream;
let model: Awaited<ReturnType<typeof createModel>>;
let frames: Map<number, FrameRequestCallback>;
let frameId: number;
const originalDevices = Object.getOwnPropertyDescriptor(navigator, "mediaDevices");

beforeEach(() => {
  stop = vi.fn(); close = vi.fn(); frames = new Map(); frameId = 0;
  const track = { stop, onended: null };
  stream = { getTracks: () => [track], getVideoTracks: () => [track] } as unknown as MediaStream;
  getUserMedia = vi.fn().mockResolvedValue(stream);
  Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia } });
  vi.stubGlobal("isSecureContext", true);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  model = { close, detectForVideo: vi.fn().mockReturnValue({ landmarks: [], handedness: [] }) };
  createModel.mockReset().mockResolvedValue(model);
});
afterEach(() => {
  cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals();
  if (originalDevices) Object.defineProperty(navigator, "mediaDevices", originalDevices);
  else Reflect.deleteProperty(navigator, "mediaDevices");
});
const renderCamera = () => {
  const result = renderHook(() => useGesture({ enabled: true, onFrame: vi.fn() }));
  result.result.current.videoRef.current = document.createElement("video");
  return result;
};

describe("camera lifecycle", () => {
  it("starts only after manual activation and releases all resources when stopped", async () => {
    const { result } = renderCamera();
    expect(getUserMedia).not.toHaveBeenCalled();
    await act(() => result.current.startCamera());
    expect(result.current.stage).toBe("ready");
    expect(createModel).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(1);
    act(() => result.current.stopCamera());
    expect(stop).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
    expect(result.current.frame.isTracking).toBe(false);
  });

  it("explains denied permissions without downloading a model", async () => {
    getUserMedia.mockRejectedValue(new DOMException("Denied", "NotAllowedError"));
    const { result } = renderCamera();
    await act(() => result.current.startCamera());
    expect(result.current.error).toContain("Permiso de cámara denegado");
    expect(createModel).not.toHaveBeenCalled();
    expect(result.current.stage).toBe("off");
  });

  it("rejects insecure origins before asking for camera permissions", async () => {
    vi.stubGlobal("isSecureContext", false);
    const { result } = renderCamera();
    await act(() => result.current.startCamera());
    expect(result.current.error).toContain("HTTPS o localhost");
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it("stops a stream that arrives after the component was closed", async () => {
    let resolve!: (stream: MediaStream) => void;
    getUserMedia.mockReturnValue(new Promise<MediaStream>((done) => { resolve = done; }));
    const { result, unmount } = renderCamera();
    let pending!: Promise<void>;
    act(() => { pending = result.current.startCamera(); });
    unmount();
    await act(async () => { resolve(stream); await pending; });
    expect(stop).toHaveBeenCalledTimes(1);
    expect(createModel).not.toHaveBeenCalled();
  });

  it("disposes a model that finishes loading after cancellation", async () => {
    let resolve!: (value: typeof model) => void;
    createModel.mockImplementation(() => new Promise((done) => { resolve = done; }));
    const { result } = renderCamera();
    let pending!: Promise<void>;
    await act(async () => { pending = result.current.startCamera(); await Promise.resolve(); });
    act(() => result.current.stopCamera());
    await act(async () => { resolve(model); await pending; });
    expect(stop).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(result.current.stage).toBe("off");
    expect(frames.size).toBe(0);
  });

  it("cleans up when model loading fails and when the page is hidden", async () => {
    createModel.mockRejectedValueOnce(new Error("Sin conexión al modelo"));
    const { result } = renderCamera();
    await act(() => result.current.startCamera());
    expect(result.current.error).toBe("Sin conexión al modelo");
    expect(stop).toHaveBeenCalledTimes(1);
    await act(() => result.current.startCamera());
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(result.current.stage).toBe("off");
    expect(close).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
  });

  it("never processes the same video frame twice and handles inference failure", async () => {
    const { result } = renderCamera();
    await act(() => result.current.startCamera());
    const video = result.current.videoRef.current!;
    Object.defineProperty(video, "readyState", { value: 2 });
    const tick = (time: number) => {
      const [id, callback] = frames.entries().next().value!;
      frames.delete(id); callback(time);
    };
    act(() => { tick(0); tick(100); });
    expect(model.detectForVideo).toHaveBeenCalledTimes(1);
    model.detectForVideo.mockImplementation(() => { throw new Error("Error de detección"); });
    video.currentTime = 1;
    act(() => tick(200));
    expect(result.current.error).toContain("Se detuvo la detección");
    expect(result.current.stage).toBe("off");
    expect(stop).toHaveBeenCalledTimes(1);
  });
});
