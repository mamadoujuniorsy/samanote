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
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (status === "authenticated" && params.id) {
      fetchNote()
      // Simulate AI suggestions
      setAiSuggestions(["Résumé disponible", "3 concepts clés identifiés", "Lien vers 'Biologie Cellulaire'"])
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
    <div className="flex h-full">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto bg-white">
        {/* Minimalist Toolbar */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-transparent hover:border-gray-100 transition-colors">
          <div className="text-sm text-muted-foreground">
            Dernière modification {format(new Date(note.updatedAt), "d MMM yyyy à HH:mm", { locale: fr })}
          </div>
          <div className="flex items-center gap-2">
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
        <div className="flex-1 overflow-y-auto px-12 py-8">
          <input
            type="text"
            value={note.title}
            readOnly // For now, read-only until edit logic is added
            className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 p-0 mb-6 bg-transparent"
            placeholder="Titre de la note"
          />
          
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {/* Simple textarea for editing or div for display. Using div for display as per request for "Readability" */}
            <p className="whitespace-pre-wrap">{note.content}</p>
          </div>

          {note.tags.length > 0 && (
            <div className="mt-8 flex gap-2">
              {note.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-gray-500 border-gray-200">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Margin - AI Suggestions */}
      <div className="w-64 border-l bg-gray-50/30 p-4 hidden xl:block">
        <div className="sticky top-4 space-y-4">
          <div className="flex items-center gap-2 text-ai-accent font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Assistant IA</span>
          </div>
          
          {aiSuggestions.map((suggestion, index) => (
            <div key={index} className="p-3 rounded-lg bg-white border border-gray-100 shadow-sm text-sm text-gray-600 hover:border-ai-accent/50 cursor-pointer transition-colors">
              {suggestion}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
