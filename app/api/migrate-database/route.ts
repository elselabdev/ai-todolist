import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/db"
import type { Session } from "next-auth"

export async function GET() {
  try {
    // Get the user session (only admins should be able to run migrations)
    const session = (await getServerSession(authOptions)) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Running database migration...")

    // Add time_spent column to projects table if it doesn't exist
    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'projects' AND column_name = 'time_spent'
        ) THEN
          ALTER TABLE projects ADD COLUMN time_spent INTEGER NOT NULL DEFAULT 0;
        END IF;
      END $$;
    `)

    // Add time tracking columns to tasks table if they don't exist
    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'tasks' AND column_name = 'time_spent'
        ) THEN
          ALTER TABLE tasks ADD COLUMN time_spent INTEGER NOT NULL DEFAULT 0;
        END IF;

        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'tasks' AND column_name = 'time_tracking_started'
        ) THEN
          ALTER TABLE tasks ADD COLUMN time_tracking_started TIMESTAMP WITH TIME ZONE NULL;
        END IF;
      END $$;
    `)

    console.log("Database migration completed successfully")

    return NextResponse.json({ success: true, message: "Database migration completed successfully" })
  } catch (error) {
    console.error("Migration Error:", error)
    return NextResponse.json({ error: "Failed to migrate database" }, { status: 500 })
  }
}
