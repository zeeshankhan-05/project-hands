import { DEMO_PARTICIPANTS } from "@/lib/demo-data";
import type {
  ExerciseResult,
  RecordedInputEvent,
  SessionSubmission,
} from "@/lib/types";

const validExerciseSlugs = new Set(["target-touch", "path-tracing"]);
const validPointerTypes = new Set(["mouse", "pen", "touch", "unknown"]);
const validEventTypes = new Set(["pointerdown", "pointermove", "pointerup"]);
const validOutcomes = new Set([
  "hit",
  "miss",
  "on-track",
  "off-track",
  "start",
  "finish",
]);

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isIsoDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    Number.isFinite(new Date(value).getTime())
  );
}

function isInputEvent(value: unknown): value is RecordedInputEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Record<string, unknown>;

  return (
    Number.isInteger(event.sequenceNumber) &&
    validEventTypes.has(String(event.eventType)) &&
    validPointerTypes.has(String(event.pointerType)) &&
    isFiniteNumber(event.xNormalized) &&
    event.xNormalized >= 0 &&
    event.xNormalized <= 1 &&
    isFiniteNumber(event.yNormalized) &&
    event.yNormalized >= 0 &&
    event.yNormalized <= 1 &&
    isFiniteNumber(event.elapsedMs) &&
    event.elapsedMs >= 0 &&
    (event.pressure === null || isFiniteNumber(event.pressure)) &&
    (event.outcome === null || validOutcomes.has(String(event.outcome)))
  );
}

function isNullableMetric(value: unknown, minimum = 0, maximum = 100) {
  return (
    value === null ||
    (isFiniteNumber(value) && value >= minimum && value <= maximum)
  );
}

function isExerciseResult(value: unknown): value is ExerciseResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Record<string, unknown>;

  return (
    validExerciseSlugs.has(String(result.exerciseSlug)) &&
    Number.isInteger(result.sequenceNumber) &&
    isIsoDate(result.startedAt) &&
    isIsoDate(result.completedAt) &&
    result.status === "completed" &&
    Boolean(result.configuration) &&
    typeof result.configuration === "object" &&
    isFiniteNumber(result.durationMs) &&
    result.durationMs >= 0 &&
    isFiniteNumber(result.totalAttempts) &&
    result.totalAttempts >= 0 &&
    isFiniteNumber(result.successfulActions) &&
    result.successfulActions >= 0 &&
    isNullableMetric(result.accuracyPercent) &&
    isNullableMetric(result.meanResponseMs, 0, 600000) &&
    isNullableMetric(result.meanPathDeviation, 0, 1000) &&
    isNullableMetric(result.onPathPercent) &&
    Array.isArray(result.inputEvents) &&
    result.inputEvents.length <= 5000 &&
    result.inputEvents.every(isInputEvent)
  );
}

export function validateSessionSubmission(
  value: unknown,
): SessionSubmission {
  if (!value || typeof value !== "object") {
    throw new Error("Session data is missing.");
  }

  const session = value as Record<string, unknown>;
  const knownParticipant = DEMO_PARTICIPANTS.some(
    (participant) => participant.id === session.participantId,
  );

  if (!knownParticipant) throw new Error("Unknown demo participant.");
  if (!isIsoDate(session.startedAt) || !isIsoDate(session.completedAt)) {
    throw new Error("Session timestamps are invalid.");
  }
  if (
    !isFiniteNumber(session.totalDurationMs) ||
    session.totalDurationMs < 0 ||
    session.totalDurationMs > 60 * 60 * 1000
  ) {
    throw new Error("Session duration is invalid.");
  }
  if (
    !Array.isArray(session.exercises) ||
    session.exercises.length !== 2 ||
    !session.exercises.every(isExerciseResult)
  ) {
    throw new Error("Both prototype exercises must be completed.");
  }

  const slugs = new Set(
    session.exercises.map((exercise) => exercise.exerciseSlug),
  );
  if (slugs.size !== 2) throw new Error("Exercise results are duplicated.");

  return session as unknown as SessionSubmission;
}
