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

    const note = await prisma.note.findFirst({
      where: {
        id: params.id,
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

    if (!note) {
      return NextResponse.json({ error: "Note non trouvée" }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error("Error fetching note:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { title, content, subjectId, tags } = await request.json()

    if (!title || !content || !subjectId) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    const note = await prisma.note.updateMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        title,
        content,
        subjectId,
        tags: tags || [],
        updatedAt: new Date(),
      },
    })

    if (note.count === 0) {
      return NextResponse.json({ error: "Note non trouvée" }, { status: 404 })
    }

    const updatedNote = await prisma.note.findFirst({
      where: {
        id: params.id,
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

    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const deletedNote = await prisma.note.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (deletedNote.count === 0) {
      return NextResponse.json({ error: "Note non trouvée" }, { status: 404 })
    }

    return NextResponse.json({ message: "Note supprimée avec succès" })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
