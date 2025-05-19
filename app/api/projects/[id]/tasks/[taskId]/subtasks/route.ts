import { NextResponse } from "next/server"
import { initializeDatabase, query } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Session } from "next-auth"
import { randomUUID } from "crypto"

interface CustomSession extends Session {
  user: {
    id: string
    email: string
    name?: string
  }
}

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

    const { task } = await request.json()
    const unwrappedParams = await Promise.resolve(params)
    const { id, taskId } = unwrappedParams
    const now = new Date().toISOString()
    const subtaskId = randomUUID()

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

    // Add new subtask
    const result = await query(
      `
      INSERT INTO subtasks (id, task_id, task, completed, created_at, updated_at)
      VALUES ($1, $2, $3, false, $4, $4)
      RETURNING id, task, completed, created_at as "createdAt", updated_at as "updatedAt"
    `,
      [subtaskId, taskId, task, now],
    )

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

    return NextResponse.json({ subtask: result.rows[0] })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to add subtask" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string; taskId: string } }) {
  try {
    const session = (await getServerSession(authOptions)) as CustomSession | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const initialized = await initializeDatabase()
    if (!initialized) {
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }

    const { subtaskId, task } = await request.json()
    const unwrappedParams = await Promise.resolve(params)
    const { id, taskId } = unwrappedParams
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

    // Update subtask
    const result = await query(
      `
      UPDATE subtasks
      SET task = $1, updated_at = $2
      WHERE id = $3 AND task_id = $4
      RETURNING id, task, completed, created_at as "createdAt", updated_at as "updatedAt"
    `,
      [task, now, subtaskId, taskId],
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

    return NextResponse.json({ subtask: result.rows[0] })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to update subtask" }, { status: 500 })
  }
} 