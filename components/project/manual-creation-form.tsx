"use client"

import React, { useState } from "react"
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
import { Loader2, ArrowLeft, Plus } from "lucide-react"

interface ManualCreationFormProps {
  onBack: () => void
}

export function ManualCreationForm({ onBack }: ManualCreationFormProps) {
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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
      // Create the project without any tasks
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
          tasks: [], // Empty tasks array for manual creation
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create project")
      }

      const { project } = await response.json()

      if (!project?.id) {
        throw new Error("No project ID returned")
      }

      // Redirect to the project page
      router.push(`/projects/${project.id}`)
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <CustomButton
            variant="ghost"
            onClick={onBack}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Creation Options
          </CustomButton>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Manual Project</h1>

        <CustomCard>
          <form onSubmit={handleSubmit}>
            <CustomCardHeader>
              <CustomCardTitle>Project Details</CustomCardTitle>
              <CustomCardDescription>
                Create a project with just the basic information. You can add tasks manually later.
              </CustomCardDescription>
            </CustomCardHeader>

            <CustomCardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <CustomInput
                label="Project Name"
                placeholder="Enter a name for your project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                fullWidth
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Description
                </label>
                <CustomTextarea
                  placeholder="Describe your project goals, objectives, or any relevant details..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  fullWidth
                  required
                  className="min-h-[120px]"
                />
                <p className="mt-1 text-sm text-gray-500">
                  This description will help you remember the project's purpose and can be used later for AI task generation.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Plus className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">What happens next?</h4>
                    <p className="text-blue-700 text-sm">
                      After creating your project, you'll be taken to the project page where you can:
                    </p>
                    <ul className="mt-2 text-blue-700 text-sm space-y-1">
                      <li>• Add tasks manually using the "Add Task" button</li>
                      <li>• Use AI to generate tasks based on your description</li>
                      <li>• Organize tasks with drag-and-drop functionality</li>
                      <li>• Track time and manage subtasks</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CustomCardContent>

            <CustomCardFooter className="flex justify-end">
              <CustomButton
                type="submit"
                disabled={isLoading}
                icon={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              >
                {isLoading ? "Creating Project..." : "Create Project"}
              </CustomButton>
            </CustomCardFooter>
          </form>
        </CustomCard>
      </div>
    </div>
  )
}
