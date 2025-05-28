"use client"

import React from "react"
import { CheckCircle, Circle } from "lucide-react"
import { InlineEdit } from "@/components/ui/inline-edit"
import { TaskContextMenu } from "@/components/ui/task-context-menu"
import { SubTask } from "@/hooks/use-project-data"

interface SubtaskItemProps {
  subtask: SubTask
  taskId: string
  projectId: string
  onToggleCompletion: (taskId: string, subtaskId: string) => Promise<void>
  onEdit: (taskId: string, subtaskId: string, newTask: string) => Promise<void>
  onDelete: (taskId: string, subtaskId: string) => Promise<void>
  onStateOnlyDelete?: (taskId: string, subtaskId: string) => void
}

export function SubtaskItem({ 
  subtask, 
  taskId, 
  projectId,
  onToggleCompletion, 
  onEdit, 
  onDelete,
  onStateOnlyDelete
}: SubtaskItemProps) {
  const handleDirectDelete = async () => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/tasks/${taskId}/subtasks/${subtask.id}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        // If it's a 404, the subtask might already be deleted, so don't throw an error
        if (response.status === 404) {
          console.warn("Subtask already deleted or not found")
        } else {
          throw new Error(`Failed to delete subtask: ${response.status}`)
        }
      }

      // Use state-only delete if available, otherwise fall back to page reload
      if (onStateOnlyDelete) {
        onStateOnlyDelete(taskId, subtask.id)
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error("Error deleting subtask:", error)
      // Don't re-throw the error to prevent showing error messages for successful deletions
    }
  }

  return (
    <TaskContextMenu onDelete={handleDirectDelete}>
      <div
        className={`flex items-start gap-3 p-2 rounded-md ${
          subtask.completed ? "bg-green-50" : "hover:bg-gray-50"
        }`}
      >
        <button
          className="mt-0.5 flex-shrink-0"
          onClick={() => onToggleCompletion(taskId, subtask.id)}
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
            onSave={(newValue) => onEdit(taskId, subtask.id, newValue)}
            className={`text-base ${
              subtask.completed ? "line-through text-gray-500" : "text-gray-700"
            }`}
          />
        </div>
      </div>
    </TaskContextMenu>
  )
}
