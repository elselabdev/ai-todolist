"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { CustomButton } from "@/components/ui/custom-button"
import { CustomCard, CustomCardContent, CustomCardFooter, CustomCardHeader, CustomCardTitle } from "@/components/ui/custom-card"
import { CustomProgress } from "@/components/ui/custom-progress"
import { CustomInput } from "@/components/ui/custom-input"
import { Loader2, PlusCircle, Search, CheckSquare, Clock, Calendar, Archive, Trash2, ArchiveRestore } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface Project {
  id: string
  name: string
  description: string
  progress: number
  createdAt: string
  updatedAt: string
  archived?: boolean
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState("")
  const [showArchived, setShowArchived] = useState(false)

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/projects?archived=${showArchived}`)
      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }
      const data = await response.json()
      setProjects(data.projects)
    } catch (fetchError) {
      console.error("Error fetching projects:", fetchError)
      setError("Failed to load projects. Please try again.")
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }, [showArchived])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" })
      if (!response.ok) {
        throw new Error("Failed to delete project")
      }
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId))
    } catch (deleteError) {
      console.error("Error deleting project:", deleteError)
      setError("Failed to delete project. Please try again.")
    }
  }

  const handleArchiveProject = async (projectId: string, archiveStatus: boolean) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: archiveStatus }),
      })
      if (!response.ok) {
        throw new Error(archiveStatus ? "Failed to archive project" : "Failed to unarchive project")
      }
      fetchProjects()
    } catch (archiveError) {
      console.error(archiveStatus ? "Error archiving project:" : "Error unarchiving project:", archiveError)
      setError(archiveStatus ? "Failed to archive project. Please try again." : "Failed to unarchive project. Please try again.")
    }
  }

  const filteredProjects = projects.filter(
    (project) =>
      (project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
        <div className="flex items-center space-x-2">
          <CustomButton
            variant={showArchived ? "outline" : "primary"}
            onClick={() => setShowArchived(!showArchived)}
            icon={showArchived ? <ArchiveRestore className="h-5 w-5" /> : <Archive className="h-5 w-5" />}
          >
            {showArchived ? "Show Active" : "Show Archived"}
          </CustomButton>
          <CustomButton href="/new-project" icon={<PlusCircle className="h-5 w-5" />}>
            New Project
          </CustomButton>
        </div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {showArchived ? "No archived projects found" : "No active projects found"}
          </h3>
          {searchQuery ? (
            <p className="text-gray-500">No projects match your search criteria.</p>
          ) : !showArchived && (
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
            <CustomCard key={project.id} className="h-full transition-all duration-200 hover:shadow-md flex flex-col">
              <Link href={`/projects/${project.id}`} className="block flex-grow">
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
              </Link>
              <CustomCardFooter className="border-t pt-4 mt-auto">
                <div className="flex w-full justify-end space-x-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <CustomButton variant="outline" size="sm" icon={<Trash2 className="h-4 w-4" />}>
                        Delete
                      </CustomButton>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the project
                          and all its associated tasks and subtasks.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteProject(project.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <CustomButton
                    variant="outline"
                    size="sm"
                    icon={project.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                    onClick={() => handleArchiveProject(project.id, !project.archived)}
                  >
                    {project.archived ? "Unarchive" : "Archive"}
                  </CustomButton>
                </div>
              </CustomCardFooter>
            </CustomCard>
          ))}
        </div>
      )}
    </div>
  )
}
