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

    const body = await request.json().catch(() => null)
    
    if (!body) {
      return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 })
    }

    const { notes, type, subject } = body

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

    const content = await generateAIResponse({
      messages: [{ role: "user", content: prompt }],
      jsonMode: type === "quiz",
    })

    let finalContent = content

    // Nettoyage spécifique pour le format JSON (quiz)
    if (type === "quiz" && content) {
      try {
        // Enlever les balises markdown si présentes
        const clean = content.replace(/```json/g, "").replace(/```/g, "").trim()
        // Vérifier si c'est du JSON valide
        JSON.parse(clean)
        finalContent = clean
      } catch (e) {
        // Si invalide, essayer d'extraire le JSON
        const match = content.match(/\{[\s\S]*\}/)
        if (match) {
          finalContent = match[0]
        }
      }
    }

    return NextResponse.json({ content: finalContent })
  } catch (error: any) {
    console.error("Erreur génération IA:", error)
    return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 })
  }
}
