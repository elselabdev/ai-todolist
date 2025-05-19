import { sql } from "@vercel/postgres"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { initializeDatabase } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
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

    const { rows } = await sql`
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.created_at as "createdAt", 
        p.updated_at as "updatedAt",
        (
          SELECT 
            CASE 
              WHEN COUNT(t.id) = 0 THEN 0
              ELSE ROUND(
                (COUNT(CASE WHEN t.completed = true THEN 1 END) + 
                 COUNT(CASE WHEN st.completed = true THEN 1 END)) * 100.0 / 
                (COUNT(t.id) + COUNT(st.id))
              )
            END
          FROM tasks t
          LEFT JOIN subtasks st ON t.id = st.task_id
          WHERE t.project_id = p.id
        ) as progress
      FROM projects p
      WHERE p.user_id = ${session.user.id}
      ORDER BY p.updated_at DESC
    `

    return NextResponse.json({ projects: rows })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const { name, description, tasks } = await request.json()

    // Validate input
    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 })
    }

    // Create project
    const projectId = uuidv4()
    const now = new Date().toISOString()

    await sql`
      INSERT INTO projects (id, name, description, created_at, updated_at, user_id)
      VALUES (${projectId}, ${name}, ${description}, ${now}, ${now}, ${session.user.id})
    `

    // Create tasks and subtasks
    if (tasks && Array.isArray(tasks)) {
      for (const task of tasks) {
        const taskId = uuidv4()

        await sql`
          INSERT INTO tasks (id, project_id, task, completed, created_at, updated_at)
          VALUES (${taskId}, ${projectId}, ${task.task}, ${task.completed}, ${now}, ${now})
        `

        if (task.subtasks && Array.isArray(task.subtasks)) {
          for (const subtask of task.subtasks) {
            const subtaskId = uuidv4()

            await sql`
              INSERT INTO subtasks (id, task_id, task, completed, created_at, updated_at)
              VALUES (${subtaskId}, ${taskId}, ${subtask.task}, ${subtask.completed}, ${now}, ${now})
            `
          }
        }
      }
    }

    return NextResponse.json({
      id: projectId,
      name,
      description,
      createdAt: now,
      updatedAt: now,
    })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
