"use client"

interface ProgressProps {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  className?: string
}

export function CustomProgress({ value, max = 100, size = "md", showValue = false, className = "" }: ProgressProps) {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100)

  const sizeStyles = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        <div className={`overflow-hidden rounded-full bg-gray-200 ${sizeStyles[size]}`}>
          <div
            className="rounded-full bg-blue-600 transition-all duration-300 ease-in-out"
            style={{ width: `${percentage}%`, height: "100%" }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>
        {showValue && <span className="absolute right-0 -top-6 text-sm text-gray-700">{Math.round(percentage)}%</span>}
      </div>
    </div>
  )
}
