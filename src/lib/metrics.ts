import type { RecordedInputEvent } from "@/lib/types";

export interface Point {
  x: number;
  y: number;
}

export const TRACE_VIEWBOX = { width: 800, height: 400 } as const;

export const TARGET_POSITIONS = [
  { x: 18, y: 28 },
  { x: 49, y: 20 },
  { x: 78, y: 32 },
  { x: 67, y: 68 },
  { x: 34, y: 72 },
  { x: 83, y: 76 },
  { x: 20, y: 58 },
  { x: 55, y: 48 },
] as const;

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function round(value: number, places = 1) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

export function normalizePointer(
  clientX: number,
  clientY: number,
  bounds: Pick<DOMRect, "left" | "top" | "width" | "height">,
) {
  return {
    x: clamp((clientX - bounds.left) / bounds.width, 0, 1),
    y: clamp((clientY - bounds.top) / bounds.height, 0, 1),
  };
}

export function calculateTargetSummary(
  events: RecordedInputEvent[],
  responseTimes: number[],
) {
  const totalAttempts = events.filter(
    (event) => event.outcome === "hit" || event.outcome === "miss",
  ).length;
  const successfulActions = events.filter(
    (event) => event.outcome === "hit",
  ).length;
  const meanResponseMs = responseTimes.length
    ? Math.round(
        responseTimes.reduce((total, value) => total + value, 0) /
          responseTimes.length,
      )
    : null;

  return {
    totalAttempts,
    successfulActions,
    accuracyPercent: totalAttempts
      ? round((successfulActions / totalAttempts) * 100)
      : 0,
    meanResponseMs,
  };
}

export function cubicBezierPoint(t: number): Point {
  const start = { x: 90, y: 300 };
  const controlOne = { x: 230, y: 60 };
  const controlTwo = { x: 470, y: 340 };
  const end = { x: 710, y: 100 };
  const inverse = 1 - t;

  return {
    x:
      inverse ** 3 * start.x +
      3 * inverse ** 2 * t * controlOne.x +
      3 * inverse * t ** 2 * controlTwo.x +
      t ** 3 * end.x,
    y:
      inverse ** 3 * start.y +
      3 * inverse ** 2 * t * controlOne.y +
      3 * inverse * t ** 2 * controlTwo.y +
      t ** 3 * end.y,
  };
}

export const TRACE_REFERENCE_POINTS = Array.from({ length: 121 }, (_, index) =>
  cubicBezierPoint(index / 120),
);

export function distanceBetween(first: Point, second: Point) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

export function distanceToReferencePath(point: Point) {
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const referencePoint of TRACE_REFERENCE_POINTS) {
    closestDistance = Math.min(
      closestDistance,
      distanceBetween(point, referencePoint),
    );
  }

  return closestDistance;
}

export function calculateTracingSummary(
  points: Point[],
  allowedDistance: number,
) {
  if (!points.length) {
    return { meanPathDeviation: 0, onPathPercent: 0 };
  }

  let totalDeviation = 0;
  let onPathCount = 0;

  for (const point of points) {
    const deviation = distanceToReferencePath(point);
    totalDeviation += deviation;
    if (deviation <= allowedDistance) onPathCount += 1;
  }

  return {
    meanPathDeviation: round(totalDeviation / points.length),
    onPathPercent: round((onPathCount / points.length) * 100),
  };
}

export function formatDuration(milliseconds: number) {
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes ? `${minutes}m ${remainder}s` : `${remainder}s`;
}
