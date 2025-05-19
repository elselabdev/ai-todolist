import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { description } = await req.json()

    if (!description) {
      return Response.json({ error: "Project description is required" }, { status: 400 })
    }

    const result = await generateText({
      model: openai("gpt-4o"),
      apiKey:
        process.env.OPENAI_API_KEY,
      system: `You are a project management assistant that helps users refine their project descriptions.
      Your task is to improve the user's project description to make it more clear, specific, and structured.
      Add relevant details that would help in breaking down the project into tasks.
      Keep the same general project but make it more comprehensive and well-structured.
      Return ONLY the improved description without any explanations or additional text.`,
      prompt: description,
    })

    return Response.json({ refinedDescription: result.text })
  } catch (error) {
    console.error("Error refining description:", error)
    return Response.json({ error: "Failed to refine description. Please try again." }, { status: 500 })
  }
}
