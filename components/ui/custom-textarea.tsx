"use client"

import type React from "react"
import { forwardRef } from "react"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  fullWidth?: boolean
  className?: string
}

export const CustomTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, fullWidth = false, className = "", ...props }, ref) => {
    const textareaBaseStyles =
      "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
    const errorStyles = error ? "border-red-500 focus:ring-red-500" : ""
    const widthStyle = fullWidth ? "w-full" : ""

    return (
      <div className={`${widthStyle} ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={props.id}>
            {label}
          </label>
        )}
        <textarea ref={ref} className={`${textareaBaseStyles} ${errorStyles} ${widthStyle} min-h-[120px]`} {...props} />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      </div>
    )
  },
)

CustomTextarea.displayName = "CustomTextarea"
