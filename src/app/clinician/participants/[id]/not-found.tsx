import Link from "next/link";

export default function ParticipantNotFound() {
  return (
    <main className="page-wrap py-12">
      <section className="surface p-10 text-center">
        <h1 className="text-4xl font-black">Participant not found</h1>
        <p className="mt-4 text-[var(--muted)]">The requested fictional participant record is unavailable.</p>
        <Link href="/clinician" className="button-primary mt-7">Return to progress overview</Link>
      </section>
    </main>
  );
}
