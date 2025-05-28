"use client"

import React from "react"
import { CustomCard, CustomCardHeader, CustomCardTitle, CustomCardDescription } from "@/components/ui/custom-card"
import { CustomProgress } from "@/components/ui/custom-progress"
import { Clock } from "lucide-react"
import { Project } from "@/hooks/use-project-data"

interface ProjectStatsProps {
  project: Project
  progress: number
  formatTimeSpent: (seconds: number) => string
}

export function ProjectStats({ project, progress, formatTimeSpent }: ProjectStatsProps) {
  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      <CustomCard>
        <CustomCardHeader>
          <CustomCardTitle>Project Progress</CustomCardTitle>
          <CustomCardDescription>{progress}% completed</CustomCardDescription>
          <div className="mt-2">
            <CustomProgress value={progress} size="lg" showValue />
          </div>
        </CustomCardHeader>
      </CustomCard>

      <CustomCard>
        <CustomCardHeader>
          <CustomCardTitle>Time Spent</CustomCardTitle>
          <div className="flex items-center mt-1 text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>{formatTimeSpent(project.timeSpent || 0)}</span>
          </div>
        </CustomCardHeader>
      </CustomCard>
    </div>
  )
}
