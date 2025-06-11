import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { notes, type, subject } = await request.json()

    if (!notes || !type) {
      return NextResponse.json({ error: "Notes et type requis" }, { status: 400 })
    }

    let prompt = ""

    switch (type) {
      case "summary":
        prompt = `Créez un résumé structuré et détaillé des notes suivantes sur ${subject || "le sujet"}. 
        Organisez le contenu avec des titres, sous-titres et points clés. 
        Utilisez le format Markdown pour la structure.
        
        Notes: ${notes}`
        break

      case "flashcard":
        prompt = `Créez des fiches de révision (flashcards) basées sur les notes suivantes sur ${subject || "le sujet"}.
        Format: ## Fiche X: [Titre]
        **Question**: [Question claire]
        **Réponse**: [Réponse détaillée]
        
        Créez au moins 5 fiches différentes couvrant les concepts principaux.
        
        Notes: ${notes}`
        break

      case "quiz":
        prompt = `Créez un quiz de 10 questions à choix multiples basé sur les notes suivantes sur ${subject || "le sujet"}.
        Retournez UNIQUEMENT un JSON valide avec cette structure exacte:
        {
          "questions": [
            {
              "question": "Question ici",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correct": 0
            }
          ]
        }
        
        Notes: ${notes}`
        break

      case "mindmap":
        prompt = `Créez une carte mentale textuelle structurée basée sur les notes suivantes sur ${subject || "le sujet"}.
        Organisez les concepts principaux et leurs sous-concepts de manière hiérarchique.
        Utilisez des tirets et indentations pour montrer la structure.
        
        Notes: ${notes}`
        break

      default:
        return NextResponse.json({ error: "Type non supporté" }, { status: 400 })
    }

    // Utilisation d'OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "StudyMate",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error("Erreur lors de l'appel à OpenRouter")
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("Aucun contenu généré")
    }

    return NextResponse.json({ content })
  } catch (error: any) {
    console.error("Erreur génération IA:", error)
    return NextResponse.json({ error: "Erreur lors de la génération du contenu" }, { status: 500 })
  }
}
