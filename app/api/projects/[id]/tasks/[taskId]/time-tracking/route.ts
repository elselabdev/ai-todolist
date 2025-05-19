import { NextResponse } from "next/server"
import { initializeDatabase, query } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Session } from "next-auth"

interface CustomSession extends Session {
  user: {
    id: string
    email: string
    name?: string
  }
}

// Start time tracking for a task
export async function POST(request: Request, { params }: { params: { id: string; taskId: string } }) {
  try {
    const session = (await getServerSession(authOptions)) as CustomSession | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const initialized = await initializeDatabase()
    if (!initialized) {
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }

    const unwrappedParams = await Promise.resolve(params)
    const { id, taskId } = unwrappedParams
    const now = new Date().toISOString()

    // Start time tracking
    await query(
      `
      UPDATE tasks
      SET 
        time_tracking_started = $1,
        updated_at = $1
      WHERE id = $2 AND project_id = $3
    `,
      [now, taskId, id],
    )

    return NextResponse.json({ timeTrackingStarted: now })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to start time tracking" }, { status: 500 })
  }
}

// Stop time tracking for a task
export async function DELETE(request: Request, { params }: { params: { id: string; taskId: string } }) {
  try {
    const session = (await getServerSession(authOptions)) as CustomSession | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const initialized = await initializeDatabase()
    if (!initialized) {
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }

    const unwrappedParams = await Promise.resolve(params)
    const { id, taskId } = unwrappedParams
    const now = new Date().toISOString()

    // Get current task state
    const taskResult = await query(
      `
      SELECT time_spent, time_tracking_started
      FROM tasks
      WHERE id = $1 AND project_id = $2
    `,
      [taskId, id],
    )

    if (taskResult.rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const task = taskResult.rows[0]
    const startTime = new Date(task.time_tracking_started)
    const endTime = new Date()
    const sessionTimeInSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
    const totalTimeSpent = (task.time_spent || 0) + sessionTimeInSeconds

    // Update task time
    await query(
      `
      UPDATE tasks
      SET 
        time_spent = $1,
        time_tracking_started = NULL,
        updated_at = $2
      WHERE id = $3 AND project_id = $4
    `,
      [totalTimeSpent, now, taskId, id],
    )

    // Update project total time
    await query(
      `
      UPDATE projects
      SET 
        time_spent = COALESCE(time_spent, 0) + $1,
        updated_at = $2
      WHERE id = $3
    `,
      [sessionTimeInSeconds, now, id],
    )

    return NextResponse.json({
      timeSpent: totalTimeSpent,
      sessionTime: sessionTimeInSeconds,
    })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to stop time tracking" }, { status: 500 })
  }
}