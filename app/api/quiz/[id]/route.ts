import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        subject: true,
      },
    })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz non trouvé" }, { status: 404 })
    }

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
