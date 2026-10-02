import type { Metadata } from "next";
import { SessionExperience } from "@/components/patient/session-experience";
import { DEMO_PARTICIPANT_ID } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Today's Session" };

export default function SessionPage() {
  return (
    <main className="patient-wrap py-5 sm:py-7">
      <SessionExperience participantId={DEMO_PARTICIPANT_ID} />
    </main>
  );
}
