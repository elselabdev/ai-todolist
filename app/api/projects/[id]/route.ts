import { NextResponse } from "next/server"
import { initializeDatabase, query } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import type { Session } from "next-auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get the user session
    const session = (await getServerSession(authOptions)) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const unwrappedParams = await Promise.resolve(params)
    const id = unwrappedParams.id

    // Initialize database
    const initialized = await initializeDatabase()
    if (!initialized) {
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }

    // Get project details and verify ownership
    const projectResult = await query(
      `
      SELECT 
        id, 
        name, 
        description, 
        time_spent as "timeSpent",
        created_at as "createdAt", 
        updated_at as "updatedAt",
        user_id as "userId"
      FROM projects
      WHERE id = $1
    `,
      [id],
    )

    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const project = projectResult.rows[0]

    // Check if the user owns this project
    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Remove userId from the response
    delete project.userId

    // Get tasks
    const tasksResult = await query(
      `
      SELECT 
        id, 
        task, 
        completed, 
        time_spent as "timeSpent",
        time_tracking_started as "timeTrackingStarted",
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM tasks
      WHERE project_id = $1
      ORDER BY created_at ASC
    `,
      [id],
    )

    const tasks = tasksResult.rows

    // Get subtasks for each task
    for (const task of tasks) {
      const subtasksResult = await query(
        `
        SELECT 
          id, 
          task, 
          completed, 
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM subtasks
        WHERE task_id = $1
        ORDER BY created_at ASC
      `,
        [task.id],
      )

      task.subtasks = subtasksResult.rows
    }

    project.tasks = tasks

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get the user session
    const session = (await getServerSession(authOptions)) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize database
    const initialized = await initializeDatabase()
    if (!initialized) {
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }

    const id = params.id

    // Verify ownership before deleting
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

    // Delete project (cascading delete will handle tasks and subtasks)
    await query(
      `
      DELETE FROM projects
      WHERE id = $1
    `,
      [id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get the user session
    const session = (await getServerSession(authOptions)) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize database
    const initialized = await initializeDatabase()
    if (!initialized) {
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }

    const id = params.id
    const { archived } = await request.json()

    // Verify ownership before updating
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

    const now = new Date().toISOString()
    const archivedAt = archived ? now : null

    // Update project archived status
    await query(
      `
      UPDATE projects
      SET archived = $1, archived_at = $2, updated_at = $3
      WHERE id = $4
    `,
      [archived, archivedAt, now, id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}
