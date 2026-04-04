import { describe, it, expect, beforeEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { useJobs } from "./useJobs"
import { resetFakeHandlers, setFakeHandler } from "@/test-utils/tauri-mock"

beforeEach(() => {
  resetFakeHandlers()
})

describe("useJobs", () => {
  it("loads jobs on mount", async () => {
    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.jobs.length).toBe(3)
    expect(result.current.error).toBeNull()
  })

  it("filters by search term", async () => {
    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setSearch("running")
    })

    await waitFor(() => {
      expect(result.current.filteredJobs.length).toBe(1)
      expect(result.current.filteredJobs[0].label).toBe(
        "com.example.running-agent"
      )
    })
  })

  it("filters by source", async () => {
    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setSourceFilter("SystemAgent")
    })

    await waitFor(() => {
      expect(result.current.filteredJobs.length).toBe(1)
      expect(result.current.filteredJobs[0].source).toBe("SystemAgent")
    })
  })

  it("filters by AI group (dancinglobsters + moonshots prefixes)", async () => {
    setFakeHandler("list_jobs", () => [
      {
        label: "com.dancinglobsters.hermes.market-scan",
        pid: null,
        last_exit_code: 0,
        plist_path:
          "/Users/test/Library/LaunchAgents/com.dancinglobsters.hermes.market-scan.plist",
        source: "UserAgent",
        status: "Unloaded",
      },
      {
        label: "com.moonshots.firstmate",
        pid: 2121,
        last_exit_code: 0,
        plist_path: "/Users/test/Library/LaunchAgents/com.moonshots.firstmate.plist",
        source: "UserAgent",
        status: "Running",
      },
      {
        label: "com.example.random",
        pid: null,
        last_exit_code: 0,
        plist_path: "/Users/test/Library/LaunchAgents/com.example.random.plist",
        source: "UserAgent",
        status: "Unloaded",
      },
      {
        label: "com.apple.system-agent",
        pid: 100,
        last_exit_code: 0,
        plist_path: "/Library/LaunchAgents/com.apple.system-agent.plist",
        source: "SystemAgent",
        status: "Running",
      },
    ])

    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setSourceFilter("AI")
    })

    await waitFor(() => {
      expect(result.current.filteredJobs.length).toBe(2)
    })
    expect(result.current.filteredJobs.map((j) => j.label).sort()).toEqual(
      ["com.dancinglobsters.hermes.market-scan", "com.moonshots.firstmate"]
    )
  })

  it("handles error", async () => {
    setFakeHandler("list_jobs", () => {
      throw new Error("Connection failed")
    })

    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toContain("Connection failed")
    expect(result.current.jobs.length).toBe(0)
  })
})
