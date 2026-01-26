import { NextResponse } from "next/server"
import OpenAI from "openai"

const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured")
  }
  return new OpenAI({ apiKey })
}

const SYSTEM_PROMPT = `You are a compassionate and supportive AI assistant for the Kennedy Austin Foundation, a nonprofit organization that provides crisis intervention, grief counseling, and family support services.

Your role is to:
1. Provide emotional support and a listening ear
2. Share information about the foundation's services
3. Offer helpful resources and coping strategies
4. Guide users to appropriate professional help when needed

Important guidelines:
- Always be warm, empathetic, and non-judgmental
- If someone expresses thoughts of self-harm or suicide, immediately provide crisis resources:
  - National Suicide Prevention Lifeline: 988
  - Crisis Text Line: Text HOME to 741741
  - Kennedy Austin Foundation Crisis Line: 909-808-6866
  - If in immediate danger, call 911
- Never provide medical diagnoses or treatment advice
- Encourage professional help for serious concerns
- Remember that you're a supportive resource, not a replacement for professional counseling

Available services at Kennedy Austin Foundation (all free):
- Crisis Intervention (24/7)
- Grief Counseling
- Domestic Violence Support
- Self-Help Programs
- Youth Programs
- Family Support

Contact: 909-808-6866 or admin@kennedyaustinfoundation.com
Location: Serving Pomona, Claremont, and La Verna, California`

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      )
    }

    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return NextResponse.json(
        { error: "No response generated" },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error("AI chat error:", error)
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    )
  }
}
