"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { formatDuration } from "@/lib/metrics";

interface StoredSummary {
  sessionId: string;
  completedAt: string;
  storageMode: "local-demo" | "supabase";
  totalDurationMs: number;
  targetAccuracy: number | null;
  targetAttempts: number;
  successfulTargets: number;
  meanResponseMs: number | null;
  pathDeviation: number | null;
  onPathPercent: number | null;
  traceAttempts: number;
}

const subscribeToStaticStorage = () => () => undefined;
const getServerStorageSnapshot = () => null;

export function CompleteSummary({ sessionId }: { sessionId: string | undefined }) {
  const stored = useSyncExternalStore(
    subscribeToStaticStorage,
    () => localStorage.getItem("hands:last-session:v1"),
    getServerStorageSnapshot,
  );
  let summary: StoredSummary | null = null;
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as StoredSummary;
      summary = !sessionId || parsed.sessionId === sessionId ? parsed : null;
    } catch {
      summary = null;
    }
  }

  if (!summary) {
    return (
      <section className="surface p-8 text-center sm:p-12">
        <h1 className="text-4xl font-black">Session saved</h1>
        <p className="mt-4 text-[var(--muted)]">
          The detailed summary is unavailable in this browser, but the stored
          session may still appear in the progress view.
        </p>
        <Link href="/patient" className="button-primary tablet-button mt-8">
          Return home
        </Link>
      </section>
    );
  }

  return (
    <section className="surface overflow-hidden">
      <div className="bg-[var(--teal-dark)] px-6 py-9 text-center text-white sm:px-10 sm:py-11">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-white/14">
          <CheckIcon className="size-11" />
        </span>
        <p className="mt-5 text-sm font-black tracking-[0.15em] text-white/70 uppercase">
          Session complete
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
          Nice work finishing both activities
        </h1>
        <p className="mt-4 text-white/75">
          Results saved to {summary.storageMode === "supabase" ? "the prototype database" : "the local demo store"}.
        </p>
      </div>

      <div className="p-6 sm:p-9">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-[#eff8f6] p-5">
            <p className="text-sm font-semibold text-[var(--muted)]">Total duration</p>
            <p className="mt-2 text-3xl font-black">{formatDuration(summary.totalDurationMs)}</p>
          </div>
          <div className="rounded-2xl bg-[#eff8f6] p-5">
            <p className="text-sm font-semibold text-[var(--muted)]">Target accuracy</p>
            <p className="mt-2 text-3xl font-black">{summary.targetAccuracy ?? "—"}%</p>
          </div>
          <div className="rounded-2xl bg-[#fff0eb] p-5">
            <p className="text-sm font-semibold text-[var(--muted)]">On-path points</p>
            <p className="mt-2 text-3xl font-black">{summary.onPathPercent ?? "—"}%</p>
          </div>
          <div className="rounded-2xl bg-[#fff0eb] p-5">
            <p className="text-sm font-semibold text-[var(--muted)]">Path deviation</p>
            <p className="mt-2 text-3xl font-black">{summary.pathDeviation ?? "—"}px</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--line)] p-5">
          <h2 className="font-extrabold">Recorded measurements</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-[var(--muted)]">Successful targets</dt>
              <dd className="mt-1 font-bold">{summary.successfulTargets}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Target attempts</dt>
              <dd className="mt-1 font-bold">{summary.targetAttempts}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Mean response time</dt>
              <dd className="mt-1 font-bold">
                {summary.meanResponseMs === null
                  ? "—"
                  : `${(summary.meanResponseMs / 1000).toFixed(2)}s`}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Tracing attempts</dt>
              <dd className="mt-1 font-bold">{summary.traceAttempts}</dd>
            </div>
          </dl>
        </div>

        <p className="mt-5 text-center text-sm leading-6 text-[var(--muted)]">
          Measurements describe this prototype interaction only and are not a
          diagnosis or clinical assessment.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/patient" className="button-secondary tablet-button">
            Return home
          </Link>
          <Link href="/clinician" className="button-primary tablet-button">
            View progress data
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
