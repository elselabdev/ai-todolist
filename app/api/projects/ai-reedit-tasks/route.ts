import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { initializeDatabase, query } from "@/lib/db"
import type { Session } from "next-auth"

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { projectId, projectName, projectDescription, currentTasks, reEditPrompt } = await request.json()

    if (!projectId || !reEditPrompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Initialize database
    const initialized = await initializeDatabase()
    if (!initialized) {
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }

    // Verify project ownership
    const projectResult = await query(
      `SELECT user_id FROM projects WHERE id = $1`,
      [projectId]
    )

    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (projectResult.rows[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Prepare the AI prompt for re-editing tasks
    const aiPrompt = `
You are a project management AI assistant. You need to re-edit existing tasks based on user instructions while preserving their structure and completion status.

Project: ${projectName}
Description: ${projectDescription}

Current Tasks:
${currentTasks.map((task: any, index: number) => `
${index + 1}. ${task.task}${task.description ? ` - ${task.description}` : ''}
   Status: ${task.completed ? 'Completed' : 'In Progress'}
   Subtasks: ${task.subtasks.map((st: any) => `
   - ${st.task} (${st.completed ? 'Completed' : 'Pending'})`).join('')}
`).join('')}

User Instructions: ${reEditPrompt}

Please re-edit the tasks according to the user's instructions. You must:
1. Preserve the completion status of tasks and subtasks
2. Keep the same task IDs and subtask IDs
3. Maintain the logical structure
4. Apply the requested modifications thoughtfully
5. Return the tasks in the exact same format as provided

Return a JSON object with a "tasks" array containing the modified tasks. Each task should have:
- id (keep existing)
- task (modified title)
- description (modified or added)
- subtasks (array with id, task, completed fields - keep existing IDs)
- completed (preserve existing status)
- position (keep existing)
- timeSpent (preserve existing)
- timeTrackingStarted (preserve existing)
- dueDate (preserve existing)
- dueTime (preserve existing)
`

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful project management assistant that re-edits tasks based on user instructions while preserving their structure and status.",
          },
          {
            role: "user",
            content: aiPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error("Failed to get AI response")
    }

    const openaiData = await openaiResponse.json()
    const aiContent = openaiData.choices[0]?.message?.content

    if (!aiContent) {
      throw new Error("No content received from AI")
    }

    // Parse the AI response
    let parsedTasks
    try {
      // Extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response")
      }
      parsedTasks = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent)
      throw new Error("Failed to parse AI response")
    }

    if (!parsedTasks.tasks || !Array.isArray(parsedTasks.tasks)) {
      throw new Error("Invalid task structure from AI")
    }

    // Update tasks in database
    for (const task of parsedTasks.tasks) {
      await query(
        `UPDATE tasks SET task = $1, description = $2, updated_at = $3 WHERE id = $4`,
        [task.task, task.description, new Date().toISOString(), task.id]
      )

      // Update subtasks
      for (const subtask of task.subtasks) {
        await query(
          `UPDATE subtasks SET task = $1, updated_at = $2 WHERE id = $3`,
          [subtask.task, new Date().toISOString(), subtask.id]
        )
      }
    }

    return NextResponse.json({ tasks: parsedTasks.tasks })
  } catch (error) {
    console.error("Error re-editing tasks:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to re-edit tasks" },
      { status: 500 }
    )
  }
}
