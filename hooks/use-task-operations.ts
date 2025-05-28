"use client"

import { useState } from "react"
import { Project, Task } from "./use-project-data"

export function useTaskOperations(projectId: string) {
  const [isTaskLoading, setIsTaskLoading] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedTaskForDelete, setSelectedTaskForDelete] = useState<{ taskId: string, subtaskId?: string } | null>(null)

  const toggleTaskCompletion = async (taskId: string, project: Project | null, setProject: (updater: (prev: Project | null) => Project | null) => void) => {
    if (!project) return

    // Store the original project state for potential revert
    const originalProject = project

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

    // Preserve the original task order by sorting by position
    const sortedTasks = updatedTasks.sort((a, b) => (a.position || 0) - (b.position || 0))

    setProject((prev) => prev ? {
      ...prev,
      tasks: sortedTasks,
    } : null)

    try {
      await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
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
      setProject(() => originalProject)
    }
  }

  const toggleSubtaskCompletion = async (taskId: string, subtaskId: string, project: Project | null, setProject: (updater: (prev: Project | null) => Project | null) => void) => {
    if (!project) return

    // Store the original project state for potential revert
    const originalProject = project

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

    // Preserve the original task order by sorting by position
    const sortedTasks = updatedTasks.sort((a, b) => (a.position || 0) - (b.position || 0))

    setProject((prev) => prev ? {
      ...prev,
      tasks: sortedTasks,
    } : null)

    try {
      await fetch(`/api/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}`, {
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
      setProject(() => originalProject)
    }
  }

  const handleAddTask = async (data: { task: string; description?: string }, setProject: (updater: (prev: Project | null) => Project | null) => void) => {
    setIsTaskLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
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

  const handleTaskInlineEdit = async (taskId: string, newTask: string, project: Project | null, setProject: (updater: (prev: Project | null) => Project | null) => void) => {
    if (!project) return

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
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

  const handleTaskDialogEdit = async (data: { task: string; description?: string }, setProject: (updater: (prev: Project | null) => Project | null) => void) => {
    if (!selectedTask) return

    setIsTaskLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${selectedTask.id}`, {
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

  const handleSubtaskEdit = async (taskId: string, subtaskId: string, newTask: string, project: Project | null, setProject: (updater: (prev: Project | null) => Project | null) => void) => {
    if (!project) return

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}/subtasks`, {
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

  const handleAddSubtask = async (taskId: string, subtaskText: string, project: Project | null, setProject: (updater: (prev: Project | null) => Project | null) => void) => {
    if (!project) return

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}/subtasks`, {
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

  const confirmDeleteTask = async (setProject: (updater: (prev: Project | null) => Project | null) => void) => {
    if (!selectedTaskForDelete?.taskId) return

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${selectedTaskForDelete.taskId}`, {
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

  const confirmDeleteSubtask = async (setProject: (updater: (prev: Project | null) => Project | null) => void) => {
    if (!selectedTaskForDelete?.taskId || !selectedTaskForDelete?.subtaskId) return

    try {
      const response = await fetch(
        `/api/projects/${projectId}/tasks/${selectedTaskForDelete.taskId}/subtasks/${selectedTaskForDelete.subtaskId}`,
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

  const handleDragEnd = async (result: any, project: Project | null, setProject: (updater: (prev: Project | null) => Project | null) => void) => {
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
      const response = await fetch(`/api/projects/${projectId}/tasks/reorder`, {
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

  return {
    isTaskLoading,
    selectedTask,
    setSelectedTask,
    selectedTaskForDelete,
    setSelectedTaskForDelete,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    handleAddTask,
    handleTaskInlineEdit,
    handleTaskDialogEdit,
    handleSubtaskEdit,
    handleAddSubtask,
    confirmDeleteTask,
    confirmDeleteSubtask,
    handleDragEnd,
  }
}
