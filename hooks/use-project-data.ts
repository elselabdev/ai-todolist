"use client"

import { useState, useEffect } from "react"

interface SubTask {
  id: string
  task: string
  completed: boolean
}

interface Task {
  id: string
  task: string
  description?: string
  subtasks: SubTask[]
  completed: boolean
  timeSpent?: number
  timeTrackingStarted?: string | null
  position: number
  dueDate?: string | null
  dueTime?: string | null
}

interface Project {
  id: string
  name: string
  description: string
  tasks: Task[]
  timeSpent?: number
  createdAt: string
  updatedAt: string
}

export function useProjectData(projectId: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch project")
        }

        const data = await response.json()
        setProject(data.project)
      } catch (error) {
        console.error("Error fetching project:", error)
        setError("Failed to load project. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  const calculateProgress = (): number => {
    if (!project || !project.tasks.length) return 0

    const totalItems = project.tasks.length + project.tasks.reduce((acc, task) => acc + task.subtasks.length, 0)
    const completedItems =
      project.tasks.filter((task) => task.completed).length +
      project.tasks.reduce((acc, task) => acc + task.subtasks.filter((subtask) => subtask.completed).length, 0)

    return Math.round((completedItems / totalItems) * 100)
  }

  return {
    project,
    setProject,
    isLoading,
    error,
    setError,
    calculateProgress,
  }
}

export type { Project, Task, SubTask }
