import type { JobListEntry } from "@/types"

const AI_LABEL_PREFIXES = ["com.dancinglobsters.", "com.moonshots."]

export function isAiJob(job: JobListEntry): boolean {
  if (job.source !== "UserAgent") {
    return false
  }
  return AI_LABEL_PREFIXES.some((prefix) => job.label.startsWith(prefix))
}

