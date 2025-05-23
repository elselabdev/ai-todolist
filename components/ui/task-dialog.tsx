import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog"
import { Input } from "./input"
import { Textarea } from "./textarea"
import { CustomButton } from "./custom-button"
import { Loader2 } from "lucide-react"

interface TaskDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { task: string; description?: string; dueDate?: string; dueTime?: string }) => Promise<void>
  initialData?: {
    task: string
    description?: string
    dueDate?: string | null
    dueTime?: string | null
  }
  mode: "add" | "edit"
  isLoading?: boolean
}

export function TaskDialog({ isOpen, onClose, onSubmit, initialData, mode, isLoading }: TaskDialogProps) {
  const [task, setTask] = React.useState(initialData?.task || "")
  const [description, setDescription] = React.useState(initialData?.description || "")
  const [dueDate, setDueDate] = React.useState(initialData?.dueDate || "")
  const [dueTime, setDueTime] = React.useState(initialData?.dueTime || "")
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    if (isOpen) {
      setTask(initialData?.task || "")
      setDescription(initialData?.description || "")
      setDueDate(initialData?.dueDate || "")
      setDueTime(initialData?.dueTime || "")
      setError("")
    }
  }, [isOpen, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!task.trim()) {
      setError("Task name is required")
      return
    }

    try {
      await onSubmit({ 
        task: task.trim(), 
        description: description.trim(),
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined
      })
      onClose()
    } catch (err) {
      setError("Failed to save task. Please try again.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Task" : "Edit Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="task" className="text-sm font-medium text-gray-700">
                Task Name
              </label>
              <Input
                id="task"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Enter task name"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description (optional)
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                  Due Date (optional)
                </label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="dueTime" className="text-sm font-medium text-gray-700">
                  Due Time (optional)
                </label>
                <Input
                  id="dueTime"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <CustomButton type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </CustomButton>
            <CustomButton type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "add" ? "Adding..." : "Saving..."}
                </>
              ) : mode === "add" ? (
                "Add Task"
              ) : (
                "Save Changes"
              )}
            </CustomButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
