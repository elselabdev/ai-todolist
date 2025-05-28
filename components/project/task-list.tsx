"use client"

import React from "react"
import { Plus } from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { TaskItem } from "./task-item"
import { AiTaskManager } from "./ai-task-manager"
import { Task, Project } from "@/hooks/use-project-data"

interface TaskListProps {
  project: Project
  tasks: Task[]
  liveTimers: { [taskId: string]: number }
  timeTrackingLoading: string | null
  formatTimeSpent: (seconds: number) => string
  onAddTask: () => void
  onDragEnd: (result: any) => Promise<void>
  onToggleTaskCompletion: (taskId: string) => Promise<void>
  onEditTask: (taskId: string, newTask: string) => Promise<void>
  onEditTaskDialog: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onStartTimeTracking: (taskId: string) => Promise<void>
  onStopTimeTracking: (taskId: string) => Promise<void>
  onToggleSubtaskCompletion: (taskId: string, subtaskId: string) => Promise<void>
  onEditSubtask: (taskId: string, subtaskId: string, newTask: string) => Promise<void>
  onDeleteSubtask: (taskId: string, subtaskId: string) => Promise<void>
  onAddSubtask: (taskId: string, subtaskText: string) => Promise<void>
  onStateOnlyDeleteSubtask?: (taskId: string, subtaskId: string) => void
  onTasksAdded: (newTasks: Task[]) => void
}

export function TaskList({
  project,
  tasks,
  liveTimers,
  timeTrackingLoading,
  formatTimeSpent,
  onAddTask,
  onDragEnd,
  onToggleTaskCompletion,
  onEditTask,
  onEditTaskDialog,
  onDeleteTask,
  onStartTimeTracking,
  onStopTimeTracking,
  onToggleSubtaskCompletion,
  onEditSubtask,
  onDeleteSubtask,
  onAddSubtask,
  onStateOnlyDeleteSubtask,
  onTasksAdded,
}: TaskListProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
        <div className="flex gap-2">
          <AiTaskManager
            project={project}
            onTasksAdded={onTasksAdded}
          />
          <CustomButton
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={onAddTask}
          >
            Add Task
          </CustomButton>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-6"
            >
              {tasks.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-500">No tasks found for this project.</p>
                </div>
              ) : (
                tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`${snapshot.isDragging ? "opacity-50" : ""}`}
                      >
                        <TaskItem
                          task={task}
                          projectId={project.id}
                          liveTimer={liveTimers[task.id]}
                          timeTrackingLoading={timeTrackingLoading}
                          formatTimeSpent={formatTimeSpent}
                          onToggleCompletion={onToggleTaskCompletion}
                          onEdit={onEditTask}
                          onEditDialog={onEditTaskDialog}
                          onDelete={onDeleteTask}
                          onStartTimeTracking={onStartTimeTracking}
                          onStopTimeTracking={onStopTimeTracking}
                          onToggleSubtaskCompletion={onToggleSubtaskCompletion}
                          onEditSubtask={onEditSubtask}
                          onDeleteSubtask={onDeleteSubtask}
                          onAddSubtask={onAddSubtask}
                          onStateOnlyDeleteSubtask={onStateOnlyDeleteSubtask}
                        />
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
    </>
  )
}
