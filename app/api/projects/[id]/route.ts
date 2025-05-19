import { sql } from "@vercel/postgres"
import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import type { Session } from "next-auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize database
    const initialized = await initializeDatabase()
    if (!initialized) {
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }

    const id = params.id

    // Get project details and verify ownership
    const projectResult = await sql`
      SELECT 
        id, 
        name, 
        description, 
        time_spent as "timeSpent",
        created_at as "createdAt", 
        updated_at as "updatedAt",
        user_id as "userId"
      FROM projects
      WHERE id = ${id}
    `

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
    const tasksResult = await sql`
      SELECT 
        id, 
        task, 
        completed, 
        time_spent as "timeSpent",
        time_tracking_started as "timeTrackingStarted",
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM tasks
      WHERE project_id = ${id}
      ORDER BY created_at ASC
    `

    const tasks = tasksResult.rows

    // Get subtasks for each task
    for (const task of tasks) {
      const subtasksResult = await sql`
        SELECT 
          id, 
          task, 
          completed, 
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM subtasks
        WHERE task_id = ${task.id}
        ORDER BY created_at ASC
      `

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
    const session = await getServerSession(authOptions) as Session | null

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

    // Delete project (cascading delete will handle tasks and subtasks)
    await sql`
      DELETE FROM projects
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
