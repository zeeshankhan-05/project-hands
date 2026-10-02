import Link from "next/link";
import { ArrowRightIcon, ChartIcon, TabletIcon } from "@/components/icons";
import { ProjectMark } from "@/components/project-mark";
import { PrototypeNote } from "@/components/prototype-note";

export default function Home() {
  return (
    <main className="app-shell">
      <div className="page-wrap flex min-h-screen flex-col py-6 sm:py-10">
        <ProjectMark />

        <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow mb-5">Project H.A.N.D.S.</p>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Movement data,
              <span className="block text-[var(--teal)]">made visible.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
              A tablet-first prototype for completing two structured dexterity
              interactions and reviewing objective session measurements over
              time.
            </p>
            <div className="mt-8 max-w-2xl">
              <PrototypeNote />
            </div>
          </div>

          <div className="grid gap-5">
            <Link
              href="/patient"
              className="surface group flex min-h-52 flex-col justify-between p-7 transition hover:-translate-y-1 hover:border-[var(--teal)]/30 sm:p-8"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[var(--teal-pale)] text-[var(--teal)]">
                <TabletIcon className="size-7" />
              </span>
              <span className="mt-8 flex items-end justify-between gap-5">
                <span>
                  <span className="eyebrow">Participant</span>
                  <span className="mt-2 block text-2xl font-extrabold">
                    Start today&apos;s session
                  </span>
                </span>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--teal)] text-white transition group-hover:translate-x-1">
                  <ArrowRightIcon />
                </span>
              </span>
            </Link>

            <Link
              href="/clinician"
              className="surface group flex min-h-52 flex-col justify-between p-7 transition hover:-translate-y-1 hover:border-[var(--coral)]/40 sm:p-8"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[#fee7df] text-[var(--coral-dark)]">
                <ChartIcon className="size-7" />
              </span>
              <span className="mt-8 flex items-end justify-between gap-5">
                <span>
                  <span className="eyebrow text-[var(--coral-dark)]">
                    Research progress view
                  </span>
                  <span className="mt-2 block text-2xl font-extrabold">
                    Review participant activity
                  </span>
                </span>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--coral)] text-white transition group-hover:translate-x-1">
                  <ArrowRightIcon />
                </span>
              </span>
            </Link>
          </div>
        </section>

        <footer className="border-t border-black/8 py-5 text-sm text-[var(--muted)]">
          Home-based Augmented Neurorehabilitation for Dexterity Support
        </footer>
      </div>
    </main>
  );
}
