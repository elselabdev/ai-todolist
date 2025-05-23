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
          description TEXT,
          completed BOOLEAN NOT NULL DEFAULT FALSE,
          time_spent INTEGER NOT NULL DEFAULT 0,
          time_tracking_started TIMESTAMP WITH TIME ZONE NULL,
          position INTEGER NOT NULL DEFAULT 1,
          due_date DATE,
          due_time TIME,
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
    } else {
      // Tables exist, check for missing columns and add them
      console.log("Checking for missing columns...")
      
      // Add description column to tasks table if it doesn't exist
      await query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'tasks' AND column_name = 'description'
          ) THEN 
            ALTER TABLE tasks ADD COLUMN description TEXT;
          END IF;
        END $$;
      `)

      // Add position column to tasks table if it doesn't exist
      await query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'tasks' AND column_name = 'position'
          ) THEN 
            ALTER TABLE tasks ADD COLUMN position INTEGER;
            
            -- Update existing tasks with position based on created_at
            WITH numbered_tasks AS (
              SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) as row_num
              FROM tasks
            )
            UPDATE tasks t
            SET position = nt.row_num
            FROM numbered_tasks nt
            WHERE t.id = nt.id;
            
            -- Make position NOT NULL after setting initial values
            ALTER TABLE tasks ALTER COLUMN position SET NOT NULL;
          END IF;
        END $$;
      `)

      // Add due_date column to tasks table if it doesn't exist
      await query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'tasks' AND column_name = 'due_date'
          ) THEN 
            ALTER TABLE tasks ADD COLUMN due_date DATE;
          END IF;
        END $$;
      `)

      // Add due_time column to tasks table if it doesn't exist
      await query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'tasks' AND column_name = 'due_time'
          ) THEN 
            ALTER TABLE tasks ADD COLUMN due_time TIME;
          END IF;
        END $$;
      `)

      // Ensure all existing tasks have position values (in case some are NULL)
      await query(`
        WITH numbered_tasks AS (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) as row_num
          FROM tasks
          WHERE position IS NULL
        )
        UPDATE tasks t
        SET position = nt.row_num
        FROM numbered_tasks nt
        WHERE t.id = nt.id;
      `)
    }

    return true
  } catch (error) {
    console.error("Failed to initialize database:", error)
    return false
  }
}
