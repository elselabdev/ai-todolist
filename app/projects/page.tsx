"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CustomButton } from "@/components/ui/custom-button"
import { CustomCard, CustomCardContent, CustomCardHeader, CustomCardTitle } from "@/components/ui/custom-card"
import { CustomProgress } from "@/components/ui/custom-progress"
import { CustomInput } from "@/components/ui/custom-input"
import { Loader2, PlusCircle, Search, CheckSquare, Clock, Calendar } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string
  progress: number
  createdAt: string
  updatedAt: string
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects")

        if (!response.ok) {
          throw new Error("Failed to fetch projects")
        }

        const data = await response.json()
        setProjects(data.projects)
      } catch (error) {
        console.error("Error fetching projects:", error)
        setError("Failed to load projects. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Projects</h1>
          <p className="mt-2 text-gray-600">Manage and track all your AI-generated projects</p>
        </div>
        <CustomButton href="/new-project" icon={<PlusCircle className="h-5 w-5" />}>
          New Project
        </CustomButton>
      </div>

      <div className="mb-6">
        <CustomInput
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          leftIcon={<Search className="h-5 w-5" />}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading projects...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
          {searchQuery ? (
            <p className="text-gray-500">No projects match your search criteria.</p>
          ) : (
            <div className="mt-4">
              <p className="text-gray-500 mb-4">Create your first project to get started.</p>
              <CustomButton href="/new-project" icon={<PlusCircle className="h-5 w-5" />}>
                Create New Project
              </CustomButton>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id} className="block h-full">
              <CustomCard className="h-full transition-all duration-200 hover:shadow-md">
                <CustomCardHeader>
                  <CustomCardTitle>{project.name}</CustomCardTitle>
                  <div className="mt-2">
                    <CustomProgress value={project.progress} showValue />
                  </div>
                </CustomCardHeader>
                <CustomCardContent>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{project.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Created: {formatDate(project.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Updated: {formatDate(project.updatedAt)}</span>
                    </div>
                  </div>
                </CustomCardContent>
              </CustomCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
