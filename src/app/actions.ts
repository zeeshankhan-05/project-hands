"use server";

import { revalidatePath } from "next/cache";
import { saveSession } from "@/lib/database";
import type { SaveSessionResult } from "@/lib/types";
import { validateSessionSubmission } from "@/lib/validation";

export async function saveSessionAction(
  input: unknown,
): Promise<SaveSessionResult> {
  const submission = validateSessionSubmission(input);
  const result = await saveSession(submission);
  revalidatePath("/patient");
  revalidatePath("/clinician");
  revalidatePath(`/clinician/participants/${submission.participantId}`);
  return result;
}
