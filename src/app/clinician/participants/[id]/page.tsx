import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { LineChart } from "@/components/clinician/line-chart";
import { ArrowLeftIcon, ClockIcon, TargetIcon, TraceIcon } from "@/components/icons";
import { getParticipantWithSessions } from "@/lib/database";
import { formatDuration } from "@/lib/metrics";

export const metadata: Metadata = { title: "Participant Progress" };

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default async function ParticipantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const participant = await getParticipantWithSessions(id);
  if (!participant) notFound();

  const sessions = participant.sessions.toSorted(
    (first, second) =>
      new Date(second.completedAt).getTime() -
      new Date(first.completedAt).getTime(),
  );
  const latest = sessions[0];
  const chronological = sessions.toReversed();
  const accuracyPoints = chronological.flatMap((session) => {
    const target = session.exercises.find(
      (exercise) => exercise.exerciseSlug === "target-touch",
    );
    return target?.accuracyPercent === null || target?.accuracyPercent === undefined
      ? []
      : [{ label: shortDateFormatter.format(new Date(session.completedAt)), value: target.accuracyPercent }];
  });
  const durationPoints = chronological.map((session) => ({
    label: shortDateFormatter.format(new Date(session.completedAt)),
    value: Math.round(session.totalDurationMs / 1000),
  }));
  const latestTarget = latest?.exercises.find(
    (exercise) => exercise.exerciseSlug === "target-touch",
  );
  const latestTrace = latest?.exercises.find(
    (exercise) => exercise.exerciseSlug === "path-tracing",
  );

  return (
    <main className="page-wrap py-7 sm:py-10">
      <Link href="/clinician" className="inline-flex min-h-11 items-center gap-2 rounded-xl font-bold text-[var(--teal)] hover:underline">
        <ArrowLeftIcon className="size-5" />
        Back to all participants
      </Link>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Participant detail</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            {participant.participantCode}
          </h1>
          <p className="mt-2 text-lg text-[var(--muted)]">{participant.displayName}</p>
        </div>
        <p className="max-w-md rounded-xl bg-[#fff5d9] px-4 py-3 text-xs leading-5 text-[#6d4b15]">
          Objective prototype measurements only. No clinical assessment or
          recommendation is shown.
        </p>
      </div>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Latest participant measurements">
        <div className="surface p-6">
          <p className="text-sm font-semibold text-[var(--muted)]">Sessions completed</p>
          <p className="mt-2 text-4xl font-black">{sessions.length}</p>
        </div>
        <div className="surface p-6">
          <p className="text-sm font-semibold text-[var(--muted)]">Latest duration</p>
          <p className="mt-2 text-4xl font-black">{latest ? formatDuration(latest.totalDurationMs) : "—"}</p>
        </div>
        <div className="surface p-6">
          <p className="text-sm font-semibold text-[var(--muted)]">Latest target accuracy</p>
          <p className="mt-2 text-4xl font-black">{latestTarget?.accuracyPercent ?? "—"}%</p>
        </div>
        <div className="surface p-6">
          <p className="text-sm font-semibold text-[var(--muted)]">Latest on-path points</p>
          <p className="mt-2 text-4xl font-black">{latestTrace?.onPathPercent ?? "—"}%</p>
        </div>
      </section>

      <section className="mt-7 grid gap-6 xl:grid-cols-2">
        <div className="surface p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--teal-pale)] text-[var(--teal)]"><TargetIcon /></span>
            <div><p className="eyebrow">Target Touch</p><h2 className="text-xl font-extrabold">Accuracy over time</h2></div>
          </div>
          <div className="mt-5"><LineChart points={accuracyPoints} label="Target accuracy over time" suffix="%" maximumValue={100} /></div>
        </div>
        <div className="surface p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#fff0eb] text-[var(--coral-dark)]"><ClockIcon /></span>
            <div><p className="eyebrow text-[var(--coral-dark)]">All activities</p><h2 className="text-xl font-extrabold">Completion time over time</h2></div>
          </div>
          <div className="mt-5"><LineChart points={durationPoints} label="Session completion time over time" suffix="s" color="#ed775e" /></div>
        </div>
      </section>

      <section className="surface mt-7 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-6 py-5 sm:px-7">
          <TraceIcon className="text-[var(--teal)]" />
          <div><p className="eyebrow">Session history</p><h2 className="mt-1 text-2xl font-extrabold">Recorded measurements</h2></div>
        </div>
        {sessions.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-[#f0f4f2] text-xs tracking-[0.08em] text-[var(--muted)] uppercase">
                <tr>
                  <th className="px-7 py-4">Date</th>
                  <th className="px-5 py-4">Duration</th>
                  <th className="px-5 py-4">Targets</th>
                  <th className="px-5 py-4">Attempts</th>
                  <th className="px-5 py-4">Accuracy</th>
                  <th className="px-5 py-4">Mean response</th>
                  <th className="px-5 py-4">On path</th>
                  <th className="px-7 py-4">Path deviation</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => {
                  const target = session.exercises.find((exercise) => exercise.exerciseSlug === "target-touch");
                  const trace = session.exercises.find((exercise) => exercise.exerciseSlug === "path-tracing");
                  return (
                    <tr key={session.id} className="border-t border-[var(--line)] first:border-t-0">
                      <td className="px-7 py-5 font-bold">{dateFormatter.format(new Date(session.completedAt))}</td>
                      <td className="px-5 py-5">{formatDuration(session.totalDurationMs)}</td>
                      <td className="px-5 py-5">{target?.successfulActions ?? "—"}</td>
                      <td className="px-5 py-5">{target?.totalAttempts ?? "—"}</td>
                      <td className="px-5 py-5">{target?.accuracyPercent ?? "—"}%</td>
                      <td className="px-5 py-5">{target?.meanResponseMs ? `${(target.meanResponseMs / 1000).toFixed(2)}s` : "—"}</td>
                      <td className="px-5 py-5">{trace?.onPathPercent ?? "—"}%</td>
                      <td className="px-7 py-5">{trace?.meanPathDeviation ?? "—"}px</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-[var(--muted)]">No completed sessions are available for this participant.</div>
        )}
      </section>
    </main>
  );
}
