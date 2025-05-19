import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/db"
import type { Session } from "next-auth"

// Start time tracking for a task
export async function POST(request: Request, { params }: { params: { id: string; taskId: string } }) {
  try {
    // Get the user session
    const session = (await getServerSession(authOptions)) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, taskId } = params
    const now = new Date().toISOString()

    // Verify project ownership
    const projectResult = await query(
      `
      SELECT user_id
      FROM projects
      WHERE id = $1
    `,
      [id],
    )

    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if the user owns this project
    if (projectResult.rows[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if the task exists
    const taskResult = await query(
      `
      SELECT id, time_tracking_started
      FROM tasks
      WHERE id = $1 AND project_id = $2
    `,
      [taskId, id],
    )

    if (taskResult.rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if time tracking is already started
    if (taskResult.rows[0].time_tracking_started) {
      return NextResponse.json({ error: "Time tracking already started for this task" }, { status: 400 })
    }

    // Start time tracking
    await query(
      `
      UPDATE tasks
      SET 
        time_tracking_started = $1,
        updated_at = $2
      WHERE id = $3
    `,
      [now, now, taskId],
    )

    // Update project updated_at timestamp
    await query(
      `
      UPDATE projects
      SET updated_at = $1
      WHERE id = $2
    `,
      [now, id],
    )

    return NextResponse.json({ success: true, timeTrackingStarted: now })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to start time tracking" }, { status: 500 })
  }
}

// Stop time tracking for a task
export async function DELETE(request: Request, { params }: { params: { id: string; taskId: string } }) {
  try {
    // Get the user session
    const session = (await getServerSession(authOptions)) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, taskId } = params
    const now = new Date().toISOString()

    // Verify project ownership
    const projectResult = await query(
      `
      SELECT user_id
      FROM projects
      WHERE id = $1
    `,
      [id],
    )

    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if the user owns this project
    if (projectResult.rows[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if the task exists and get time_tracking_started
    const taskResult = await query(
      `
      SELECT id, time_tracking_started, time_spent
      FROM tasks
      WHERE id = $1 AND project_id = $2
    `,
      [taskId, id],
    )

    if (taskResult.rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if time tracking is started
    if (!taskResult.rows[0].time_tracking_started) {
      return NextResponse.json({ error: "Time tracking not started for this task" }, { status: 400 })
    }

    // Calculate time spent in minutes
    const startTime = new Date(taskResult.rows[0].time_tracking_started).getTime()
    const endTime = new Date(now).getTime()
    const timeSpentMinutes = Math.round((endTime - startTime) / (1000 * 60))

    // Get current time_spent
    const currentTimeSpent = taskResult.rows[0].time_spent || 0
    const newTimeSpent = currentTimeSpent + timeSpentMinutes

    // Stop time tracking and update time_spent
    await query(
      `
      UPDATE tasks
      SET 
        time_tracking_started = NULL,
        time_spent = $1,
        updated_at = $2
      WHERE id = $3
    `,
      [newTimeSpent, now, taskId],
    )

    // Update project time_spent and updated_at timestamp
    await query(
      `
      UPDATE projects
      SET 
        time_spent = time_spent + $1,
        updated_at = $2
      WHERE id = $3
    `,
      [timeSpentMinutes, now, id],
    )

    return NextResponse.json({
      success: true,
      timeSpent: newTimeSpent,
      sessionTime: timeSpentMinutes,
    })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to stop time tracking" }, { status: 500 })
  }
}
