import Link from "next/link";
import { ProjectMark } from "@/components/project-mark";

export function AppHeader({
  area,
  homeHref,
}: {
  area: string;
  homeHref: string;
}) {
  return (
    <header className="border-b border-black/5 bg-[rgb(255_254_250/88%)] backdrop-blur">
      <div className="page-wrap flex min-h-20 items-center justify-between gap-4 py-3">
        <ProjectMark />
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-[var(--teal-pale)] px-3 py-1.5 text-sm font-bold text-[var(--teal-dark)] sm:inline-flex">
            {area}
          </span>
          <Link
            href={homeHref}
            className="button-quiet min-h-11 px-4 text-sm"
          >
            Home
          </Link>
        </div>
      </div>
    </header>
  );
}
