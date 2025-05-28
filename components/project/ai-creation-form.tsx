"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Loader2, ArrowLeft, Zap, RefreshCw, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"
import { projectTemplates } from "@/lib/templates"

interface AiCreationFormProps {
  onBack: () => void
}

export function AiCreationForm({ onBack }: AiCreationFormProps) {
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [templatePrompt, setTemplatePrompt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  // Handle template data from URL
  useEffect(() => {
    const name = searchParams.get("name")
    const description = searchParams.get("description")
    const templateId = searchParams.get("template")

    if (name) setProjectName(name)
    if (description) setProjectDescription(description)
    
    // If template is provided, get its AI prompt
    if (templateId) {
      const template = projectTemplates.find(t => t.id === templateId)
      if (template) {
        setTemplatePrompt(template.aiPrompt)
      }
    }
  }, [searchParams])

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
      // First generate tasks with AI
      const aiResponse = await fetch("/api/generate-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName,
          description: templatePrompt || projectDescription, // Use template prompt if available
        }),
      })

      if (!aiResponse.ok) {
        throw new Error("Failed to generate tasks")
      }

      const aiData = await aiResponse.json()

      // Then create the project with the generated tasks
      const saveResponse = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription, // Keep original description for project
          tasks: aiData.tasks,
        }),
      })

      if (!saveResponse.ok) {
        throw new Error("Failed to create project")
      }

      const { project } = await saveResponse.json()

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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create AI-Powered Project</h1>
        
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Looking for inspiration?</h3>
            <p className="text-blue-700 mb-2">
              Check out our project templates for pre-made structures and AI-generated tasks.
            </p>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              Browse Templates
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <CustomCard>
          <form onSubmit={handleSubmit}>
            <CustomCardHeader>
              <CustomCardTitle>Project Details</CustomCardTitle>
              <CustomCardDescription>
                Provide a name and detailed description of your project. AI will generate a comprehensive task list.
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
                  The more details you provide, the better the AI can understand your project and generate relevant tasks.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">AI will generate:</h4>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• Comprehensive task breakdown</li>
                      <li>• Relevant subtasks for each main task</li>
                      <li>• Logical task organization and structure</li>
                      <li>• Project milestones and dependencies</li>
                    </ul>
                  </div>
                </div>
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
    </div>
  )
}
