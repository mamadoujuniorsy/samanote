import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get("subject")

    const quizzes = await prisma.quiz.findMany({
      where: {
        userId: session.user.id,
        ...(subjectId && { subjectId }),
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            quizAttempts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })


    return NextResponse.json(quizzes)

  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}