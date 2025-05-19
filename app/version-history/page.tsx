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