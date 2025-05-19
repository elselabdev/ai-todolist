"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CustomButton } from "@/components/ui/custom-button"
import { CustomTextarea } from "@/components/ui/custom-textarea"
import { CustomInput } from "@/components/ui/custom-input"
import {
  CustomCard,
  CustomCardHeader,
  CustomCardContent,
  CustomCardFooter,
  CustomCardTitle,
  CustomCardDescription,
} from "@/components/ui/custom-card"
import { Loader2, Zap, RefreshCw } from "lucide-react"

export default function NewProject() {
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!projectName.trim()) {
      setError("Please enter a project name")
      return
    }

    if (!projectDescription.trim()) {
      setError("Please enter a project description")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/generate-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate tasks")
      }

      const data = await response.json()

      // Save to database
      const saveResponse = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
          tasks: data.tasks,
        }),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(errorData.error || "Failed to save project")
      }

      const savedProject = await saveResponse.json()

      // Redirect to the project page
      router.push(`/projects/${savedProject.id}`)
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefine = async () => {
    if (!projectDescription.trim()) {
      setError("Please enter a project description to refine")
      return
    }

    setError("")
    setIsRefining(true)

    try {
      const response = await fetch("/api/refine-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: projectDescription }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to refine description")
      }

      const data = await response.json()
      setProjectDescription(data.refinedDescription)
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "Failed to refine description. Please try again.")
    } finally {
      setIsRefining(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="mt-2 text-gray-600">Describe your project and our AI will break it down into manageable tasks.</p>
      </div>

      <CustomCard>
        <form onSubmit={handleSubmit}>
          <CustomCardHeader>
            <CustomCardTitle>Project Details</CustomCardTitle>
            <CustomCardDescription>Provide a name and detailed description of your project</CustomCardDescription>
          </CustomCardHeader>

          <CustomCardContent className="space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

            <CustomInput
              label="Project Name"
              placeholder="Enter a name for your project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              fullWidth
              required
            />

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Project Description</label>
                <CustomButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRefine}
                  disabled={isRefining || !projectDescription.trim()}
                  icon={isRefining ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                >
                  {isRefining ? "Refining..." : "Refine with AI"}
                </CustomButton>
              </div>
              <CustomTextarea
                placeholder="Describe your project in detail. For example: Help me finish my SwiftUI project, which involves implementing a user authentication system, designing the UI for the main screen, and integrating a database for data storage."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                fullWidth
                required
                className="min-h-[200px]"
              />
              <p className="mt-1 text-sm text-gray-500">
                The more details you provide, the better the AI can understand your project.
              </p>
            </div>
          </CustomCardContent>

          <CustomCardFooter className="flex justify-end">
            <CustomButton
              type="submit"
              disabled={isLoading}
              icon={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
            >
              {isLoading ? "Generating Tasks..." : "Generate Tasks"}
            </CustomButton>
          </CustomCardFooter>
        </form>
      </CustomCard>
    </div>
  )
}
