import React, { useEffect, useRef, useState } from "react"
import { Input } from "./input"
import { Check, X } from "lucide-react"

interface InlineEditProps {
  value: string
  onSave: (value: string) => Promise<void>
  onCancel?: () => void
  className?: string
  placeholder?: string
}

export function InlineEdit({ value, onSave, onCancel, className = "", placeholder }: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    setIsEditing(true)
    setEditValue(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  const handleSave = async () => {
    if (editValue.trim() === "") return
    if (editValue === value) {
      setIsEditing(false)
      return
    }

    setIsLoading(true)
    try {
      await onSave(editValue.trim())
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to save:", error)
      setEditValue(value)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(value)
    onCancel?.()
  }

  if (!isEditing) {
    return (
      <div
        className={`cursor-text ${className}`}
        onDoubleClick={handleDoubleClick}
      >
        {value || placeholder}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleCancel}
        disabled={isLoading}
        className="py-0 h-7"
      />
      <div className="flex items-center gap-1">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <Check className="h-4 w-4 text-green-600" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="h-4 w-4 text-red-600" />
        </button>
      </div>
    </div>
  )
} 