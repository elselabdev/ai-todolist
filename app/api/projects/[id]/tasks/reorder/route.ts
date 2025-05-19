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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = (await getServerSession(authOptions)) as CustomSession | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const initialized = await initializeDatabase()
    if (!initialized) {
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }

    const { taskOrders } = await request.json()
    const unwrappedParams = await Promise.resolve(params)
    const { id } = unwrappedParams
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

    if (projectResult.rows[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update task positions
    for (const { id: taskId, position } of taskOrders) {
      await query(
        `
        UPDATE tasks
        SET position = $1, updated_at = $2
        WHERE id = $3
      `,
        [position, now, taskId],
      )
    }

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
    return NextResponse.json({ error: "Failed to reorder tasks" }, { status: 500 })
  }
} 