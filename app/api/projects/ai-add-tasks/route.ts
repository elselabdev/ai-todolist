import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { initializeDatabase, query } from "@/lib/db"
import type { Session } from "next-auth"
import { v4 as uuidv4 } from "uuid"

// Language mapping for AI prompts
const languagePrompts = {
  en: "Please respond in English.",
  es: "Por favor responde en español.",
  fr: "Veuillez répondre en français.",
  de: "Bitte antworten Sie auf Deutsch.",
  it: "Si prega di rispondere in italiano.",
  pt: "Por favor, responda em português.",
  ru: "Пожалуйста, отвечайте на русском языке.",
  ja: "日本語で回答してください。",
  ko: "한국어로 답변해 주세요.",
  zh: "请用中文回答。",
  ar: "يرجى الرد باللغة العربية.",
  hi: "कृपया हिंदी में उत्तर दें।",
  tr: "Lütfen Türkçe yanıtlayın.",
  nl: "Gelieve in het Nederlands te antwoorden.",
  sv: "Vänligen svara på svenska."
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { 
      projectId, 
      projectName, 
      projectDescription, 
      currentTasks, 
      addTasksPrompt,
      language = "en",
      aiModel = "gpt-4o"
    } = await request.json()

    if (!projectId || !addTasksPrompt) {
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

    // Get language instruction
    const languageInstruction = languagePrompts[language as keyof typeof languagePrompts] || languagePrompts.en

    // Prepare the AI prompt for adding new tasks
    const aiPrompt = `
You are a project management AI assistant. You need to generate ONE new task based on user requirements while considering the existing project context.

${languageInstruction}

Project: ${projectName}
Description: ${projectDescription}

Existing Tasks:
${currentTasks.map((task: any, index: number) => `
${index + 1}. ${task.task}${task.description ? ` - ${task.description}` : ''}
   Status: ${task.completed ? 'Completed' : 'In Progress'}
   Subtasks: ${task.subtasks.map((st: any) => `
   - ${st.task} (${st.completed ? 'Completed' : 'Pending'})`).join('')}
`).join('')}

User Request for New Task: ${addTasksPrompt}

Please generate EXACTLY ONE new task that complements the existing ones. You should:
1. Create a task that doesn't duplicate existing ones
2. Consider the project context and existing workflow
3. Generate 3-4 relevant subtasks for the task
4. Make the task actionable and specific
5. Ensure the task aligns with the user's request
6. Use the specified language for all task titles and descriptions

Return a JSON object with a "tasks" array containing ONLY ONE task. The task should have:
- task (descriptive title in the specified language)
- description (optional detailed description in the specified language)
- subtasks (array of 3-4 subtask objects with "task" field in the specified language)
- completed (always false for new tasks)

IMPORTANT: Generate exactly ONE task with 3-4 subtasks, not multiple tasks. All content should be in the requested language.

Do not include IDs or other database-specific fields - these will be generated automatically.
`

    // Validate AI model
    const validModels = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4"]
    const selectedModel = validModels.includes(aiModel) ? aiModel : "gpt-4o"

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: "system",
            content: `You are a helpful project management assistant that generates exactly one new task with 3-4 subtasks based on user requirements and project context. ${languageInstruction}`,
          },
          {
            role: "user",
            content: aiPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
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

    // Ensure only one task is generated
    if (parsedTasks.tasks.length !== 1) {
      throw new Error("AI should generate exactly one task")
    }

    // Get the highest position for new tasks
    const positionResult = await query(
      `SELECT COALESCE(MAX(position), 0) as max_position FROM tasks WHERE project_id = $1`,
      [projectId]
    )
    let nextPosition = (positionResult.rows[0]?.max_position || 0) + 1

    // Insert new tasks into database
    const newTasks = []
    for (const taskData of parsedTasks.tasks) {
      const taskId = uuidv4()
      const now = new Date().toISOString()

      // Insert task
      await query(
        `INSERT INTO tasks (id, project_id, task, description, completed, position, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [taskId, projectId, taskData.task, taskData.description || null, false, nextPosition, now, now]
      )

      // Insert subtasks
      const subtasks = []
      if (taskData.subtasks && Array.isArray(taskData.subtasks)) {
        for (const subtaskData of taskData.subtasks) {
          const subtaskId = uuidv4()
          await query(
            `INSERT INTO subtasks (id, task_id, task, completed, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [subtaskId, taskId, subtaskData.task, false, now, now]
          )
          subtasks.push({
            id: subtaskId,
            task: subtaskData.task,
            completed: false,
            createdAt: now,
            updatedAt: now,
          })
        }
      }

      newTasks.push({
        id: taskId,
        task: taskData.task,
        description: taskData.description || null,
        subtasks: subtasks,
        completed: false,
        timeSpent: 0,
        timeTrackingStarted: null,
        position: nextPosition,
        dueDate: null,
        dueTime: null,
        createdAt: now,
        updatedAt: now,
      })

      nextPosition++
    }

    return NextResponse.json({ newTasks })
  } catch (error) {
    console.error("Error adding new tasks:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add new tasks" },
      { status: 500 }
    )
  }
}
