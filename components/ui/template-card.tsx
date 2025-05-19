import React from "react"
import { CustomCard } from "./custom-card"
import * as Icons from "lucide-react"
import { ProjectTemplate } from "@/lib/templates"

interface TemplateCardProps {
  template: ProjectTemplate
  onClick: () => void
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  const Icon = Icons[template.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>

  return (
    <div
      className="cursor-pointer group"
      onClick={onClick}
    >
      <CustomCard className="transition-all group-hover:border-blue-500 group-hover:shadow-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {Icon && (
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <h3 className="text-xl font-semibold text-gray-900">{template.title}</h3>
          </div>
          <p className="text-gray-600">{template.description}</p>
          <div className="mt-4">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
            </span>
          </div>
        </div>
      </CustomCard>
    </div>
  )
} 