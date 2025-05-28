"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { CustomButton } from "@/components/ui/custom-button"
import { Loader2, ArrowLeft } from "lucide-react"
import { TaskDialog } from "@/components/ui/task-dialog"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { ProjectHeader } from "@/components/project/project-header"
import { ProjectStats } from "@/components/project/project-stats"
import { TaskList } from "@/components/project/task-list"
import { useProjectData } from "@/hooks/use-project-data"
import { useTimeTracking } from "@/hooks/use-time-tracking"
import { useTaskOperations } from "@/hooks/use-task-operations"

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const unwrappedParams = React.use(params as any) as { id: string }
  const { id } = unwrappedParams
  const router = useRouter()

  // Project data hook
  const { project, setProject, isLoading, error, setError, calculateProgress } = useProjectData(id)

  // Time tracking hook
  const { timeTrackingLoading, liveTimers, formatTimeSpent, startTimeTracking, stopTimeTracking } = useTimeTracking(project, id)

  // Task operations hook
  const {
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
  } = useTaskOperations(id)

  // Local state for modals and UI
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTaskModalOpen, setDeleteTaskModalOpen] = useState(false)
  const [deleteSubtaskModalOpen, setDeleteSubtaskModalOpen] = useState(false)

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

  const openEditTaskDialog = (task: any) => {
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

  // Wrapper functions to pass setProject to hooks
  const wrappedToggleTaskCompletion = async (taskId: string) => {
    await toggleTaskCompletion(taskId, project, setProject)
  }

  const wrappedToggleSubtaskCompletion = async (taskId: string, subtaskId: string) => {
    await toggleSubtaskCompletion(taskId, subtaskId, project, setProject)
  }

  const wrappedHandleAddTask = async (data: { task: string; description?: string }) => {
    await handleAddTask(data, setProject)
  }

  const wrappedHandleTaskInlineEdit = async (taskId: string, newTask: string) => {
    await handleTaskInlineEdit(taskId, newTask, project, setProject)
  }

  const wrappedHandleTaskDialogEdit = async (data: { task: string; description?: string }) => {
    await handleTaskDialogEdit(data, setProject)
  }

  const wrappedHandleSubtaskEdit = async (taskId: string, subtaskId: string, newTask: string) => {
    await handleSubtaskEdit(taskId, subtaskId, newTask, project, setProject)
  }

  const wrappedHandleAddSubtask = async (taskId: string, subtaskText: string) => {
    await handleAddSubtask(taskId, subtaskText, project, setProject)
  }

  const wrappedStartTimeTracking = async (taskId: string) => {
    await startTimeTracking(taskId, setProject)
  }

  const wrappedStopTimeTracking = async (taskId: string) => {
    await stopTimeTracking(taskId, setProject)
  }

  const wrappedConfirmDeleteTask = async () => {
    await confirmDeleteTask(setProject)
    setDeleteTaskModalOpen(false)
    setSelectedTaskForDelete(null)
  }

  const wrappedConfirmDeleteSubtask = async () => {
    await confirmDeleteSubtask(setProject)
    setDeleteSubtaskModalOpen(false)
    setSelectedTaskForDelete(null)
  }

  const wrappedHandleDragEnd = async (result: any) => {
    await handleDragEnd(result, project, setProject)
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
      <ProjectHeader
        project={project}
        isDeleting={isDeleting}
        onDeleteProject={() => setDeleteModalOpen(true)}
      />

      <ProjectStats
        project={project}
        progress={calculateProgress()}
        formatTimeSpent={formatTimeSpent}
      />

      <TaskList
        tasks={project.tasks}
        liveTimers={liveTimers}
        timeTrackingLoading={timeTrackingLoading}
        formatTimeSpent={formatTimeSpent}
        onAddTask={() => {
          setSelectedTask(null)
          setIsTaskDialogOpen(true)
        }}
        onDragEnd={wrappedHandleDragEnd}
        onToggleTaskCompletion={wrappedToggleTaskCompletion}
        onEditTask={wrappedHandleTaskInlineEdit}
        onEditTaskDialog={openEditTaskDialog}
        onDeleteTask={handleDeleteTask}
        onStartTimeTracking={wrappedStartTimeTracking}
        onStopTimeTracking={wrappedStopTimeTracking}
        onToggleSubtaskCompletion={wrappedToggleSubtaskCompletion}
        onEditSubtask={wrappedHandleSubtaskEdit}
        onDeleteSubtask={handleDeleteSubtask}
        onAddSubtask={wrappedHandleAddSubtask}
      />

      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => {
          setIsTaskDialogOpen(false)
          setSelectedTask(null)
        }}
        onSubmit={selectedTask ? wrappedHandleTaskDialogEdit : wrappedHandleAddTask}
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
        onConfirm={wrappedConfirmDeleteTask}
        title="Delete Task"
        description="Are you sure you want to delete this task? This will also delete all its subtasks."
        confirmText="Delete Task"
        variant="danger"
      />

      <ConfirmModal
        isOpen={deleteSubtaskModalOpen}
        onClose={() => setDeleteSubtaskModalOpen(false)}
        onConfirm={wrappedConfirmDeleteSubtask}
        title="Delete Subtask"
        description="Are you sure you want to delete this subtask?"
        confirmText="Delete Subtask"
        variant="danger"
      />
    </div>
  )
}
