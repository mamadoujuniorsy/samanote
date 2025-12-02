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
    const prompt = `Créez un quiz de 10 questions à choix multiples basé sur les notes suivantes sur ${subjectName}.
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
    
    Notes: ${combinedNotes}`

    const content = await generateAIResponse({
      messages: [{ role: "user", content: prompt }],
      jsonMode: true,
    })

    if (!content) {
      throw new Error("Aucun contenu généré")
    }

    // Parser le JSON généré
    let questions
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]).questions
      } else {
        throw new Error("Format JSON invalide")
      }
    } catch (parseError) {
      console.error("Erreur parsing JSON:", parseError)
      return NextResponse.json({ error: "Erreur lors du parsing du quiz généré" }, { status: 500 })
    }

    // Sauvegarder le quiz en base
    const quiz = await prisma.quiz.create({
      data: {
        title: title || `Quiz ${subjectName} - ${new Date().toLocaleDateString("fr-FR")}`,
        description: description || `Quiz généré automatiquement à partir des notes de ${subjectName}`,
        questions: questions,
        timeLimit: 300, // 5 minutes
        userId: session.user.id,
        subjectId: subjectId,
      },
      include: {
        subject: true,
      },
    })

    return NextResponse.json(quiz)
  } catch (error: any) {
    console.error("Erreur génération quiz:", error)
    return NextResponse.json({ error: "Erreur lors de la génération du quiz" }, { status: 500 })
  }
}
