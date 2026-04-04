import { useState, useEffect, useCallback } from "react"
import type { JobListEntry, SourceFilter } from "@/types"
import { listJobs } from "@/lib/invoke"
import { isAiJob } from "@/lib/aiFilter"

type UseJobsReturn = {
  jobs: JobListEntry[]
  filteredJobs: JobListEntry[]
  loading: boolean
  error: string | null
  search: string
  setSearch: (value: string) => void
  sourceFilter: SourceFilter
  setSourceFilter: (value: SourceFilter) => void
  refresh: () => Promise<void>
}

export function useJobs(): UseJobsReturn {
  const [jobs, setJobs] = useState<JobListEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("All")

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listJobs()
      setJobs(result)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      search === "" || job.label.toLowerCase().includes(search.toLowerCase())
    const matchesSource =
      sourceFilter === "All"
        ? true
        : sourceFilter === "AI"
          ? isAiJob(job)
          : job.source === sourceFilter
    return matchesSearch && matchesSource
  })

  return {
    jobs,
    filteredJobs,
    loading,
    error,
    search,
    setSearch,
    sourceFilter,
    setSourceFilter,
    refresh,
  }
}
