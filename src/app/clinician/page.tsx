import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRightIcon, ChartIcon, ClockIcon } from "@/components/icons";
import { PrototypeNote } from "@/components/prototype-note";
import { getDashboardData } from "@/lib/database";
import { formatDuration } from "@/lib/metrics";

export const metadata: Metadata = { title: "Research Progress" };

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function ClinicianDashboardPage() {
  await connection();
  const data = await getDashboardData();
  const averageDuration = data.sessions.length
    ? data.sessions.reduce((total, session) => total + session.totalDurationMs, 0) /
      data.sessions.length
    : 0;
  const participantById = new Map(
    data.participants.map((participant) => [participant.id, participant]),
  );

  return (
    <main className="page-wrap py-7 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Objective prototype measurements</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            Research progress
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Review fictional participant activity and session measurements. No
            clinical interpretations are generated.
          </p>
        </div>
        <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--teal)] shadow-sm">
          {data.storageMode === "supabase" ? "Supabase connected" : "Local demo store"}
        </span>
      </div>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Overview metrics">
        <div className="surface p-6">
          <p className="text-sm font-semibold text-[var(--muted)]">Participants</p>
          <p className="mt-2 text-4xl font-black">{data.participants.length}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">Fictional demo records</p>
        </div>
        <div className="surface p-6">
          <p className="text-sm font-semibold text-[var(--muted)]">Sessions completed</p>
          <p className="mt-2 text-4xl font-black">{data.sessions.length}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">Across all participants</p>
        </div>
        <div className="surface p-6">
          <p className="text-sm font-semibold text-[var(--muted)]">Average duration</p>
          <p className="mt-2 text-4xl font-black">{formatDuration(averageDuration)}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">Completed sessions</p>
        </div>
        <div className="surface p-6">
          <p className="text-sm font-semibold text-[var(--muted)]">Last 7 days</p>
          <p className="mt-2 text-4xl font-black">{data.recentSessionCount}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">Recorded sessions</p>
        </div>
      </section>

      <section className="surface mt-7 overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-5 sm:px-7">
          <div>
            <p className="eyebrow">Participants</p>
            <h2 className="mt-1 text-2xl font-extrabold">Session activity</h2>
          </div>
          <ChartIcon className="size-7 text-[var(--teal)]" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-[#f0f4f2] text-xs tracking-[0.08em] text-[var(--muted)] uppercase">
              <tr>
                <th className="px-7 py-4 font-bold">Participant</th>
                <th className="px-5 py-4 font-bold">Last session</th>
                <th className="px-5 py-4 font-bold">Sessions</th>
                <th className="px-5 py-4 font-bold">Recent target accuracy</th>
                <th className="px-5 py-4 font-bold">Status</th>
                <th className="px-7 py-4"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>
              {data.participants.map((participant) => (
                <tr key={participant.id} className="border-t border-[var(--line)] first:border-t-0 hover:bg-[#fbfcfa]">
                  <td className="px-7 py-5">
                    <Link href={`/clinician/participants/${participant.id}`} className="font-extrabold text-[var(--teal)] underline-offset-4 hover:underline">
                      {participant.participantCode}
                    </Link>
                    <span className="mt-1 block text-sm text-[var(--muted)]">{participant.displayName}</span>
                  </td>
                  <td className="px-5 py-5 font-semibold">
                    {participant.lastSessionAt ? dateFormatter.format(new Date(participant.lastSessionAt)) : "—"}
                  </td>
                  <td className="px-5 py-5 font-semibold">{participant.sessionsCompleted}</td>
                  <td className="px-5 py-5 font-semibold">
                    {participant.recentAccuracyPercent === null ? "—" : `${participant.recentAccuracyPercent}%`}
                  </td>
                  <td className="px-5 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${participant.status === "Active" ? "bg-[#dff3e9] text-[#17603f]" : "bg-[#f1eee8] text-[#6e6354]"}`}>
                      {participant.status}
                    </span>
                  </td>
                  <td className="px-7 py-5 text-right">
                    <Link href={`/clinician/participants/${participant.id}`} aria-label={`Open ${participant.participantCode}`} className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--line)] text-[var(--teal)] hover:bg-[var(--teal-pale)]">
                      <ArrowRightIcon className="size-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface mt-7 p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <ClockIcon className="text-[var(--coral-dark)]" />
          <div>
            <p className="eyebrow text-[var(--coral-dark)]">Recent activity</p>
            <h2 className="mt-1 text-2xl font-extrabold">Latest completed sessions</h2>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {data.sessions.slice(0, 5).map((session) => {
            const participant = participantById.get(session.participantId);
            const target = session.exercises.find((exercise) => exercise.exerciseSlug === "target-touch");
            return (
              <div key={session.id} className="grid gap-3 rounded-2xl border border-[var(--line)] px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div>
                  <p className="font-extrabold">{participant?.participantCode ?? "Unknown participant"}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{dateFormatter.format(new Date(session.completedAt))}</p>
                </div>
                <p className="text-sm"><span className="text-[var(--muted)]">Duration </span><strong>{formatDuration(session.totalDurationMs)}</strong></p>
                <p className="text-sm"><span className="text-[var(--muted)]">Target accuracy </span><strong>{target?.accuracyPercent ?? "—"}%</strong></p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-7"><PrototypeNote compact /></div>
    </main>
  );
}
