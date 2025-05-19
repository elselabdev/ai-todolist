import { sql } from "@vercel/postgres"

export async function initializeDatabase() {
  try {
    // Check if projects table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'projects'
      );
    `

    const tablesExist = tableCheck.rows[0].exists

    if (!tablesExist) {
      console.log("Creating database tables...")

      // Create projects table
      await sql`
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          time_spent INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL
        );
      `

      // Create tasks table
      await sql`
        CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY,
          project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          task TEXT NOT NULL,
          completed BOOLEAN NOT NULL DEFAULT FALSE,
          time_spent INTEGER NOT NULL DEFAULT 0,
          time_tracking_started TIMESTAMP WITH TIME ZONE NULL,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL
        );
      `

      // Create subtasks table
      await sql`
        CREATE TABLE IF NOT EXISTS subtasks (
          id UUID PRIMARY KEY,
          task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
          task TEXT NOT NULL,
          completed BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL
        );
      `

      // Create indexes
      await sql`CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);`
      await sql`CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);`

      console.log("Database tables created successfully")
    }

    return true
  } catch (error) {
    console.error("Failed to initialize database:", error)
    return false
  }
}
