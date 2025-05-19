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

export async function PATCH(request: Request, { params }: { params: { id: string; taskId: string } }) {
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

    const requestData = await request.json()
    const unwrappedParams = await Promise.resolve(params)
    const { id, taskId } = unwrappedParams
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

    // Build the update query dynamically based on what fields are being updated
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if ('task' in requestData) {
      updates.push(`task = $${paramCount}`)
      values.push(requestData.task)
      paramCount++
    }

    if ('description' in requestData) {
      updates.push(`description = $${paramCount}`)
      values.push(requestData.description || null)
      paramCount++
    }

    if ('completed' in requestData) {
      updates.push(`completed = $${paramCount}`)
      values.push(requestData.completed)
      paramCount++
    }

    updates.push(`updated_at = $${paramCount}`)
    values.push(now)

    // Add the remaining parameters
    values.push(taskId, id)

    // Update task
    const result = await query(
      `
      UPDATE tasks
      SET ${updates.join(', ')}
      WHERE id = $${paramCount + 1} AND project_id = $${paramCount + 2}
      RETURNING id, task, description, completed, created_at, updated_at
    `,
      values,
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // If task is marked as completed, mark all subtasks as completed
    if (requestData.completed === true) {
      await query(
        `
        UPDATE subtasks
        SET 
          completed = true,
          updated_at = $1
        WHERE task_id = $2
      `,
        [now, taskId],
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

    // Get subtasks for the response
    const subtasksResult = await query(
      `
      SELECT id, task, completed
      FROM subtasks
      WHERE task_id = $1
    `,
      [taskId],
    )

    return NextResponse.json({
      task: {
        ...result.rows[0],
        subtasks: subtasksResult.rows,
        timeSpent: 0, // You might want to fetch the actual time spent here
      },
    })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}
