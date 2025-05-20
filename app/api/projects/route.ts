import { NextResponse } from "next/server"
import { initializeDatabase, query } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Session } from "next-auth"
import { v4 as uuidv4 } from "uuid"

interface CustomSession extends Session {
  user: {
    id: string
    email: string
    name?: string
  }
}

export async function GET(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as CustomSession | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize database
    const initialized = await initializeDatabase()
    if (!initialized) {
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const showArchived = searchParams.get("archived") === "true"

    const result = await query(
      `
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
      WHERE p.user_id = $1 AND p.archived = $2
      ORDER BY p.updated_at DESC
    `,
      [session.user.id, showArchived],
    )

    return NextResponse.json({ projects: result.rows })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as CustomSession | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const initialized = await initializeDatabase()
    if (!initialized) {
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }

    const { name, description, tasks } = await request.json()
    const now = new Date().toISOString()
    const projectId = uuidv4()

    // Create project
    const projectResult = await query(
      `
      INSERT INTO projects (id, user_id, name, description, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $5)
      RETURNING id, name, description, created_at as "createdAt", updated_at as "updatedAt"
    `,
      [projectId, session.user.id, name, description, now],
    )

    // Create tasks if provided
    if (tasks && Array.isArray(tasks)) {
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i]
        const taskId = uuidv4()
        await query(
          `
          INSERT INTO tasks (id, project_id, task, completed, position, created_at, updated_at)
          VALUES ($1, $2, $3, false, $4, $5, $5)
        `,
          [taskId, projectId, task.task, i + 1, now],
        )

        // Create subtasks if provided
        if (task.subtasks && Array.isArray(task.subtasks)) {
          for (let j = 0; j < task.subtasks.length; j++) {
            const subtask = task.subtasks[j]
            const subtaskId = uuidv4()
            await query(
              `
              INSERT INTO subtasks (id, task_id, task, completed, created_at, updated_at)
              VALUES ($1, $2, $3, false, $4, $4)
            `,
              [subtaskId, taskId, subtask.task, now],
            )
          }
        }
      }
    }

    const project = projectResult.rows[0]
    return NextResponse.json({ project })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
