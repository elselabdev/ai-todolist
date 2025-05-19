"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CustomButton } from "@/components/ui/custom-button"
import { CustomCard, CustomCardHeader, CustomCardTitle, CustomCardDescription } from "@/components/ui/custom-card"
import { CustomProgress } from "@/components/ui/custom-progress"
import { Loader2, ArrowLeft, Trash2, CheckCircle, Circle, Play, Pause, Clock } from "lucide-react"

interface SubTask {
  id: string
  task: string
  completed: boolean
}

interface Task {
  id: string
  task: string
  subtasks: SubTask[]
  completed: boolean
  timeSpent?: number
  timeTrackingStarted?: string | null
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

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const unwrappedParams = React.use(params as any) as { id: string }
  const { id } = unwrappedParams
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [timeTrackingLoading, setTimeTrackingLoading] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`)

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
  }, [id])

  const calculateProgress = (): number => {
    if (!project || !project.tasks.length) return 0

    const totalItems = project.tasks.length + project.tasks.reduce((acc, task) => acc + task.subtasks.length, 0)
    const completedItems =
      project.tasks.filter((task) => task.completed).length +
      project.tasks.reduce((acc, task) => acc + task.subtasks.filter((subtask) => subtask.completed).length, 0)

    return Math.round((completedItems / totalItems) * 100)
  }

  const toggleTaskCompletion = async (taskId: string) => {
    if (!project) return

    const updatedTasks = project.tasks.map((task) => {
      if (task.id === taskId) {
        const newCompletedState = !task.completed
        return {
          ...task,
          completed: newCompletedState,
          subtasks: task.subtasks.map((subtask) => ({
            ...subtask,
            completed: newCompletedState ? true : subtask.completed,
          })),
        }
      }
      return task
    })

    setProject({
      ...project,
      tasks: updatedTasks,
    })

    try {
      await fetch(`/api/projects/${id}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: updatedTasks.find((t) => t.id === taskId)?.completed,
        }),
      })
    } catch (error) {
      console.error("Error updating task:", error)
      // Revert changes on error
      setProject(project)
    }
  }

  const toggleSubtaskCompletion = async (taskId: string, subtaskId: string) => {
    if (!project) return

    const updatedTasks = project.tasks.map((task) => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map((subtask) => {
          if (subtask.id === subtaskId) {
            return { ...subtask, completed: !subtask.completed }
          }
          return subtask
        })

        const allSubtasksCompleted = updatedSubtasks.every((subtask) => subtask.completed)

        return {
          ...task,
          subtasks: updatedSubtasks,
          completed: allSubtasksCompleted,
        }
      }
      return task
    })

    setProject({
      ...project,
      tasks: updatedTasks,
    })

    try {
      await fetch(`/api/projects/${id}/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: updatedTasks.find((t) => t.id === taskId)?.subtasks.find((s) => s.id === subtaskId)?.completed,
        }),
      })
    } catch (error) {
      console.error("Error updating subtask:", error)
      // Revert changes on error
      setProject(project)
    }
  }

  const handleDeleteProject = async () => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete project")
      }

      router.push("/projects")
    } catch (error) {
      console.error("Error deleting project:", error)
      setError("Failed to delete project. Please try again.")
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const startTimeTracking = async (taskId: string) => {
    if (!project) return

    setTimeTrackingLoading(taskId)

    try {
      const response = await fetch(`/api/projects/${id}/tasks/${taskId}/time-tracking`, {
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

      setProject({
        ...project,
        tasks: updatedTasks,
      })
    } catch (error) {
      console.error("Error starting time tracking:", error)
    } finally {
      setTimeTrackingLoading(null)
    }
  }

  const stopTimeTracking = async (taskId: string) => {
    if (!project) return

    setTimeTrackingLoading(taskId)

    try {
      const response = await fetch(`/api/projects/${id}/tasks/${taskId}/time-tracking`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to stop time tracking")
      }

      const data = await response.json()

      // Update the task in the local state
      const updatedTasks = project.tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            timeTrackingStarted: null,
            timeSpent: data.timeSpent,
          }
        }
        return task
      })

      setProject({
        ...project,
        tasks: updatedTasks,
        timeSpent: (project.timeSpent || 0) + data.sessionTime,
      })
    } catch (error) {
      console.error("Error stopping time tracking:", error)
    } finally {
      setTimeTrackingLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading project...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="mb-4">
          <CustomButton href="/projects" variant="outline" icon={<ArrowLeft className="h-5 w-5" />}>
            Back to Projects
          </CustomButton>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div>
        <div className="mb-4">
          <CustomButton href="/projects" variant="outline" icon={<ArrowLeft className="h-5 w-5" />}>
            Back to Projects
          </CustomButton>
        </div>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-1">Project not found</h3>
          <p className="text-gray-500">The project you're looking for doesn't exist or has been deleted.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="mb-4">
            <CustomButton href="/projects" variant="outline" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
              Back to Projects
            </CustomButton>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span className="mr-4">Created: {formatDate(project.createdAt)}</span>
            <span>Last updated: {formatDate(project.updatedAt)}</span>
          </div>
        </div>
        <CustomButton
          variant="danger"
          icon={<Trash2 className="h-5 w-5" />}
          onClick={handleDeleteProject}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete Project"}
        </CustomButton>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>Project Progress</CustomCardTitle>
            <CustomCardDescription>{calculateProgress()}% completed</CustomCardDescription>
            <div className="mt-2">
              <CustomProgress value={calculateProgress()} size="lg" showValue />
            </div>
          </CustomCardHeader>
        </CustomCard>

        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>Time Spent</CustomCardTitle>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span>{formatTimeSpent(project.timeSpent || 0)}</span>
            </div>
          </CustomCardHeader>
        </CustomCard>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>

        {project.tasks.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No tasks found for this project.</p>
          </div>
        ) : (
          project.tasks.map((task) => (
            <CustomCard key={task.id} className="overflow-hidden">
              <div className={`p-4 ${task.completed ? "bg-green-50" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-1 cursor-pointer" onClick={() => toggleTaskCompletion(task.id)}>
                    {task.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3
                        className={`text-lg font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900"} cursor-pointer`}
                        onClick={() => toggleTaskCompletion(task.id)}
                      >
                        {task.task}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {task.timeSpent !== undefined && task.timeSpent > 0 && (
                          <div className="flex items-center text-sm text-gray-500 mr-2">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{formatTimeSpent(task.timeSpent)}</span>
                          </div>
                        )}
                        {!task.completed &&
                          (timeTrackingLoading === task.id ? (
                            <div className="flex items-center justify-center w-8 h-8">
                              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            </div>
                          ) : task.timeTrackingStarted ? (
                            <button
                              className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                              onClick={(e) => {
                                e.stopPropagation()
                                stopTimeTracking(task.id)
                              }}
                              title="Stop time tracking"
                            >
                              <Pause className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                              onClick={(e) => {
                                e.stopPropagation()
                                startTimeTracking(task.id)
                              }}
                              title="Start time tracking"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          ))}
                      </div>
                    </div>

                    {task.subtasks.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {task.subtasks.map((subtask) => (
                          <div
                            key={subtask.id}
                            className={`flex items-start gap-3 p-2 rounded-md cursor-pointer ${subtask.completed ? "bg-green-50" : "hover:bg-gray-50"}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleSubtaskCompletion(task.id, subtask.id)
                            }}
                          >
                            <div className="mt-0.5">
                              {subtask.completed ? (
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              )}
                            </div>
                            <p
                              className={`text-base ${subtask.completed ? "line-through text-gray-500" : "text-gray-700"}`}
                            >
                              {subtask.task}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CustomCard>
          ))
        )}
      </div>
    </div>
  )
}
