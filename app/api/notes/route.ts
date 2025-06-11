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
    const subjectId = searchParams.get("subject")

    const notes = await prisma.note.findMany({
      where: {
        userId: session.user.id,
        ...(subjectId && { subjectId }),
      },
      include: {
        subject: {
          select: {
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(limit && { take: Number.parseInt(limit) }),
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { title, content, subjectId, tags } = await request.json()

    if (!title || !content || !subjectId) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        subjectId,
        tags: tags || [],
        userId: session.user.id,
      },
      include: {
        subject: {
          select: {
            name: true,
            color: true,
          },
        },
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
