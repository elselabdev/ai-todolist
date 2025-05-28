"use client"

import React from "react"
import { CustomCard } from "@/components/ui/custom-card"
import { Tag } from "lucide-react"

interface Version {
  version: string
  date: string
  title: string
  changes: string[]
}

const versions: Version[] = [
  {
    version: "0.0.4",
    date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    title: "AI Task Management Improvements & User Preferences",
    changes: [
      "Removed problematic AI re-edit tasks feature that was causing UUID and completion status issues.",
      "Simplified AI functionality to focus only on adding new tasks, eliminating data corruption risks.",
      "Added comprehensive language support with 15 languages including English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic, Hindi, Turkish, Dutch, and Swedish.",
      "Implemented AI model selection allowing users to choose between GPT-4o, GPT-4o Mini, GPT-4 Turbo, and GPT-4.",
      "Added Language & AI Preferences section in Settings with detailed model comparison.",
      "Enhanced AI task generation to respect user's language preference for all generated content.",
      "Improved AI task generation to use selected AI model for optimal performance based on user needs.",
      "Fixed drag-and-drop functionality by ensuring draggableId is always a string.",
      "Enhanced component separation and code organization for better maintainability.",
      "Added user preference persistence using localStorage for seamless experience.",
      "Improved AI task manager UI with settings information and better user guidance."
    ]
  },
  {
    version: "0.0.3",
    date: "May 25, 2024",
    title: "Project Management Enhancements & Analysis Dashboard",
    changes: [
      "Implemented project archiving and unarchiving functionality.",
      "Added ability to delete projects permanently.",
      "Introduced an Analysis Dashboard with key metrics:",
      "  - Total active and archived projects.",
      "  - Total completed and pending tasks.",
      "  - Average project completion time.",
      "  - Tasks completed per week (last 4 weeks).",
      "  - Tasks completed per month (last 6 months).",
      "  - Total time spent on projects and tasks.",
      "Updated project list to filter by active/archived status.",
      "Enhanced UI for project management on the projects page."
    ]
  },
  {
    version: "0.0.2",
    date: "May 20, 2024",
    title: "Feature Update & Bug Fixes",
    changes: [
      "Fixed sorting bugs",
      "Added delete context menus",
      "Added new features to tasks",
      "Added inline editing for tasks",
      "Implemented task sorting functionality",
      "Added project templates",
      "Added time tracking and spent time feature",
      "Improved UI/UX with confirmation modals",
      "Enhanced task management system"
    ]
  },
  {
    version: "0.0.1",
    date: "May 15, 2024",
    title: "Initial Release",
    changes: [
      "First version release",
      "Basic project management",
      "Task creation and management",
      "User authentication",
      "Basic UI implementation"
    ]
  }
]

export default function VersionHistory() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Version History</h1>

      <div className="space-y-6">
        {versions.map((version) => (
          <CustomCard key={version.version}>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Tag className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      v{version.version}
                    </h2>
                    <span className="text-sm text-gray-500">{version.date}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    {version.title}
                  </h3>
                  <ul className="space-y-2">
                    {version.changes.map((change, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-600">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CustomCard>
        ))}
      </div>
    </div>
  )
}
