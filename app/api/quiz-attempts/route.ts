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
    const limit = searchParams.get("limit")

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        quiz: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
      ...(limit && { take: Number.parseInt(limit) }),
    })

    return NextResponse.json(attempts)
  } catch (error) {
    console.error("Error fetching quiz attempts:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { quizId, answers, score, totalQuestions, timeTaken } = await request.json()

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        answers,
        score,
        totalQuestions,
        timeTaken,
        userId: session.user.id,
      },
    })

    return NextResponse.json(attempt)
  } catch (error) {
    console.error("Error creating quiz attempt:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
