import type { Metadata } from "next";
import { CompleteSummary } from "@/components/patient/complete-summary";

export const metadata: Metadata = { title: "Session Complete" };

export default async function SessionCompletePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sessionId = typeof params.session === "string" ? params.session : undefined;

  return (
    <main className="patient-wrap py-6 sm:py-9">
      <CompleteSummary sessionId={sessionId} />
    </main>
  );
}
