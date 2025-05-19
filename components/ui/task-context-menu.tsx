import React, { useEffect, useRef, useState } from "react"
import { Trash2 } from "lucide-react"

interface TaskContextMenuProps {
  onDelete: () => Promise<void>
  children: React.ReactNode
}

export function TaskContextMenu({ onDelete, children }: TaskContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsOpen(true)
  }

  const handleDelete = async () => {
    try {
      await onDelete()
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  return (
    <div className="relative group" onContextMenu={handleContextMenu}>
      {children}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute z-50 min-w-[160px] bg-white rounded-md shadow-lg border border-gray-200 py-1"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
} 