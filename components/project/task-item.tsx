"use client"

import React from "react"
import { CheckCircle, Circle, Clock, Play, Pause, Edit2, Trash2, Loader2 } from "lucide-react"
import { CustomCard } from "@/components/ui/custom-card"
import { InlineEdit } from "@/components/ui/inline-edit"
import { SubtaskInput } from "@/components/ui/subtask-input"
import { SubtaskItem } from "./subtask-item"
import { Task } from "@/hooks/use-project-data"
import { formatDueDateTime, isDueSoon, isOverdue } from "@/lib/date-utils"

interface TaskItemProps {
  task: Task
  liveTimer?: number
  timeTrackingLoading: string | null
  formatTimeSpent: (seconds: number) => string
  onToggleCompletion: (taskId: string) => Promise<void>
  onEdit: (taskId: string, newTask: string) => Promise<void>
  onEditDialog: (task: Task) => void
  onDelete: (taskId: string) => void
  onStartTimeTracking: (taskId: string) => Promise<void>
  onStopTimeTracking: (taskId: string) => Promise<void>
  onToggleSubtaskCompletion: (taskId: string, subtaskId: string) => Promise<void>
  onEditSubtask: (taskId: string, subtaskId: string, newTask: string) => Promise<void>
  onDeleteSubtask: (taskId: string, subtaskId: string) => Promise<void>
  onAddSubtask: (taskId: string, subtaskText: string) => Promise<void>
}

export function TaskItem({
  task,
  liveTimer,
  timeTrackingLoading,
  formatTimeSpent,
  onToggleCompletion,
  onEdit,
  onEditDialog,
  onDelete,
  onStartTimeTracking,
  onStopTimeTracking,
  onToggleSubtaskCompletion,
  onEditSubtask,
  onDeleteSubtask,
  onAddSubtask,
}: TaskItemProps) {
  return (
    <CustomCard className="overflow-hidden">
      <div className={`p-4 ${task.completed ? "bg-green-50" : ""}`}>
        <div className="flex items-start gap-3">
          <button
            className="mt-1 flex-shrink-0"
            onClick={() => onToggleCompletion(task.id)}
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
                  onSave={(newValue) => onEdit(task.id, newValue)}
                  className={`text-lg font-medium ${
                    task.completed ? "line-through text-gray-500" : "text-gray-900"
                  }`}
                />
                {task.description && (
                  <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                )}
                {formatDueDateTime(task.dueDate, task.dueTime) && (
                  <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    task.completed 
                      ? "bg-gray-100 text-gray-500"
                      : isOverdue(task.dueDate, task.dueTime)
                      ? "bg-red-100 text-red-800"
                      : isDueSoon(task.dueDate, task.dueTime)
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    <Clock className="h-3 w-3 mr-1" />
                    {isOverdue(task.dueDate, task.dueTime) && !task.completed && "Overdue: "}
                    {formatDueDateTime(task.dueDate, task.dueTime)}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {(task.timeSpent !== undefined || liveTimer) && (
                  <div className="flex items-center text-sm text-gray-500 mr-2">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      {task.timeTrackingStarted
                        ? formatTimeSpent(liveTimer || 0)
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
                        onStopTimeTracking(task.id)
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
                        onStartTimeTracking(task.id)
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
                    onEditDialog(task)
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
                      onDelete(task.id)
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
                <SubtaskItem
                  key={subtask.id}
                  subtask={subtask}
                  taskId={task.id}
                  onToggleCompletion={onToggleSubtaskCompletion}
                  onEdit={onEditSubtask}
                  onDelete={onDeleteSubtask}
                />
              ))}
              <div className="flex items-start gap-3 p-2">
                <div className="mt-0.5 flex-shrink-0 w-5" /> {/* Spacer for alignment */}
                <div className="flex-1">
                  <SubtaskInput onAdd={(subtaskText) => onAddSubtask(task.id, subtaskText)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomCard>
  )
}
