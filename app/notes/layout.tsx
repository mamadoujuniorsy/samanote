"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { NoteList } from "@/components/note-list"
import { Loader2 } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  subject: {
    name: string
    color: string
  }
}

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchNotes()
    }
  }, [status, router])

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes")
      const data = await response.json()
      setNotes(data)
    } catch (error) {
      console.error("Error fetching notes:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <NoteList notes={notes} selectedNoteId={params.id as string} />
      <main className="flex-1 overflow-y-auto bg-white">
        {children}
      </main>
    </div>
  )
}
