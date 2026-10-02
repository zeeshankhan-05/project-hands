import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  DEMO_PARTICIPANTS,
  EXERCISES,
  SEED_SESSIONS,
} from "@/lib/demo-data";
import type {
  DashboardData,
  ExerciseResult,
  Participant,
  ParticipantSummary,
  ParticipantWithSessions,
  SaveSessionResult,
  SessionRecord,
  SessionSubmission,
} from "@/lib/types";

const dataDirectory = path.join(process.cwd(), ".data");
const localSessionFile = path.join(dataDirectory, "sessions.json");

function hasSupabaseConfiguration() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

function createSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) return null;

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function readLocalSessions() {
  try {
    const contents = await fs.readFile(localSessionFile, "utf8");
    const sessions = JSON.parse(contents) as SessionRecord[];
    return Array.isArray(sessions) ? sessions : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocalSessions(sessions: SessionRecord[]) {
  await fs.mkdir(dataDirectory, { recursive: true });
  const temporaryFile = `${localSessionFile}.${process.pid}.tmp`;
  await fs.writeFile(temporaryFile, JSON.stringify(sessions, null, 2), "utf8");
  await fs.rename(temporaryFile, localSessionFile);
}

function getTargetAccuracy(session: SessionRecord) {
  return (
    session.exercises.find(
      (exercise) => exercise.exerciseSlug === "target-touch",
    )?.accuracyPercent ?? null
  );
}

function summarizeParticipant(
  participant: Participant,
  sessions: SessionRecord[],
): ParticipantSummary {
  const participantSessions = sessions
    .filter((session) => session.participantId === participant.id)
    .toSorted(
      (first, second) =>
        new Date(second.completedAt).getTime() -
        new Date(first.completedAt).getTime(),
    );
  const latest = participantSessions[0];
  const activeThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return {
    ...participant,
    sessionsCompleted: participantSessions.length,
    lastSessionAt: latest?.completedAt ?? null,
    recentAccuracyPercent: latest ? getTargetAccuracy(latest) : null,
    recentDurationSeconds: latest
      ? Math.round(latest.totalDurationMs / 1000)
      : null,
    status:
      latest && new Date(latest.completedAt).getTime() >= activeThreshold
        ? "Active"
        : "No recent session",
  };
}

type SupabaseExerciseRow = {
  id: string;
  sequence_number: number;
  started_at: string;
  completed_at: string;
  status: "completed";
  configuration: Record<string, string | number | boolean>;
  duration_ms: number;
  total_attempts: number;
  successful_actions: number;
  accuracy_percent: number | null;
  mean_response_ms: number | null;
  mean_path_deviation: number | null;
  on_path_percent: number | null;
  exercises: { slug: "target-touch" | "path-tracing" } | null;
  input_events?: Array<{
    sequence_number: number;
    event_type: "pointerdown" | "pointermove" | "pointerup";
    pointer_type: "mouse" | "pen" | "touch" | "unknown";
    x_normalized: number;
    y_normalized: number;
    elapsed_ms: number;
    pressure: number | null;
    outcome: ExerciseResult["inputEvents"][number]["outcome"];
  }>;
};

type SupabaseSessionRow = {
  id: string;
  participant_id: string;
  started_at: string;
  completed_at: string;
  status: "completed";
  total_duration_ms: number;
  created_at: string;
  session_exercises: SupabaseExerciseRow[];
};

function mapSupabaseSession(row: SupabaseSessionRow): SessionRecord {
  return {
    id: row.id,
    participantId: row.participant_id,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    status: row.status,
    totalDurationMs: row.total_duration_ms,
    createdAt: row.created_at,
    exercises: row.session_exercises
      .toSorted((first, second) => first.sequence_number - second.sequence_number)
      .map((exercise) => ({
        id: exercise.id,
        exerciseSlug: exercise.exercises?.slug ?? "target-touch",
        sequenceNumber: exercise.sequence_number,
        startedAt: exercise.started_at,
        completedAt: exercise.completed_at,
        status: exercise.status,
        configuration: exercise.configuration,
        durationMs: exercise.duration_ms,
        totalAttempts: exercise.total_attempts,
        successfulActions: exercise.successful_actions,
        accuracyPercent: exercise.accuracy_percent,
        meanResponseMs: exercise.mean_response_ms,
        meanPathDeviation: exercise.mean_path_deviation,
        onPathPercent: exercise.on_path_percent,
        inputEvents: (exercise.input_events ?? []).map((event) => ({
          sequenceNumber: event.sequence_number,
          eventType: event.event_type,
          pointerType: event.pointer_type,
          xNormalized: Number(event.x_normalized),
          yNormalized: Number(event.y_normalized),
          elapsedMs: event.elapsed_ms,
          pressure: event.pressure === null ? null : Number(event.pressure),
          outcome: event.outcome,
        })),
      })),
  };
}

async function getSupabaseData() {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;

  const [participantsResponse, sessionsResponse] = await Promise.all([
    supabase
      .from("participants")
      .select("id, participant_code, display_name, created_at")
      .order("participant_code"),
    supabase
      .from("sessions")
      .select(
        `id, participant_id, started_at, completed_at, status, total_duration_ms, created_at,
        session_exercises(
          id, sequence_number, started_at, completed_at, status, configuration,
          duration_ms, total_attempts, successful_actions, accuracy_percent,
          mean_response_ms, mean_path_deviation, on_path_percent,
          exercises(slug)
        )`,
      )
      .eq("status", "completed")
      .order("completed_at", { ascending: false }),
  ]);

  if (participantsResponse.error) throw participantsResponse.error;
  if (sessionsResponse.error) throw sessionsResponse.error;

  const participants: Participant[] = (participantsResponse.data ?? []).map(
    (participant) => ({
      id: participant.id,
      participantCode: participant.participant_code,
      displayName: participant.display_name,
      createdAt: participant.created_at,
    }),
  );

  return {
    participants,
    sessions: (sessionsResponse.data ?? []).map((session) =>
      mapSupabaseSession(session as unknown as SupabaseSessionRow),
    ),
  };
}

async function getAllData() {
  if (hasSupabaseConfiguration()) {
    const remoteData = await getSupabaseData();
    if (remoteData) return { ...remoteData, storageMode: "supabase" as const };
  }

  const localSessions = await readLocalSessions();
  return {
    participants: DEMO_PARTICIPANTS,
    sessions: [...localSessions, ...SEED_SESSIONS].toSorted(
      (first, second) =>
        new Date(second.completedAt).getTime() -
        new Date(first.completedAt).getTime(),
    ),
    storageMode: "local-demo" as const,
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const data = await getAllData();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return {
    participants: data.participants.map((participant) =>
      summarizeParticipant(participant, data.sessions),
    ),
    sessions: data.sessions,
    recentSessionCount: data.sessions.filter(
      (session) => new Date(session.completedAt).getTime() >= sevenDaysAgo,
    ).length,
    storageMode: data.storageMode,
  };
}

export async function getParticipantWithSessions(
  id: string,
): Promise<ParticipantWithSessions | null> {
  const data = await getAllData();
  const participant = data.participants.find((entry) => entry.id === id);
  if (!participant) return null;

  return {
    ...participant,
    sessions: data.sessions.filter((session) => session.participantId === id),
  };
}

export async function getDemoParticipant() {
  const data = await getAllData();
  const participant = data.participants[0];
  return participant
    ? {
        ...participant,
        sessions: data.sessions.filter(
          (session) => session.participantId === participant.id,
        ),
        storageMode: data.storageMode,
      }
    : null;
}

async function saveToSupabase(
  submission: SessionSubmission,
): Promise<SaveSessionResult> {
  const supabase = createSupabaseAdmin();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      participant_id: submission.participantId,
      started_at: submission.startedAt,
      completed_at: submission.completedAt,
      status: "completed",
      total_duration_ms: submission.totalDurationMs,
    })
    .select("id")
    .single();

  if (sessionError) throw sessionError;

  try {
    for (const exercise of submission.exercises) {
      const definition = EXERCISES.find(
        (entry) => entry.slug === exercise.exerciseSlug,
      );
      if (!definition) throw new Error("Exercise definition is missing.");

      const { data: storedExercise, error: exerciseError } = await supabase
        .from("session_exercises")
        .insert({
          session_id: session.id,
          exercise_id: definition.id,
          sequence_number: exercise.sequenceNumber,
          started_at: exercise.startedAt,
          completed_at: exercise.completedAt,
          status: exercise.status,
          configuration: exercise.configuration,
          duration_ms: exercise.durationMs,
          total_attempts: exercise.totalAttempts,
          successful_actions: exercise.successfulActions,
          accuracy_percent: exercise.accuracyPercent,
          mean_response_ms: exercise.meanResponseMs,
          mean_path_deviation: exercise.meanPathDeviation,
          on_path_percent: exercise.onPathPercent,
        })
        .select("id")
        .single();

      if (exerciseError) throw exerciseError;

      if (exercise.inputEvents.length) {
        const { error: inputError } = await supabase.from("input_events").insert(
          exercise.inputEvents.map((event) => ({
            session_exercise_id: storedExercise.id,
            sequence_number: event.sequenceNumber,
            event_type: event.eventType,
            pointer_type: event.pointerType,
            x_normalized: event.xNormalized,
            y_normalized: event.yNormalized,
            elapsed_ms: event.elapsedMs,
            pressure: event.pressure,
            outcome: event.outcome,
          })),
        );
        if (inputError) throw inputError;
      }
    }
  } catch (error) {
    await supabase.from("sessions").delete().eq("id", session.id);
    throw error;
  }

  return { sessionId: session.id, storageMode: "supabase" };
}

export async function saveSession(
  submission: SessionSubmission,
): Promise<SaveSessionResult> {
  if (hasSupabaseConfiguration()) return saveToSupabase(submission);

  const sessions = await readLocalSessions();
  const sessionId = crypto.randomUUID();
  const record: SessionRecord = {
    ...submission,
    id: sessionId,
    status: "completed",
    createdAt: new Date().toISOString(),
    exercises: submission.exercises.map((exercise) => ({
      ...exercise,
      id: crypto.randomUUID(),
    })),
  };
  await writeLocalSessions([record, ...sessions]);
  return { sessionId, storageMode: "local-demo" };
}
