import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  TargetIcon,
  TraceIcon,
} from "@/components/icons";
import { PrototypeNote } from "@/components/prototype-note";
import { getDemoParticipant } from "@/lib/database";
import { formatDuration } from "@/lib/metrics";

export const metadata: Metadata = { title: "Participant Home" };

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function PatientHomePage() {
  await connection();
  const participant = await getDemoParticipant();

  if (!participant) {
    return (
      <main className="patient-wrap py-10">
        <div className="surface p-8">
          <h1 className="text-3xl font-bold">Demo participant unavailable</h1>
          <p className="mt-3 text-[var(--muted)]">
            Check the configured data source and try again.
          </p>
        </div>
      </main>
    );
  }

  const latest = participant.sessions[0];
  const targetResult = latest?.exercises.find(
    (exercise) => exercise.exerciseSlug === "target-touch",
  );

  return (
    <main className="patient-wrap py-7 sm:py-10">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.035em] sm:text-5xl">
            {participant.displayName}
          </h1>
          <p className="mt-2 text-lg text-[var(--muted)]">
            Participant {participant.participantCode}
          </p>
        </div>
        <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--teal)] shadow-sm">
          {participant.storageMode === "supabase"
            ? "Database connected"
            : "Local demo mode"}
        </span>
      </div>

      <section className="surface overflow-hidden">
        <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--teal-pale)] text-[var(--teal)]">
                <CheckIcon />
              </span>
              <div>
                <p className="eyebrow">Today&apos;s session</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Approximately 2–3 minutes for this prototype
                </p>
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight">
              Two guided activities are ready
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex min-h-24 items-center gap-4 rounded-2xl bg-[#eff8f6] p-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--teal)]">
                  <TargetIcon />
                </span>
                <span>
                  <strong className="block">1. Target Touch</strong>
                  <span className="text-sm text-[var(--muted)]">
                    Touch six targets
                  </span>
                </span>
              </div>
              <div className="flex min-h-24 items-center gap-4 rounded-2xl bg-[#fff0eb] p-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--coral-dark)]">
                  <TraceIcon />
                </span>
                <span>
                  <strong className="block">2. Path Tracing</strong>
                  <span className="text-sm text-[var(--muted)]">
                    Follow one curved path
                  </span>
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/patient/session"
            className="button-primary tablet-button w-full lg:w-auto"
          >
            Start session
            <ArrowRightIcon />
          </Link>
        </div>
        <div className="border-t border-black/6 bg-[var(--teal-dark)] px-6 py-4 text-sm leading-6 text-white/90 sm:px-9">
          Use one finger or a compatible stylus. Move at a comfortable pace and
          follow the on-screen instructions.
        </div>
      </section>

      <section className="mt-7 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="surface p-6 sm:p-7">
          <p className="eyebrow">Progress</p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-5xl font-black">
              {participant.sessions.length}
            </span>
            <span className="pb-1.5 font-semibold text-[var(--muted)]">
              sessions completed
            </span>
          </div>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#dfe8e6]">
            <div className="h-full w-3/4 rounded-full bg-[var(--teal)]" />
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Prototype history includes fictional seed sessions.
          </p>
        </div>

        <div className="surface p-6 sm:p-7">
          <p className="eyebrow">Previous session</p>
          {latest ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-[var(--muted)]">Completed</p>
                <p className="mt-1 text-lg font-bold">
                  {dateFormatter.format(new Date(latest.completedAt))}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Duration</p>
                <p className="mt-1 flex items-center gap-2 text-lg font-bold">
                  <ClockIcon className="size-5 text-[var(--teal)]" />
                  {formatDuration(latest.totalDurationMs)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Target accuracy</p>
                <p className="mt-1 text-lg font-bold">
                  {targetResult?.accuracyPercent ?? "—"}%
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-[var(--muted)]">
              No completed sessions yet.
            </p>
          )}
        </div>
      </section>

      <div className="mt-7">
        <PrototypeNote compact />
      </div>
    </main>
  );
}
