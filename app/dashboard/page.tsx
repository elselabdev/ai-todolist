"use client"

import { useEffect, useState } from "react"
import { CustomCard, CustomCardContent, CustomCardHeader, CustomCardTitle } from "@/components/ui/custom-card"
import { Loader2, Package, ArchiveIcon, ListChecks, Clock, CalendarDays, BarChart3 } from "lucide-react"

interface DashboardData {
  totalProjectsActive: number
  totalProjectsArchived: number
  totalTasksCompleted: number
  totalTasksPending: number
  averageProjectCompletionTime: number | null // in seconds
  tasksCompletedLast4Weeks: { week: string; count: number }[]
  tasksCompletedLast6Months: { month: string; count: number }[]
  totalTimeSpentOnProjects: number // in seconds
  totalTimeSpentOnTasks: number // in seconds
}

// Helper function to format seconds into a readable string (e.g., 2h 30m)
const formatSecondsToHMS = (seconds: number | null | undefined): string => {
  if (seconds === null || seconds === undefined || seconds === 0) return "0m"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  // const s = Math.floor(seconds % 60)
  let S = ""
  if (h > 0) S += `${h}h `
  if (m > 0) S += `${m}m`
  // if (s > 0) S += `${s}s` 
  return S.trim() || "0m" // Return "0m" if string is empty (e.g. less than 1 minute)
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError("")
      try {
        const response = await fetch("/api/dashboard")
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch dashboard data")
        }
        const result = await response.json()
        setData(result)
      } catch (fetchError: any) {
        console.error("Error fetching dashboard data:", fetchError)
        setError(fetchError.message || "An unknown error occurred.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const renderMetricCard = (title: string, value: string | number, icon: React.ReactNode, subText?: string) => (
    <CustomCard>
      <CustomCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CustomCardTitle className="text-sm font-medium">{title}</CustomCardTitle>
        {icon}
      </CustomCardHeader>
      <CustomCardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subText && <p className="text-xs text-muted-foreground">{subText}</p>}
      </CustomCardContent>
    </CustomCard>
  )

  const renderListCard = (title: string, items: { period: string; count: number }[], icon: React.ReactNode, itemName: string) => (
    <CustomCard className="col-span-1 md:col-span-2 lg:col-span-1">
      <CustomCardHeader>
        <CustomCardTitle className="flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </CustomCardTitle>
      </CustomCardHeader>
      <CustomCardContent>
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.period} className="flex justify-between items-center text-sm">
                <span>{item.period}:</span>
                <span className="font-semibold">{item.count} {itemName}{item.count === 1 ? '' : 's'}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No data available.</p>
        )}
      </CustomCardContent>
    </CustomCard>
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-3 text-xl text-gray-600">Loading Dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)]">
        <BarChart3 className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)]">
        <BarChart3 className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Dashboard Data</h2>
        <p className="text-gray-500">Could not retrieve any data for the dashboard at this time.</p>
      </div>
    )
  }

  const tasksPerWeekFormatted = data.tasksCompletedLast4Weeks.map(w => ({period: `Week of ${w.week}`, count: w.count}))
  const tasksPerMonthFormatted = data.tasksCompletedLast6Months.map(m => ({period: new Date(m.month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' }), count: m.count}))


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
        <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
        Analysis Dashboard
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
        {renderMetricCard("Active Projects", data.totalProjectsActive, <Package className="h-4 w-4 text-muted-foreground" />)}
        {renderMetricCard("Archived Projects", data.totalProjectsArchived, <ArchiveIcon className="h-4 w-4 text-muted-foreground" />)}
        {renderMetricCard("Completed Tasks", data.totalTasksCompleted, <ListChecks className="h-4 w-4 text-muted-foreground" />)}
        {renderMetricCard("Pending Tasks", data.totalTasksPending, <Clock className="h-4 w-4 text-muted-foreground" />)}
        {renderMetricCard("Avg. Project Completion", formatSecondsToHMS(data.averageProjectCompletionTime), <CalendarDays className="h-4 w-4 text-muted-foreground" />,
           data.averageProjectCompletionTime ? "Based on archived projects" : "No archived projects yet"
        )}
        {renderMetricCard("Total Time on Projects", formatSecondsToHMS(data.totalTimeSpentOnProjects), <Clock className="h-4 w-4 text-muted-foreground" />)}
        {renderMetricCard("Total Time on Tasks", formatSecondsToHMS(data.totalTimeSpentOnTasks), <Clock className="h-4 w-4 text-muted-foreground" />)}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
          {renderListCard("Tasks Completed per Week (Last 4)", tasksPerWeekFormatted, <CalendarDays className="h-5 w-5 text-blue-600" />, "task")}
          {renderListCard("Tasks Completed per Month (Last 6)", tasksPerMonthFormatted, <CalendarDays className="h-5 w-5 text-blue-600" />, "task")}
      </div>
    </div>
  )
} 