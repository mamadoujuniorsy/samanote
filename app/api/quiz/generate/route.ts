import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
