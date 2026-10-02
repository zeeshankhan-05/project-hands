import { describe, expect, it } from "vitest";
import {
  calculateTargetSummary,
  calculateTracingSummary,
  TRACE_REFERENCE_POINTS,
} from "../src/lib/metrics";
import type { RecordedInputEvent } from "../src/lib/types";

function event(
  sequenceNumber: number,
  outcome: RecordedInputEvent["outcome"],
): RecordedInputEvent {
  return {
    sequenceNumber,
    eventType: "pointerdown",
    pointerType: "touch",
    xNormalized: 0.5,
    yNormalized: 0.5,
    elapsedMs: sequenceNumber * 100,
    pressure: 0.5,
    outcome,
  };
}

describe("exercise metrics", () => {
  it("calculates target accuracy and mean response time", () => {
    const summary = calculateTargetSummary(
      [event(1, "hit"), event(2, "miss"), event(3, "hit")],
      [1000, 1500],
    );

    expect(summary).toEqual({
      totalAttempts: 3,
      successfulActions: 2,
      accuracyPercent: 66.7,
      meanResponseMs: 1250,
    });
  });

  it("reports perfect tracing measurements on the reference center line", () => {
    const summary = calculateTracingSummary(
      TRACE_REFERENCE_POINTS.filter((_, index) => index % 10 === 0),
      30,
    );

    expect(summary.meanPathDeviation).toBe(0);
    expect(summary.onPathPercent).toBe(100);
  });

  it("handles an empty trace without invalid numbers", () => {
    expect(calculateTracingSummary([], 30)).toEqual({
      meanPathDeviation: 0,
      onPathPercent: 0,
    });
  });
});
