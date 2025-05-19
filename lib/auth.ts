import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { query, initializeDatabase } from "./db"

// Initialize users table if it doesn't exist
async function initializeUsersTable() {
  try {
    await initializeDatabase()

    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `)

    const usersTableExists = tableCheck.rows[0].exists

    if (!usersTableExists) {
      console.log("Creating users table...")

      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT,
          email TEXT UNIQUE,
          email_verified TIMESTAMP WITH TIME ZONE,
          image TEXT,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `)

      // Add user_id column to projects table if it doesn't exist
      await query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'user_id'
          ) THEN
            ALTER TABLE projects ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `)

      console.log("Users table created successfully")
    }

    return true
  } catch (error) {
    console.error("Failed to initialize users table:", error)
    return false
  }
}

// Initialize the users table
initializeUsersTable()

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Create or update user in the database
      if (user.email) {
        try {
          const result = await query(
            `INSERT INTO users (id, name, email, image)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email) 
             DO UPDATE SET name = $2, image = $4
             RETURNING id`,
            [user.id, user.name, user.email, user.image],
          )
          return true
        } catch (error) {
          console.error("Error saving user to database:", error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
}
