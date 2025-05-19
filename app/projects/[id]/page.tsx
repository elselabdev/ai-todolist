"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CustomButton } from "@/components/ui/custom-button"
import { CustomCard, CustomCardHeader, CustomCardTitle, CustomCardDescription } from "@/components/ui/custom-card"
import { CustomProgress } from "@/components/ui/custom-progress"
import { Loader2, ArrowLeft, Trash2, CheckCircle, Circle, Play, Pause, Clock, Plus, Edit2 } from "lucide-react"
import { TaskDialog } from "@/components/ui/task-dialog"
import { InlineEdit } from "@/components/ui/inline-edit"
import { SubtaskInput } from "@/components/ui/subtask-input"
import { TaskContextMenu } from "@/components/ui/task-context-menu"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { ConfirmModal } from "@/components/ui/confirm-modal"

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
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskLoading, setIsTaskLoading] = useState(false)
  const router = useRouter()
  const [liveTimers, setLiveTimers] = useState<{ [taskId: string]: number }>({})
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTaskModalOpen, setDeleteTaskModalOpen] = useState(false)
  const [deleteSubtaskModalOpen, setDeleteSubtaskModalOpen] = useState(false)
  const [selectedTaskForDelete, setSelectedTaskForDelete] = useState<{ taskId: string, subtaskId?: string } | null>(null)

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

  const handleAddTask = async (data: { task: string; description?: string }) => {
    setIsTaskLoading(true)
    try {
      const response = await fetch(`/api/projects/${id}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to add task")
      }

      const newTask = await response.json()
      setProject((prev) => prev ? {
        ...prev,
        tasks: [...prev.tasks, newTask.task],
      } : null)
    } catch (error) {
      console.error("Error adding task:", error)
      throw error
    } finally {
      setIsTaskLoading(false)
    }
  }

  const handleTaskInlineEdit = async (taskId: string, newTask: string) => {
    if (!project) return

    try {
      const response = await fetch(`/api/projects/${id}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: newTask,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      const updatedTask = await response.json()
      setProject((prev) => prev ? {
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? { ...task, ...updatedTask.task } : task
        ),
      } : null)
    } catch (error) {
      console.error("Error updating task:", error)
      throw error
    }
  }

  const handleTaskDialogEdit = async (data: { task: string; description?: string }) => {
    if (!selectedTask) return

    setIsTaskLoading(true)
    try {
      const response = await fetch(`/api/projects/${id}/tasks/${selectedTask.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      const updatedTask = await response.json()
      setProject((prev) => prev ? {
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === selectedTask.id ? { ...task, ...updatedTask.task } : task
        ),
      } : null)
    } catch (error) {
      console.error("Error updating task:", error)
      throw error
    } finally {
      setIsTaskLoading(false)
    }
  }

  const handleSubtaskEdit = async (taskId: string, subtaskId: string, newTask: string) => {
    if (!project) return

    try {
      const response = await fetch(`/api/projects/${id}/tasks/${taskId}/subtasks`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subtaskId,
          task: newTask,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update subtask")
      }

      const { subtask } = await response.json()
      setProject((prev) => prev ? {
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? {
            ...task,
            subtasks: task.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, ...subtask } : st
            ),
          } : task
        ),
      } : null)
    } catch (error) {
      console.error("Error updating subtask:", error)
      throw error
    }
  }

  const handleAddSubtask = async (taskId: string, subtaskText: string) => {
    if (!project) return

    try {
      const response = await fetch(`/api/projects/${id}/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: subtaskText,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add subtask")
      }

      const { subtask } = await response.json()
      setProject((prev) => prev ? {
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? {
            ...task,
            subtasks: [...task.subtasks, subtask],
          } : task
        ),
      } : null)
    } catch (error) {
      console.error("Error adding subtask:", error)
      throw error
    }
  }

  const openEditTaskDialog = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    setSelectedTaskForDelete({ taskId })
    setDeleteTaskModalOpen(true)
  }

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    setSelectedTaskForDelete({ taskId, subtaskId })
    setDeleteSubtaskModalOpen(true)
  }

  const confirmDeleteTask = async () => {
    if (!selectedTaskForDelete?.taskId) return

    try {
      const response = await fetch(`/api/projects/${id}/tasks/${selectedTaskForDelete.taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      setProject((prev) => prev ? {
        ...prev,
        tasks: prev.tasks.filter((task) => task.id !== selectedTaskForDelete.taskId),
      } : null)
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const confirmDeleteSubtask = async () => {
    if (!selectedTaskForDelete?.taskId || !selectedTaskForDelete?.subtaskId) return

    try {
      const response = await fetch(
        `/api/projects/${id}/tasks/${selectedTaskForDelete.taskId}/subtasks/${selectedTaskForDelete.subtaskId}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        throw new Error("Failed to delete subtask")
      }

      setProject((prev) => prev ? {
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === selectedTaskForDelete.taskId
            ? {
                ...task,
                subtasks: task.subtasks.filter((st) => st.id !== selectedTaskForDelete.subtaskId),
              }
            : task
        ),
      } : null)
    } catch (error) {
      console.error("Error deleting subtask:", error)
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !project) return

    const { source, destination } = result
    if (source.index === destination.index) return

    // Reorder tasks array
    const newTasks = Array.from(project.tasks)
    const [removed] = newTasks.splice(source.index, 1)
    newTasks.splice(destination.index, 0, removed)

    // Update positions
    const updatedTasks = newTasks.map((task, index) => ({
      ...task,
      position: index + 1,
    }))

    // Optimistically update UI
    setProject((prev) => prev ? { ...prev, tasks: updatedTasks } : null)

    try {
      // Update task positions in the database
      const response = await fetch(`/api/projects/${id}/tasks/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskOrders: updatedTasks.map((task) => ({
            id: task.id,
            position: task.position,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reorder tasks")
      }
    } catch (error) {
      console.error("Error reordering tasks:", error)
      // Revert to original order on error
      setProject((prev) => prev ? { ...prev, tasks: project.tasks } : null)
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
          onClick={() => setDeleteModalOpen(true)}
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

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
        <CustomButton
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setSelectedTask(null)
            setIsTaskDialogOpen(true)
          }}
        >
          Add Task
        </CustomButton>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-6"
            >
              {project.tasks.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-500">No tasks found for this project.</p>
                </div>
              ) : (
                project.tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`${snapshot.isDragging ? "opacity-50" : ""}`}
                      >
                        <CustomCard className="overflow-hidden">
                          <div className={`p-4 ${task.completed ? "bg-green-50" : ""}`}>
                            <div className="flex items-start gap-3">
                              <button
                                className="mt-1 flex-shrink-0"
                                onClick={() => toggleTaskCompletion(task.id)}
                                title={task.completed ? "Mark as incomplete" : "Mark as complete"}
                              >
                                {task.completed ? (
                                  <CheckCircle className="h-6 w-6 text-green-500" />
                                ) : (
                                  <Circle className="h-6 w-6 text-gray-400" />
                                )}
                              </button>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <InlineEdit
                                      value={task.task}
                                      onSave={(newValue) => handleTaskInlineEdit(task.id, newValue)}
                                      className={`text-lg font-medium ${
                                        task.completed ? "line-through text-gray-500" : "text-gray-900"
                                      }`}
                                    />
                                    {task.description && (
                                      <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {(task.timeSpent !== undefined || liveTimers[task.id]) && (
                                      <div className="flex items-center text-sm text-gray-500 mr-2">
                                        <Clock className="h-4 w-4 mr-1" />
                                        <span>
                                          {task.timeTrackingStarted
                                            ? formatTimeSpent(liveTimers[task.id] || 0)
                                            : formatTimeSpent(Math.floor(task.timeSpent || 0))}
                                        </span>
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
                                    <button
                                      className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        openEditTaskDialog(task)
                                      }}
                                      title="Edit task"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                      className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (window.confirm('Are you sure you want to delete this task?')) {
                                          handleDeleteTask(task.id)
                                        }
                                      }}
                                      title="Delete task"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                  {task.subtasks.map((subtask) => (
                                    <TaskContextMenu
                                      key={subtask.id}
                                      onDelete={() => handleDeleteSubtask(task.id, subtask.id)}
                                    >
                                      <div
                                        className={`flex items-start gap-3 p-2 rounded-md ${
                                          subtask.completed ? "bg-green-50" : "hover:bg-gray-50"
                                        }`}
                                      >
                                        <button
                                          className="mt-0.5 flex-shrink-0"
                                          onClick={() => toggleSubtaskCompletion(task.id, subtask.id)}
                                          title={subtask.completed ? "Mark as incomplete" : "Mark as complete"}
                                        >
                                          {subtask.completed ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                          ) : (
                                            <Circle className="h-5 w-5 text-gray-400" />
                                          )}
                                        </button>
                                        <div className="flex-1">
                                          <InlineEdit
                                            value={subtask.task}
                                            onSave={(newValue) => handleSubtaskEdit(task.id, subtask.id, newValue)}
                                            className={`text-base ${
                                              subtask.completed ? "line-through text-gray-500" : "text-gray-700"
                                            }`}
                                          />
                                        </div>
                                      </div>
                                    </TaskContextMenu>
                                  ))}
                                  <div className="flex items-start gap-3 p-2">
                                    <div className="mt-0.5 flex-shrink-0 w-5" /> {/* Spacer for alignment */}
                                    <div className="flex-1">
                                      <SubtaskInput onAdd={(subtaskText) => handleAddSubtask(task.id, subtaskText)} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CustomCard>
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => {
          setIsTaskDialogOpen(false)
          setSelectedTask(null)
        }}
        onSubmit={selectedTask ? handleTaskDialogEdit : handleAddTask}
        initialData={selectedTask || undefined}
        mode={selectedTask ? "edit" : "add"}
        isLoading={isTaskLoading}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone and will delete all tasks and subtasks."
        confirmText="Delete Project"
        variant="danger"
      />

      <ConfirmModal
        isOpen={deleteTaskModalOpen}
        onClose={() => setDeleteTaskModalOpen(false)}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        description="Are you sure you want to delete this task? This will also delete all its subtasks."
        confirmText="Delete Task"
        variant="danger"
      />

      <ConfirmModal
        isOpen={deleteSubtaskModalOpen}
        onClose={() => setDeleteSubtaskModalOpen(false)}
        onConfirm={confirmDeleteSubtask}
        title="Delete Subtask"
        description="Are you sure you want to delete this subtask?"
        confirmText="Delete Subtask"
        variant="danger"
      />
    </div>
  )
}
