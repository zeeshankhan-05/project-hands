import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";

export default function ClinicianLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <AppHeader area="Research progress view" homeHref="/clinician" />
      {children}
    </div>
  );
}
