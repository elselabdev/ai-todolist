import type React from "react"

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function CustomCard({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CustomCardHeader({ children, className = "" }: CardHeaderProps) {
  return <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CustomCardContent({ children, className = "" }: CardContentProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CustomCardFooter({ children, className = "" }: CardFooterProps) {
  return <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}>{children}</div>
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

export function CustomCardTitle({ children, className = "" }: CardTitleProps) {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
}

interface CardDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function CustomCardDescription({ children, className = "" }: CardDescriptionProps) {
  return <p className={`text-sm text-gray-500 mt-1 ${className}`}>{children}</p>
}
