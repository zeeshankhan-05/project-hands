import Link from "next/link";

export function ProjectMark({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 items-center gap-3 rounded-xl text-[var(--ink)]"
      aria-label="Project H.A.N.D.S. prototype home"
    >
      <span
        className="grid size-11 grid-cols-2 gap-1 rounded-[14px] bg-[var(--teal)] p-2.5"
        aria-hidden="true"
      >
        <span className="rounded-full bg-white" />
        <span className="rounded-full bg-[var(--coral)]" />
        <span className="rounded-full bg-[var(--coral)]" />
        <span className="rounded-full bg-white" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-black tracking-[0.14em]">
          H.A.N.D.S.
        </span>
        <span className="hidden text-xs text-[var(--muted)] sm:block">
          Technical prototype
        </span>
      </span>
    </Link>
  );
}
