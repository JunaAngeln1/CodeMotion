import type { GestureType } from "@/types";

export interface HandPoint { x: number; y: number; z?: number }
export interface GestureFrame {
  type: GestureType;
  candidate: GestureType;
  x: number;
  y: number;
  isTracking: boolean;
  handedness: string;
  holdProgress: number;
  action?: "execute" | "reset";
}
export const EMPTY_GESTURE_FRAME: GestureFrame = {
  type: "none", candidate: "none", x: 0.5, y: 0.5, isTracking: false, handedness: "", holdProgress: 0,
};
const distance = (a: HandPoint, b: HandPoint) => Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));
const angle = (a: HandPoint, joint: HandPoint, b: HandPoint) => {
  const dot = (a.x - joint.x) * (b.x - joint.x) + (a.y - joint.y) * (b.y - joint.y) + ((a.z ?? 0) - (joint.z ?? 0)) * ((b.z ?? 0) - (joint.z ?? 0));
  const length = distance(a, joint) * distance(b, joint);
  return length > 0 ? Math.acos(Math.max(-1, Math.min(1, dot / length))) * 180 / Math.PI : 0;
};

// Relative distances and joint angles work for either hand, mirrored or not.
export const classifyHand = (points: HandPoint[]): GestureType => {
  if (points.length !== 21 || points.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y) || (point.z !== undefined && !Number.isFinite(point.z)))) return "none";
  const palm = distance(points[0], points[9]);
  if (palm < 0.025) return "none";
  const fingers = [5, 9, 13, 17].map((base) => {
    const straight = angle(points[base], points[base + 1], points[base + 3]) > 155;
    return straight && distance(points[base + 3], points[0]) > distance(points[base + 1], points[0]) * 1.1;
  });
  const curled = fingers.every((extended) => !extended);
  const thumbStraight = angle(points[2], points[3], points[4]) > 150;
  const thumbUp = thumbStraight && points[4].y < points[2].y - palm * 0.55
    && Math.abs(points[4].x - points[2].x) < (points[2].y - points[4].y) * 0.85
    && distance(points[4], points[5]) > palm * 0.6;
  if (curled && thumbUp) return "thumbsUp";
  const pinchCenter = { x: (points[4].x + points[8].x) / 2, y: (points[4].y + points[8].y) / 2 };
  if (distance(points[4], points[8]) / palm < 0.25 && (fingers.slice(1).some(Boolean) || distance(pinchCenter, points[0]) > palm * 1.2)) return "pinch";
  if (fingers.every(Boolean) && distance(points[4], points[8]) > palm * 0.35) return "open";
  if (curled && distance(points[4], points[5]) < palm * 1.1) return "fist";
  return "none";
};

const HOLD_MS: Record<GestureType, number> = { none: 120, pinch: 180, open: 180, thumbsUp: 600, fist: 900 };

export class GestureStabilizer {
  private candidate: GestureType = "none";
  private stable: GestureType = "none";
  private since = 0;
  private armed = true;
  private neutralSince: number | null = null;

  reset() {
    this.candidate = "none";
    this.stable = "none";
    this.since = 0;
    this.armed = true;
    this.neutralSince = null;
  }

  update(type: GestureType, now: number, tracking: boolean) {
    if (!tracking) {
      this.candidate = "none";
      this.stable = "none";
      this.since = now;
      this.neutralSince = null;
      // Losing a hand must not re-arm a held command.
      return { type: "none" as GestureType, holdProgress: 0, action: undefined };
    }
    if (type !== this.candidate) {
      this.candidate = type;
      this.since = now;
    }
    if (type === "open" || type === "none") {
      this.neutralSince ??= now;
      if (now - this.neutralSince >= 350) this.armed = true;
    } else {
      this.neutralSince = null;
    }
    const holdProgress = Math.min(1, Math.max(0, (now - this.since) / HOLD_MS[type]));
    let action: "execute" | "reset" | undefined;
    if (holdProgress === 1 && type !== this.stable) {
      this.stable = type;
      if (this.armed && (type === "thumbsUp" || type === "fist")) {
        this.armed = false;
        action = type === "thumbsUp" ? "execute" : "reset";
      }
    }
    return { type: this.stable, holdProgress, action };
  }
}

export const mapHandToCursor = (point: HandPoint, center: HandPoint, sensitivity: number) => ({
  x: Math.max(0, Math.min(1, 0.5 - (point.x - center.x) * 1.6 * sensitivity)),
  y: Math.max(0, Math.min(1, 0.5 + (point.y - center.y) * 1.6 * sensitivity)),
});
