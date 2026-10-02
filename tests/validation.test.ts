import { describe, expect, it } from "vitest";
import { DEMO_PARTICIPANT_ID } from "../src/lib/demo-data";
import type { ExerciseResult, SessionSubmission } from "../src/lib/types";
import { validateSessionSubmission } from "../src/lib/validation";

const completedAt = "2026-10-01T18:01:00.000Z";
const startedAt = "2026-10-01T18:00:00.000Z";

function exercise(
  exerciseSlug: ExerciseResult["exerciseSlug"],
  sequenceNumber: number,
): ExerciseResult {
  return {
    exerciseSlug,
    sequenceNumber,
    startedAt,
    completedAt,
    status: "completed",
    configuration: {},
    durationMs: 30000,
    totalAttempts: 6,
    successfulActions: 6,
    accuracyPercent: exerciseSlug === "target-touch" ? 100 : null,
    meanResponseMs: exerciseSlug === "target-touch" ? 1000 : null,
    meanPathDeviation: exerciseSlug === "path-tracing" ? 10 : null,
    onPathPercent: exerciseSlug === "path-tracing" ? 95 : null,
    inputEvents: [],
  };
}

function submission(): SessionSubmission {
  return {
    participantId: DEMO_PARTICIPANT_ID,
    startedAt,
    completedAt,
    totalDurationMs: 60000,
    exercises: [exercise("target-touch", 1), exercise("path-tracing", 2)],
  };
}

describe("session validation", () => {
  it("accepts a bounded two-exercise prototype session", () => {
    expect(validateSessionSubmission(submission())).toEqual(submission());
  });

  it("rejects an unknown participant", () => {
    expect(() =>
      validateSessionSubmission({
        ...submission(),
        participantId: "00000000-0000-4000-8000-000000000000",
      }),
    ).toThrow("Unknown demo participant");
  });

  it("rejects duplicate exercise results", () => {
    const value = submission();
    value.exercises = [exercise("target-touch", 1), exercise("target-touch", 2)];
    expect(() => validateSessionSubmission(value)).toThrow(
      "Exercise results are duplicated",
    );
  });
});
