import React, { useState } from "react"
import { Input } from "./input"
import { Plus, X } from "lucide-react"

interface SubtaskInputProps {
  onAdd: (task: string) => Promise<void>
}

export function SubtaskInput({ onAdd }: SubtaskInputProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [value, setValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isFormOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isFormOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return

    setIsLoading(true)
    try {
      await onAdd(value.trim())
      setValue("")
      setIsFormOpen(false)
    } catch (error) {
      console.error("Failed to add subtask:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isFormOpen) {
    return (
      <button
        onClick={() => setIsFormOpen(true)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
      >
        <Plus className="h-4 w-4" />
        Add more subtasks
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a subtask..."
        disabled={isLoading}
        className="py-1 h-8"
      />
      <div className="flex items-center gap-1">
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="p-1.5 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 text-green-600" />
        </button>
        <button
          type="button"
          onClick={() => {
            setIsFormOpen(false)
            setValue("")
          }}
          className="p-1.5 hover:bg-gray-100 rounded-full"
        >
          <X className="h-4 w-4 text-red-600" />
        </button>
      </div>
    </form>
  )
} 