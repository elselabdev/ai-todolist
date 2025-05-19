"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { projectTemplates, ProjectTemplate } from "@/lib/templates"
import { CustomButton } from "@/components/ui/custom-button"
import { TemplateCard } from "@/components/ui/template-card"

export default function TemplatesPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const categories = Array.from(new Set(projectTemplates.map(t => t.category)))

  const filteredTemplates = selectedCategory
    ? projectTemplates.filter(t => t.category === selectedCategory)
    : projectTemplates

  const handleTemplateSelect = (template: ProjectTemplate) => {
    // Redirect to new project page with template data in URL parameters
    const searchParams = new URLSearchParams({
      name: template.title,
      description: template.description,
      template: template.id,
    })
    router.push(`/new-project?${searchParams.toString()}`)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Project Templates</h1>

      {/* Category Filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <CustomButton
          variant={selectedCategory === null ? "primary" : "outline"}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </CustomButton>
        {categories.map((category) => (
          <CustomButton
            key={category}
            variant={selectedCategory === category ? "primary" : "outline"}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </CustomButton>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onClick={() => handleTemplateSelect(template)}
          />
        ))}
      </div>
    </div>
  )
} 