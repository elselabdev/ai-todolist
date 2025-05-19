import React, { useState } from "react"
import { Input } from "./input"
import { Plus } from "lucide-react"

interface SubtaskInputProps {
  onAdd: (task: string) => Promise<void>
  placeholder?: string
}

export function SubtaskInput({ onAdd, placeholder = "Add subtask..." }: SubtaskInputProps) {
  const [value, setValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return

    setIsLoading(true)
    try {
      await onAdd(value.trim())
      setValue("")
    } catch (error) {
      console.error("Failed to add subtask:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        className="py-1 h-8"
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="p-1.5 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="h-4 w-4 text-gray-600" />
      </button>
    </form>
  )
} 