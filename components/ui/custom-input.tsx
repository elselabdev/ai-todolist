"use client"

import type React from "react"
import { forwardRef } from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  className?: string
}

export const CustomInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, fullWidth = false, leftIcon, rightIcon, className = "", ...props }, ref) => {
    const inputBaseStyles =
      "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
    const errorStyles = error ? "border-red-500 focus:ring-red-500" : ""
    const iconPaddingLeft = leftIcon ? "pl-10" : ""
    const iconPaddingRight = rightIcon ? "pr-10" : ""
    const widthStyle = fullWidth ? "w-full" : ""

    return (
      <div className={`${widthStyle} ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={props.id}>
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`${inputBaseStyles} ${errorStyles} ${iconPaddingLeft} ${iconPaddingRight} ${widthStyle}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      </div>
    )
  },
)

CustomInput.displayName = "CustomInput"
