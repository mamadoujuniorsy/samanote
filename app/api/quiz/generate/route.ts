import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateAIResponse } from "@/lib/ai-client"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { subjectId, title, description } = await request.json()

    if (!subjectId) {
      return NextResponse.json({ error: "ID de matière requis" }, { status: 400 })
    }

    // Récupérer toutes les notes de la matière
    const notes = await prisma.note.findMany({
      where: {
        userId: session.user.id,
        subjectId: subjectId,
      },
      include: {
        subject: true,
      },
    })

    if (notes.length === 0) {
      return NextResponse.json({ error: "Aucune note trouvée pour cette matière" }, { status: 400 })
    }

    // Combiner toutes les notes
    const combinedNotes = notes.map((note) => `${note.title}\n${note.content}`).join("\n\n")
    const subjectName = notes[0].subject.name

    // Générer le quiz avec OpenRouter
    // On demande un format JSON strict mais on gère le parsing manuellement pour plus de robustesse
    const prompt = `Tu es un générateur de quiz expert. Crée un quiz de 10 questions à choix multiples basé sur les notes suivantes.
    
    Règles strictes:
    1. Le format de sortie DOIT être un tableau JSON valide.
    2. Chaque question doit avoir exactement 4 options.
    3. L'index 'correct' doit être 0, 1, 2 ou 3.
    4. Pas de texte avant ou après le JSON.
    5. Pas de balises markdown (comme \`\`\`json).

    Format attendu:
    [
      {
        "question": "Quelle est la capitale de la France ?",
        "options": ["Paris", "Londres", "Berlin", "Madrid"],
        "correct": 0
      }
    ]
    
    Notes à utiliser:
    ${combinedNotes}`

    // On désactive le jsonMode pour éviter les erreurs de compatibilité avec certains modèles gratuits
    // et on gère le parsing nous-mêmes
    const content = await generateAIResponse({
      messages: [{ role: "user", content: prompt }],
      jsonMode: false, 
    })

    if (!content) {
      throw new Error("Aucun contenu généré")
    }

    // Parser le JSON généré avec une logique robuste
    let questions = []
    try {
      // 1. Nettoyage basique
      let cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim()
      
      // 2. Essai de parsing direct
      try {
        const parsed = JSON.parse(cleanContent)
        questions = Array.isArray(parsed) ? parsed : (parsed.questions || Object.values(parsed).find(v => Array.isArray(v)))
      } catch (e) {
        // 3. Si échec, extraction via Regex du tableau JSON
        const arrayMatch = cleanContent.match(/\[\s*\{[\s\S]*\}\s*\]/)
        if (arrayMatch) {
          questions = JSON.parse(arrayMatch[0])
        } else {
          // 4. Si toujours échec, extraction "sauvage" objet par objet
          const objectRegex = /\{\s*"question"\s*:\s*"([^"]+)"\s*,\s*"options"\s*:\s*\[([^\]]+)\]\s*,\s*"correct"\s*:\s*(\d+)\s*\}/g
          let match
          while ((match = objectRegex.exec(cleanContent)) !== null) {
            try {
              const q = {
                question: match[1],
                options: match[2].split(',').map(o => o.trim().replace(/^"|"$/g, '')),
                correct: parseInt(match[3])
              }
              questions.push(q)
            } catch (err) {
              console.error("Erreur extraction question unique:", err)
            }
          }
        }
      }

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        throw new Error("Impossible d'extraire des questions valides")
      }

    } catch (parseError: any) {
      console.error("Erreur parsing JSON:", parseError)
      console.log("Contenu brut reçu de l'IA:", content)
      return NextResponse.json({ 
        error: "Erreur lors du parsing du quiz généré.", 
        details: parseError.message || "Format JSON invalide",
        rawContent: process.env.NODE_ENV === 'development' ? content : undefined
      }, { status: 500 })
    }

    // Sauvegarder le quiz en base
    const quiz = await prisma.quiz.create({
      data: {
        title: title || `Quiz ${subjectName} - ${new Date().toLocaleDateString("fr-FR")}`,
        description: description || `Quiz généré automatiquement à partir des notes de ${subjectName}`,
        questions: questions,
        timeLimit: 300, // 5 minutes
        userId: (session.user as any).id,
        subjectId: subjectId,
      },
      include: {
        subject: true,
      },
    })

    return NextResponse.json(quiz)
  } catch (error: any) {
    console.error("Erreur génération quiz:", error)
    return NextResponse.json({ 
      error: "Erreur lors de la génération du quiz", 
      details: error.message || "Erreur inconnue" 
    }, { status: 500 })
  }
}
