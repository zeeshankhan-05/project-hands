"use client";

export default function ClinicianError({ reset }: { reset: () => void }) {
  return (
    <main className="page-wrap py-12">
      <section className="surface p-10 text-center">
        <p className="eyebrow text-[var(--coral-dark)]">Data unavailable</p>
        <h1 className="mt-2 text-4xl font-black">The progress view could not load</h1>
        <p className="mt-4 text-[var(--muted)]">Check the database configuration or try again.</p>
        <button type="button" onClick={reset} className="button-primary mt-7">Try again</button>
      </section>
    </main>
  );
}
