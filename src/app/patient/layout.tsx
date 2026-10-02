import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <AppHeader area="Participant experience" homeHref="/patient" />
      {children}
    </div>
  );
}
