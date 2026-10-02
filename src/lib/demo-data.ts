import type {
  ExerciseDefinition,
  Participant,
  SessionRecord,
} from "@/lib/types";

export const DEMO_PARTICIPANT_ID = "10000000-0000-4000-8000-000000000001";

export const DEMO_PARTICIPANTS: Participant[] = [
  {
    id: DEMO_PARTICIPANT_ID,
    participantCode: "P-001",
    displayName: "Demo Participant",
    createdAt: "2026-09-01T14:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    participantCode: "P-002",
    displayName: "Sample Participant 2",
    createdAt: "2026-09-01T14:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    participantCode: "P-003",
    displayName: "Sample Participant 3",
    createdAt: "2026-09-01T14:00:00.000Z",
  },
];

export const EXERCISES: ExerciseDefinition[] = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    slug: "target-touch",
    name: "Target Touch",
    description: "Touch each on-screen target as it appears.",
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    slug: "path-tracing",
    name: "Path Tracing",
    description: "Follow the path from its start to its finish.",
  },
];

function dateDaysAgo(days: number, hour = 15) {
  const date = new Date();
  date.setUTCHours(hour, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

function seedSession(
  id: string,
  participantId: string,
  daysAgo: number,
  durationMs: number,
  accuracyPercent: number,
  meanResponseMs: number,
  pathDeviation: number,
  onPathPercent: number,
): SessionRecord {
  const startedAt = dateDaysAgo(daysAgo);
  const completedAt = new Date(
    new Date(startedAt).getTime() + durationMs,
  ).toISOString();

  return {
    id,
    participantId,
    startedAt,
    completedAt,
    totalDurationMs: durationMs,
    status: "completed",
    createdAt: completedAt,
    exercises: [
      {
        id: `${id}-target`,
        exerciseSlug: "target-touch",
        sequenceNumber: 1,
        startedAt,
        completedAt,
        status: "completed",
        configuration: { targetSize: "large", repetitions: 6 },
        durationMs: Math.round(durationMs * 0.48),
        totalAttempts: 7,
        successfulActions: 6,
        accuracyPercent,
        meanResponseMs,
        meanPathDeviation: null,
        onPathPercent: null,
        inputEvents: [],
      },
      {
        id: `${id}-trace`,
        exerciseSlug: "path-tracing",
        sequenceNumber: 2,
        startedAt,
        completedAt,
        status: "completed",
        configuration: { pathWidth: "wide" },
        durationMs: Math.round(durationMs * 0.52),
        totalAttempts: 1,
        successfulActions: 1,
        accuracyPercent: null,
        meanResponseMs: null,
        meanPathDeviation: pathDeviation,
        onPathPercent,
        inputEvents: [],
      },
    ],
  };
}

export const SEED_SESSIONS: SessionRecord[] = [
  seedSession(
    "30000000-0000-4000-8000-000000000001",
    DEMO_PARTICIPANT_ID,
    9,
    112000,
    75,
    1840,
    31.4,
    71,
  ),
  seedSession(
    "30000000-0000-4000-8000-000000000002",
    DEMO_PARTICIPANT_ID,
    6,
    103000,
    80,
    1680,
    27.8,
    77,
  ),
  seedSession(
    "30000000-0000-4000-8000-000000000003",
    DEMO_PARTICIPANT_ID,
    3,
    95000,
    86,
    1490,
    23.2,
    82,
  ),
  seedSession(
    "30000000-0000-4000-8000-000000000004",
    DEMO_PARTICIPANTS[1].id,
    8,
    121000,
    71,
    2010,
    34.1,
    68,
  ),
  seedSession(
    "30000000-0000-4000-8000-000000000005",
    DEMO_PARTICIPANTS[1].id,
    5,
    114000,
    75,
    1880,
    30.6,
    73,
  ),
  seedSession(
    "30000000-0000-4000-8000-000000000006",
    DEMO_PARTICIPANTS[1].id,
    2,
    107000,
    80,
    1740,
    28.9,
    76,
  ),
  seedSession(
    "30000000-0000-4000-8000-000000000007",
    DEMO_PARTICIPANTS[2].id,
    12,
    132000,
    67,
    2310,
    38.2,
    63,
  ),
  seedSession(
    "30000000-0000-4000-8000-000000000008",
    DEMO_PARTICIPANTS[2].id,
    7,
    124000,
    71,
    2140,
    35.5,
    67,
  ),
  seedSession(
    "30000000-0000-4000-8000-000000000009",
    DEMO_PARTICIPANTS[2].id,
    4,
    119000,
    75,
    1990,
    32.7,
    71,
  ),
];
