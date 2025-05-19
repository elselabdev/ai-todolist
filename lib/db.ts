import { Pool } from "pg"
import { parse } from "pg-connection-string"

// Create a connection pool using the provided connection string
const connectionString = process.env.DATABASE_URL || ""

// Parse the connection string to get individual parameters
const parsedConfig = parse(connectionString)

// Create the pool with explicit configuration
const pool = new Pool({
  user: parsedConfig.user || undefined,
  password: parsedConfig.password || undefined,
  host: parsedConfig.host || undefined,
  port: parsedConfig.port ? parseInt(parsedConfig.port) : 5432,
  database: parsedConfig.database || undefined,
  ssl: false, // Explicitly disable SSL
})

// Helper function to execute SQL queries
export async function query(text: string, params: any[] = []) {
  try {
    const result = await pool.query(text, params)
    return result
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export async function initializeDatabase() {
  try {
    // Check if projects table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'projects'
      );
    `)

    const tablesExist = tableCheck.rows[0].exists

    if (!tablesExist) {
      console.log("Creating database tables...")

      // Create projects table
      await query(`
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          time_spent INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
          user_id TEXT
        );
      `)

      // Create tasks table
      await query(`
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
      `)

      // Create subtasks table
      await query(`
        CREATE TABLE IF NOT EXISTS subtasks (
          id UUID PRIMARY KEY,
          task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
          task TEXT NOT NULL,
          completed BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL
        );
      `)

      // Create indexes
      await query(`CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);`)
      await query(`CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);`)

      console.log("Database tables created successfully")
    }

    return true
  } catch (error) {
    console.error("Failed to initialize database:", error)
    return false
  }
}
