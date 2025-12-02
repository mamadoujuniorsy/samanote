"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Trash2, Save, Share2, MoreVertical } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { AIChat } from "@/components/ai-chat"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  subject: {
    name: string
    color: string
  }
}

export default function NotePage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && params.id) {
      fetchNote()
    }
  }, [status, params.id])

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setNote(data)
      } else {
        toast.error("Note non trouvée")
      }
    } catch (error) {
      console.error("Error fetching note:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) {
      return
    }
    try {
      const response = await fetch(`/api/notes/${params.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("Note supprimée")
        router.push("/notes")
        // Force refresh of the list (in a real app, use a context or query invalidation)
        window.location.href = "/notes" 
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  if (loading) {
    return <div className="p-8">Chargement...</div>
  }

  if (!note) {
    return <div className="p-8">Note non trouvée</div>
  }

  return (
    <div className="flex h-full bg-white dark:bg-[#191919]">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col h-full max-w-3xl mx-auto bg-white dark:bg-[#191919]">
        {/* Minimalist Toolbar */}
        <div className="flex items-center justify-between px-0 py-4 mt-8 mb-4 group">
          <div className="flex items-center gap-2 text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${note.subject.color}`}></div>
              {note.subject.name}
            </span>
            <span>•</span>
            <span>Modifié le {format(new Date(note.updatedAt), "d MMM", { locale: fr })}</span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-[#00C4CC] hover:bg-cyan-50"
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Demander à l'IA
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <Share2 className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-0 pb-32">
          <div className="group relative mb-8">
            <h1 className="text-4xl font-bold text-[#37352F] dark:text-white placeholder-gray-300 border-none focus:ring-0 p-0 bg-transparent leading-tight">
              {note.title}
            </h1>
          </div>
          
          <div className="prose prose-lg max-w-none text-[#37352F] dark:text-gray-300 leading-relaxed font-sans">
            <p className="whitespace-pre-wrap">{note.content}</p>
          </div>

          {note.tags.length > 0 && (
            <div className="mt-12 flex gap-2">
              {note.tags.map((tag) => (
                <span key={tag} className="text-sm text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <AIChat 
        noteContent={note.content} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </div>
  )
}
