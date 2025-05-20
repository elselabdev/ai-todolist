import { NextResponse } from "next/server"
import { initializeDatabase, query } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import type { Session } from "next-auth"

interface CustomSession extends Session {
  user: {
    id: string
    email: string
    name?: string
  }
}

export async function GET(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as CustomSession | null
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    const initialized = await initializeDatabase()
    if (!initialized) {
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }

    // Total projects (active/archived)
    const activeProjectsResult = await query(
      "SELECT COUNT(*) as count FROM projects WHERE user_id = $1 AND archived = FALSE",
      [userId],
    )
    const archivedProjectsResult = await query(
      "SELECT COUNT(*) as count FROM projects WHERE user_id = $1 AND archived = TRUE",
      [userId],
    )

    // Total tasks (completed/pending)
    const completedTasksResult = await query(
      "SELECT COUNT(t.id) as count FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.user_id = $1 AND t.completed = TRUE",
      [userId],
    )
    const pendingTasksResult = await query(
      "SELECT COUNT(t.id) as count FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.user_id = $1 AND t.completed = FALSE",
      [userId],
    )

    // Average project completion time (based on archived projects)
    const avgCompletionTimeResult = await query(
      `SELECT AVG(EXTRACT(EPOCH FROM (archived_at - created_at))) as avg_time 
       FROM projects 
       WHERE user_id = $1 AND archived = TRUE AND archived_at IS NOT NULL AND created_at IS NOT NULL`,
      [userId],
    )

    // Tasks completed per week (last 4 weeks)
    const tasksPerWeekResult = await query(
      `SELECT DATE_TRUNC('week', t.updated_at AT TIME ZONE 'UTC') as week_start, COUNT(t.id) as count 
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE p.user_id = $1 AND t.completed = TRUE AND t.updated_at IS NOT NULL
       GROUP BY week_start 
       ORDER BY week_start DESC 
       LIMIT 4`,
      [userId],
    )

    // Tasks completed per month (last 6 months)
    const tasksPerMonthResult = await query(
      `SELECT DATE_TRUNC('month', t.updated_at AT TIME ZONE 'UTC') as month_start, COUNT(t.id) as count 
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE p.user_id = $1 AND t.completed = TRUE AND t.updated_at IS NOT NULL
       GROUP BY month_start 
       ORDER BY month_start DESC 
       LIMIT 6`,
      [userId],
    )

    // Time spent on projects
    const timeSpentOnProjectsResult = await query(
      "SELECT SUM(time_spent) as total_time FROM projects WHERE user_id = $1",
      [userId],
    )

    // Time spent on tasks
    const timeSpentOnTasksResult = await query(
      "SELECT SUM(t.time_spent) as total_time FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.user_id = $1",
      [userId],
    )
    
    const data = {
      totalProjectsActive: parseInt(activeProjectsResult.rows[0]?.count || "0", 10),
      totalProjectsArchived: parseInt(archivedProjectsResult.rows[0]?.count || "0", 10),
      totalTasksCompleted: parseInt(completedTasksResult.rows[0]?.count || "0", 10),
      totalTasksPending: parseInt(pendingTasksResult.rows[0]?.count || "0", 10),
      averageProjectCompletionTime: avgCompletionTimeResult.rows[0]?.avg_time ? parseFloat(avgCompletionTimeResult.rows[0].avg_time) : null,
      tasksCompletedLast4Weeks: tasksPerWeekResult.rows.map((r: { week_start: string | number | Date, count: string | number }) => ({ week: new Date(r.week_start).toISOString().split('T')[0], count: parseInt(String(r.count), 10) })),
      tasksCompletedLast6Months: tasksPerMonthResult.rows.map((r: { month_start: string | number | Date, count: string | number }) => ({ month: new Date(r.month_start).toISOString().split('T')[0], count: parseInt(String(r.count), 10) })),
      totalTimeSpentOnProjects: parseInt(timeSpentOnProjectsResult.rows[0]?.total_time || "0", 10),
      totalTimeSpentOnTasks: parseInt(timeSpentOnTasksResult.rows[0]?.total_time || "0", 10),
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Dashboard API Error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
} 