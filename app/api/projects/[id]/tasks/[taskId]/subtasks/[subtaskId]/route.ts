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

    // Update subtask
    const result = await query(
      `
      UPDATE subtasks
      SET 
        completed = $1,
        updated_at = $2
      WHERE id = $3 AND task_id = $4
      RETURNING id
    `,
      [completed, now, subtaskId, taskId],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 })
    }

    // Check if all subtasks are completed
    const subtasksResult = await query(
      `
      SELECT completed
      FROM subtasks
      WHERE task_id = $1
    `,
      [taskId],
    )

    const allSubtasksCompleted = subtasksResult.rows.every((row) => row.completed)

    // Update task completion status based on subtasks
    await query(
      `
      UPDATE tasks
      SET 
        completed = $1,
        updated_at = $2
      WHERE id = $3
    `,
      [allSubtasksCompleted, now, taskId],
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to update subtask" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; taskId: string; subtaskId: string } }
) {
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
    const { id, taskId, subtaskId } = unwrappedParams
    const now = new Date().toISOString()

    // Verify project ownership
    const projectResult = await query(
      `
      SELECT p.user_id
      FROM projects p
      JOIN tasks t ON t.project_id = p.id
      WHERE p.id = $1 AND t.id = $2
    `,
      [id, taskId],
    )

    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: "Project or task not found" }, { status: 404 })
    }

    if (projectResult.rows[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete subtask
    const result = await query(
      `
      DELETE FROM subtasks
      WHERE id = $1 AND task_id = $2
      RETURNING id
    `,
      [subtaskId, taskId],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 })
    }

    // Update task and project timestamps
    await query(
      `
      WITH updated_task AS (
        UPDATE tasks
        SET updated_at = $1
        WHERE id = $2
      )
      UPDATE projects
      SET updated_at = $1
      WHERE id = $3
    `,
      [now, taskId, id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to delete subtask" }, { status: 500 })
  }
}
