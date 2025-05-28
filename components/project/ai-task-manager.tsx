"use client"

import React, { useState } from "react"
import { CustomButton } from "@/components/ui/custom-button"
import { CustomTextarea } from "@/components/ui/custom-textarea"
import {
  CustomCard,
  CustomCardHeader,
  CustomCardContent,
  CustomCardFooter,
  CustomCardTitle,
  CustomCardDescription,
} from "@/components/ui/custom-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Zap, Plus, RefreshCw } from "lucide-react"
import { Project, Task } from "@/hooks/use-project-data"

interface AiTaskManagerProps {
  project: Project
  onTasksUpdated: (tasks: Task[]) => void
  onTasksAdded: (newTasks: Task[]) => void
}

export function AiTaskManager({ project, onTasksUpdated, onTasksAdded }: AiTaskManagerProps) {
  const [isReEditDialogOpen, setIsReEditDialogOpen] = useState(false)
  const [isAddTasksDialogOpen, setIsAddTasksDialogOpen] = useState(false)
  const [reEditPrompt, setReEditPrompt] = useState("")
  const [addTasksPrompt, setAddTasksPrompt] = useState("")
  const [isReEditing, setIsReEditing] = useState(false)
  const [isAddingTasks, setIsAddingTasks] = useState(false)
  const [error, setError] = useState("")

  const handleReEditTasks = async () => {
    if (!reEditPrompt.trim()) {
      setError("Please provide instructions for how to modify the tasks")
      return
    }

    setError("")
    setIsReEditing(true)

    try {
      const response = await fetch("/api/projects/ai-reedit-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project.id,
          projectName: project.name,
          projectDescription: project.description,
          currentTasks: project.tasks,
          reEditPrompt: reEditPrompt,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to re-edit tasks with AI")
      }

      const data = await response.json()
      onTasksUpdated(data.tasks)
      setIsReEditDialogOpen(false)
      setReEditPrompt("")
    } catch (error) {
      console.error("Error re-editing tasks:", error)
      setError(error instanceof Error ? error.message : "Failed to re-edit tasks. Please try again.")
    } finally {
      setIsReEditing(false)
    }
  }

  const handleAddNewTasks = async () => {
    if (!addTasksPrompt.trim()) {
      setError("Please describe what new tasks you need")
      return
    }

    setError("")
    setIsAddingTasks(true)

    try {
      const response = await fetch("/api/projects/ai-add-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project.id,
          projectName: project.name,
          projectDescription: project.description,
          currentTasks: project.tasks,
          addTasksPrompt: addTasksPrompt,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add new tasks with AI")
      }

      const data = await response.json()
      onTasksAdded(data.newTasks)
      setIsAddTasksDialogOpen(false)
      setAddTasksPrompt("")
    } catch (error) {
      console.error("Error adding new tasks:", error)
      setError(error instanceof Error ? error.message : "Failed to add new tasks. Please try again.")
    } finally {
      setIsAddingTasks(false)
    }
  }

  return (
    <div className="flex gap-2">
      {/* Re-edit Tasks Dialog */}
      <Dialog open={isReEditDialogOpen} onOpenChange={setIsReEditDialogOpen}>
        <DialogTrigger asChild>
          <CustomButton
            variant="outline"
            size="sm"
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Re-edit Tasks with AI
          </CustomButton>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Re-edit Tasks with AI</DialogTitle>
          </DialogHeader>
          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle>Modify Existing Tasks</CustomCardTitle>
              <CustomCardDescription>
                Describe how you want to modify your current tasks. AI will update them while preserving their structure and progress.
              </CustomCardDescription>
            </CustomCardHeader>
            <CustomCardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Current Project: {project.name}</h4>
                <p className="text-blue-700 text-sm mb-2">{project.description}</p>
                <p className="text-blue-600 text-sm">
                  You have {project.tasks.length} existing tasks that will be modified based on your instructions.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modification Instructions
                </label>
                <CustomTextarea
                  placeholder="Example: 'Add more detail to each task', 'Break down complex tasks into smaller steps', 'Add time estimates', 'Reorganize tasks by priority', etc."
                  value={reEditPrompt}
                  onChange={(e) => setReEditPrompt(e.target.value)}
                  className="min-h-[120px]"
                  fullWidth
                />
                <p className="mt-1 text-sm text-gray-500">
                  Be specific about what changes you want. AI will preserve task completion status and existing subtasks.
                </p>
              </div>
            </CustomCardContent>
            <CustomCardFooter className="flex justify-end gap-2">
              <CustomButton
                variant="outline"
                onClick={() => setIsReEditDialogOpen(false)}
                disabled={isReEditing}
              >
                Cancel
              </CustomButton>
              <CustomButton
                onClick={handleReEditTasks}
                disabled={isReEditing || !reEditPrompt.trim()}
                icon={isReEditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              >
                {isReEditing ? "Re-editing..." : "Re-edit Tasks"}
              </CustomButton>
            </CustomCardFooter>
          </CustomCard>
        </DialogContent>
      </Dialog>

      {/* Add New Tasks Dialog */}
      <Dialog open={isAddTasksDialogOpen} onOpenChange={setIsAddTasksDialogOpen}>
        <DialogTrigger asChild>
          <CustomButton
            variant="outline"
            size="sm"
            icon={<Zap className="h-4 w-4" />}
          >
            Add Tasks with AI
          </CustomButton>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Tasks with AI</DialogTitle>
          </DialogHeader>
          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle>Generate Additional Tasks</CustomCardTitle>
              <CustomCardDescription>
                Describe what new tasks you need. AI will generate them based on your project context and existing tasks.
              </CustomCardDescription>
            </CustomCardHeader>
            <CustomCardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Current Project: {project.name}</h4>
                <p className="text-green-700 text-sm mb-2">{project.description}</p>
                <p className="text-green-600 text-sm">
                  You have {project.tasks.length} existing tasks. New tasks will be added to complement your current workflow.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Tasks Description
                </label>
                <CustomTextarea
                  placeholder="Example: 'Add testing tasks for each feature', 'Create documentation tasks', 'Add deployment and monitoring tasks', 'Include code review steps', etc."
                  value={addTasksPrompt}
                  onChange={(e) => setAddTasksPrompt(e.target.value)}
                  className="min-h-[120px]"
                  fullWidth
                />
                <p className="mt-1 text-sm text-gray-500">
                  Describe what additional tasks you need. AI will create tasks that complement your existing ones.
                </p>
              </div>
            </CustomCardContent>
            <CustomCardFooter className="flex justify-end gap-2">
              <CustomButton
                variant="outline"
                onClick={() => setIsAddTasksDialogOpen(false)}
                disabled={isAddingTasks}
              >
                Cancel
              </CustomButton>
              <CustomButton
                onClick={handleAddNewTasks}
                disabled={isAddingTasks || !addTasksPrompt.trim()}
                icon={isAddingTasks ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              >
                {isAddingTasks ? "Adding Tasks..." : "Add Tasks"}
              </CustomButton>
            </CustomCardFooter>
          </CustomCard>
        </DialogContent>
      </Dialog>
    </div>
  )
}
