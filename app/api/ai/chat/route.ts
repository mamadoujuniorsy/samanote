import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateAIResponse } from "@/lib/ai-client"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { messages, noteContent } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages requis" }, { status: 400 })
    }

    // Prepare context system message
    const systemMessage = {
      role: "system",
      content: `Tu es un assistant pédagogique intelligent pour l'application SamaNote.
      Ton rôle est d'aider l'étudiant à comprendre ses notes, à réviser et à approfondir ses connaissances.
      
      Voici le contenu de la note sur laquelle l'étudiant travaille actuellement :
      ---
      ${noteContent || "Aucun contenu de note fourni."}
      ---
      
      Réponds aux questions de l'étudiant en te basant sur ce contenu si pertinent.
      Sois encourageant, clair et pédagogique. Si tu ne sais pas, dis-le.
      N'invente pas d'informations si elles ne sont pas dans le contexte, sauf si c'est une question de culture générale.`
    }

    const fullMessages = [systemMessage, ...messages]

    const content = await generateAIResponse({
      messages: fullMessages,
      temperature: 0.7,
    })

    return NextResponse.json({ content })
  } catch (error: any) {
    console.error("Erreur chat IA:", error)
    return NextResponse.json({ error: error.message || "Erreur lors de la génération de la réponse" }, { status: 500 })
  }
}
