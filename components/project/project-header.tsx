"use client"

import React from "react"
import { CustomButton } from "@/components/ui/custom-button"
import { ArrowLeft, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/date-utils"
import { Project } from "@/hooks/use-project-data"

interface ProjectHeaderProps {
  project: Project
  isDeleting: boolean
  onDeleteProject: () => void
}

export function ProjectHeader({ project, isDeleting, onDeleteProject }: ProjectHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        <div className="mb-4">
          <CustomButton href="/projects" variant="outline" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Projects
          </CustomButton>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <span className="mr-4">Created: {formatDate(project.createdAt)}</span>
          <span>Last updated: {formatDate(project.updatedAt)}</span>
        </div>
      </div>
      <CustomButton
        variant="danger"
        icon={<Trash2 className="h-5 w-5" />}
        onClick={onDeleteProject}
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete Project"}
      </CustomButton>
    </div>
  )
}
