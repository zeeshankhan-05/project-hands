export type ExerciseSlug = "target-touch" | "path-tracing";

export type PointerKind = "mouse" | "pen" | "touch" | "unknown";

export type InputOutcome =
  | "hit"
  | "miss"
  | "on-track"
  | "off-track"
  | "start"
  | "finish";

export interface RecordedInputEvent {
  sequenceNumber: number;
  eventType: "pointerdown" | "pointermove" | "pointerup";
  pointerType: PointerKind;
  xNormalized: number;
  yNormalized: number;
  elapsedMs: number;
  pressure: number | null;
  outcome: InputOutcome | null;
}

export interface ExerciseResult {
  id?: string;
  exerciseSlug: ExerciseSlug;
  sequenceNumber: number;
  startedAt: string;
  completedAt: string;
  status: "completed";
  configuration: Record<string, string | number | boolean>;
  durationMs: number;
  totalAttempts: number;
  successfulActions: number;
  accuracyPercent: number | null;
  meanResponseMs: number | null;
  meanPathDeviation: number | null;
  onPathPercent: number | null;
  inputEvents: RecordedInputEvent[];
}

export interface SessionSubmission {
  participantId: string;
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
  exercises: ExerciseResult[];
}

export interface SessionRecord extends SessionSubmission {
  id: string;
  status: "completed";
  createdAt: string;
}

export interface Participant {
  id: string;
  participantCode: string;
  displayName: string;
  createdAt: string;
}

export interface ExerciseDefinition {
  id: string;
  slug: ExerciseSlug;
  name: string;
  description: string;
}

export interface ParticipantWithSessions extends Participant {
  sessions: SessionRecord[];
}

export interface ParticipantSummary extends Participant {
  sessionsCompleted: number;
  lastSessionAt: string | null;
  recentAccuracyPercent: number | null;
  recentDurationSeconds: number | null;
  status: "Active" | "No recent session";
}

export interface DashboardData {
  participants: ParticipantSummary[];
  sessions: SessionRecord[];
  recentSessionCount: number;
  storageMode: "local-demo" | "supabase";
}

export interface SaveSessionResult {
  sessionId: string;
  storageMode: "local-demo" | "supabase";
}
