import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

// Define the schema for the response
const taskSchema = z.object({
  tasks: z.array(
    z.object({
      task: z.string().describe("Description of the main task"),
      subtasks: z.array(
        z.object({
          task: z.string().describe("Description of the subtask"),
          completed: z.boolean().default(false).describe("Indicates if the subtask is completed"),
        }),
      ),
      completed: z.boolean().default(false).describe("Indicates if the main task is completed"),
    }),
  ),
})

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json()

    if (!description) {
      return Response.json({ error: "Project description is required" }, { status: 400 })
    }

    const result = await generateObject({
      model: openai("gpt-4o"),
      apiKey:
        process.env.OPENAI_API_KEY,
      system: `You are a project management assistant that helps break down projects into manageable tasks.
      Based on the user's project description, create a structured task list with simple, achievable tasks.
      Be specific and practical with your task breakdown.
      Focus on creating clear, actionable main tasks with minimal subtasks (2-5 per task).
      Each task should be self-contained and achievable in a single work session.`,
      prompt: description,
      schema: taskSchema,
    })

    return Response.json({
      projectName: name || "New Project",
      tasks: result.object.tasks,
    })
  } catch (error) {
    console.error("Error generating tasks:", error)
    return Response.json({ error: "Failed to generate tasks. Please try again." }, { status: 500 })
  }
}
