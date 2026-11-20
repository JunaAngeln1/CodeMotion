import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHandLandmarker } from "./loadHandLandmarker";

const { create } = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@mediapipe/tasks-vision", () => ({ HandLandmarker: { createFromOptions: create } }));

beforeEach(() => {
  create.mockReset().mockResolvedValue({ close: vi.fn() });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), { status: 200 })));
});
afterEach(() => vi.unstubAllGlobals());

describe("MediaPipe model loader", () => {
  it("uses the published model URL and the WASM bundled with the installed SDK", async () => {
    await createHandLandmarker(new AbortController().signal);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"), expect.anything());
    expect(create.mock.calls[0][0]).toEqual({ wasmLoaderPath: expect.stringContaining("vision_wasm_internal.js"), wasmBinaryPath: expect.stringContaining("vision_wasm_internal.wasm") });
    expect(create.mock.calls[0][1].baseOptions.delegate).toBe("GPU");
  });
  it("falls back to CPU if GPU initialization fails", async () => {
    create.mockRejectedValueOnce(new Error("GPU unavailable"));
    await createHandLandmarker(new AbortController().signal);
    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[1][1].baseOptions.delegate).toBe("CPU");
  });
  it("reports download failures and honors cancellation", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 404 }));
    await expect(createHandLandmarker(new AbortController().signal)).rejects.toThrow("No se pudo descargar");
    expect(create).not.toHaveBeenCalled();
    const request = new AbortController(); request.abort();
    await expect(createHandLandmarker(request.signal)).rejects.toMatchObject({ name: "AbortError" });
    expect(create).not.toHaveBeenCalled();
  });
});
