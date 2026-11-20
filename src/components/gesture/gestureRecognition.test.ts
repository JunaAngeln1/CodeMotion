import { describe, expect, it } from "vitest";
import { classifyHand, GestureStabilizer, mapHandToCursor } from "./gestureRecognition";
import { handFixture } from "./gestureFixtures.test-utils";

describe("real landmark gesture classification", () => {
  for (const gesture of ["open", "pinch", "thumbsUp", "fist"] as const) {
    it(`classifies ${gesture} for both hands and different hand sizes`, () => {
      const hand = handFixture(gesture);
      expect(classifyHand(hand)).toBe(gesture);
      expect(classifyHand(hand.map((p) => ({ ...p, x: 1 - p.x })))).toBe(gesture);
      expect(classifyHand(hand.map((p) => ({ ...p, x: 0.5 + (p.x - 0.5) * 0.6, y: 0.5 + (p.y - 0.5) * 0.6 })))).toBe(gesture);
    });
  }
  it("ignores missing, invalid and degenerate landmarks", () => {
    expect(classifyHand([])).toBe("none");
    expect(classifyHand(Array.from({ length: 21 }, () => ({ x: 0, y: 0 })))).toBe("none");
    expect(classifyHand(handFixture("open").map((point) => ({ ...point, x: NaN })))).toBe("none");
  });
  it("mirrors the cursor, clamps edges and supports centering", () => {
    expect(mapHandToCursor({ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.5 }, 1)).toEqual({ x: 0.5, y: 0.5 });
    expect(mapHandToCursor({ x: 0.8, y: 0.5 }, { x: 0.5, y: 0.5 }, 1).x).toBeLessThan(0.5);
    expect(mapHandToCursor({ x: 0.9, y: 0.1 }, { x: 0.5, y: 0.5 }, 1.6)).toEqual({ x: 0, y: 0 });
    expect(mapHandToCursor({ x: 0.3, y: 0.6 }, { x: 0.3, y: 0.6 }, 1)).toEqual({ x: 0.5, y: 0.5 });
  });
});

describe("gesture safety and temporal stability", () => {
  it("requires a hold and does not repeat a held command", () => {
    const filter = new GestureStabilizer();
    expect(filter.update("thumbsUp", 0, true).action).toBeUndefined();
    expect(filter.update("thumbsUp", 599, true).action).toBeUndefined();
    expect(filter.update("thumbsUp", 600, true).action).toBe("execute");
    expect(filter.update("thumbsUp", 6000, true).action).toBeUndefined();
  });
  it("does not re-arm a command on a brief noisy detection or tracking loss", () => {
    const filter = new GestureStabilizer();
    filter.update("fist", 0, true);
    expect(filter.update("fist", 900, true).action).toBe("reset");
    filter.update("none", 1000, true);
    filter.update("fist", 1050, true);
    expect(filter.update("fist", 2000, true).action).toBeUndefined();
    filter.update("none", 2100, false);
    filter.update("fist", 2200, true);
    expect(filter.update("fist", 3200, true).action).toBeUndefined();
    filter.update("open", 3300, true);
    filter.update("open", 3700, true);
    filter.update("fist", 3800, true);
    expect(filter.update("fist", 4700, true).action).toBe("reset");
  });
  it("requires consistent pinch/open poses and clears tracking immediately", () => {
    const filter = new GestureStabilizer();
    filter.update("pinch", 0, true);
    expect(filter.update("pinch", 100, true).type).toBe("none");
    expect(filter.update("pinch", 180, true).type).toBe("pinch");
    expect(filter.update("none", 200, false).type).toBe("none");
  });
});
