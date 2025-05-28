"use client"

import { useState, useEffect } from "react"
import { Project, Task } from "./use-project-data"

export function useTimeTracking(project: Project | null, projectId: string) {
  const [timeTrackingLoading, setTimeTrackingLoading] = useState<string | null>(null)
  const [liveTimers, setLiveTimers] = useState<{ [taskId: string]: number }>({})
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}m ${remainingSeconds}s`
    }
    const hours = Math.floor(seconds / 3600)
    const remainingMinutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`
  }

  const startTimeTracking = async (taskId: string, setProject: (updater: (prev: Project | null) => Project | null) => void) => {
    if (!project) return

    setTimeTrackingLoading(taskId)

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}/time-tracking`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to start time tracking")
      }

      const data = await response.json()

      // Update the task in the local state
      const updatedTasks = project.tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            timeTrackingStarted: data.timeTrackingStarted,
          }
        }
        return task
      })

      setProject((prev) => prev ? {
        ...prev,
        tasks: updatedTasks,
      } : null)
    } catch (error) {
      console.error("Error starting time tracking:", error)
    } finally {
      setTimeTrackingLoading(null)
    }
  }

  const stopTimeTracking = async (taskId: string, setProject: (updater: (prev: Project | null) => Project | null) => void) => {
    if (!project) return

    setTimeTrackingLoading(taskId)

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}/time-tracking`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to stop time tracking")
      }

      const data = await response.json()

      // Update the task in the local state
      const updatedTasks = project.tasks.map((task) => {
        if (task.id === taskId) {
          // Remove from live timers
          const newLiveTimers = { ...liveTimers }
          delete newLiveTimers[taskId]
          setLiveTimers(newLiveTimers)

          return {
            ...task,
            timeTrackingStarted: null,
            timeSpent: data.timeSpent,
          }
        }
        return task
      })

      setProject((prev) => prev ? {
        ...prev,
        tasks: updatedTasks,
        timeSpent: (prev.timeSpent || 0) + data.sessionTime,
      } : null)
    } catch (error) {
      console.error("Error stopping time tracking:", error)
    } finally {
      setTimeTrackingLoading(null)
    }
  }

  // Update live timers every second
  useEffect(() => {
    if (!project) return

    // Initialize timers for tasks that are currently being tracked
    const initialTimers: { [taskId: string]: number } = {}
    project.tasks.forEach(task => {
      if (task.timeTrackingStarted) {
        const startTime = new Date(task.timeTrackingStarted).getTime()
        const initialSeconds = Math.floor((task.timeSpent || 0) + (Date.now() - startTime) / 1000)
        initialTimers[task.id] = initialSeconds
      }
    })
    setLiveTimers(initialTimers)

    // Set up interval to update timers
    const interval = setInterval(() => {
      setLiveTimers(prev => {
        const newTimers = { ...prev }
        project.tasks.forEach(task => {
          if (task.timeTrackingStarted) {
            const startTime = new Date(task.timeTrackingStarted).getTime()
            newTimers[task.id] = Math.floor((task.timeSpent || 0) + (Date.now() - startTime) / 1000)
          }
        })
        return newTimers
      })
    }, 1000)

    setTimerInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [project])

  return {
    timeTrackingLoading,
    liveTimers,
    formatTimeSpent,
    startTimeTracking,
    stopTimeTracking,
  }
}
