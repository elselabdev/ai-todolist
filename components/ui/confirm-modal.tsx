import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog"
import { CustomButton } from "./custom-button"
import { AlertTriangle } from "lucide-react"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger"
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant === "danger" && (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600">{description}</p>
        </div>
        <DialogFooter>
          <CustomButton
            variant="outline"
            onClick={onClose}
          >
            {cancelText}
          </CustomButton>
          <CustomButton
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={handleConfirm}
          >
            {confirmText}
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 