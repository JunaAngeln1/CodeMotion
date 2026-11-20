import type { HandPoint } from "./gestureRecognition";
import type { GestureType } from "@/types";

export const handFixture = (type: GestureType): HandPoint[] => {
  const points = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.8, z: 0 }));
  points[0] = { x: 0.5, y: 0.9, z: 0 };
  const fingers = [
    [5, 0.38, 0.65, 0.27], [9, 0.48, 0.62, 0.20], [13, 0.58, 0.65, 0.27], [17, 0.68, 0.70, 0.38],
  ];
  for (const [base, x, y, tip] of fingers) {
    points[base] = { x, y, z: 0 };
    points[base + 1] = { x, y: y - 0.1, z: 0 };
    points[base + 2] = { x, y: y - 0.23, z: 0 };
    points[base + 3] = { x, y: tip, z: 0 };
    if (type === "fist" || type === "thumbsUp") {
      points[base + 2] = { x: x + 0.025, y: y - 0.07, z: 0 };
      points[base + 3] = { x: x + 0.025, y: y + 0.035, z: 0 };
    }
  }
  points[1] = { x: 0.35, y: 0.78, z: 0 };
  points[2] = { x: 0.28, y: 0.7, z: 0 };
  points[3] = { x: 0.2, y: 0.62, z: 0 };
  points[4] = { x: 0.12, y: 0.54, z: 0 };
  if (type === "fist") {
    points[2] = { x: 0.32, y: 0.72, z: 0 };
    points[3] = { x: 0.40, y: 0.70, z: 0 };
    points[4] = { x: 0.44, y: 0.67, z: 0 };
  } else if (type === "thumbsUp") {
    points[2] = { x: 0.24, y: 0.7, z: 0 };
    points[3] = { x: 0.24, y: 0.51, z: 0 };
    points[4] = { x: 0.24, y: 0.3, z: 0 };
  } else if (type === "pinch") {
    points[3] = { x: 0.28, y: 0.35, z: 0 };
    points[4] = { x: 0.38, y: 0.30, z: 0 };
  }
  return points;
};
