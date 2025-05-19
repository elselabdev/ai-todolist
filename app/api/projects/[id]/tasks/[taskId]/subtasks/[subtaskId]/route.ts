import { sql } from "@vercel/postgres"
import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; taskId: string; subtaskId: string } },
) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize database
    const initialized = await initializeDatabase()
    if (!initialized) {
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }

    const { completed } = await request.json()
    const { id, taskId, subtaskId } = params
    const now = new Date().toISOString()

    // Verify project ownership
    const projectResult = await sql`
      SELECT user_id
      FROM projects
      WHERE id = ${id}
    `

    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if the user owns this project
    if (projectResult.rows[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update subtask
    const result = await sql`
      UPDATE subtasks
      SET 
        completed = ${completed},
        updated_at = ${now}
      WHERE id = ${subtaskId} AND task_id = ${taskId}
      RETURNING id
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 })
    }

    // Check if all subtasks are completed
    const subtasksResult = await sql`
      SELECT completed
      FROM subtasks
      WHERE task_id = ${taskId}
    `

    const allSubtasksCompleted = subtasksResult.rows.every((row) => row.completed)

    // Update task completion status based on subtasks
    await sql`
      UPDATE tasks
      SET 
        completed = ${allSubtasksCompleted},
        updated_at = ${now}
      WHERE id = ${taskId}
    `

    // Update project updated_at timestamp
    await sql`
      UPDATE projects
      SET updated_at = ${now}
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to update subtask" }, { status: 500 })
  }
}
