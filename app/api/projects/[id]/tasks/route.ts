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

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get the user session
    const session = (await getServerSession(authOptions)) as CustomSession | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize database
    const initialized = await initializeDatabase()
    if (!initialized) {
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }

    const { task, description } = await request.json()
    const unwrappedParams = await Promise.resolve(params)
    const { id } = unwrappedParams
    const now = new Date().toISOString()
    const taskId = randomUUID()

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

    // Add new task
    const result = await query(
      `
      INSERT INTO tasks (id, project_id, task, description, completed, time_spent, created_at, updated_at)
      VALUES ($1, $2, $3, $4, false, 0, $5, $5)
      RETURNING id, task, description, completed, time_spent as "timeSpent", created_at as "createdAt", updated_at as "updatedAt"
    `,
      [taskId, id, task, description || null, now],
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

    return NextResponse.json({
      task: {
        ...result.rows[0],
        subtasks: [],
        timeSpent: 0,
      },
    })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to add task" }, { status: 500 })
  }
} 