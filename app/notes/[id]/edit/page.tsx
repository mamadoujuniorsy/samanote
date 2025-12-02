"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ArrowLeft, Loader2, Plus, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  subjectId: string
  subject: {
    name: string
    color: string
  }
}

interface Subject {
  id: string
  name: string
  color: string
}

export default function EditNotePage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && params.id) {
      fetchData()
    }
  }, [status, params.id, router])

  const fetchData = async () => {
    try {
      const [noteResponse, subjectsResponse] = await Promise.all([
        fetch(`/api/notes/${params.id}`),
        fetch("/api/subjects"),
      ])

      if (noteResponse.ok && subjectsResponse.ok) {
        const noteData = await noteResponse.json()
        const subjectsData = await subjectsResponse.json()

        setNote(noteData)
        setTitle(noteData.title)
        setContent(noteData.content)
        setSubjectId(noteData.subjectId)
        setTags(noteData.tags || [])
        setSubjects(subjectsData)
      } else {
        toast.error("Note non trouvée")
        router.push("/notes")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/notes/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          subjectId,
          tags,
        }),
      })

      if (response.ok) {
        toast.success("Note modifiée avec succès !")
        router.push(`/notes/${params.id}`)
      } else {
        const data = await response.json()
        toast.error(data.error || "Erreur lors de la modification")
      }
    } catch (error) {
      toast.error("Erreur lors de la modification")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!session || !note) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/notes/${note.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#007AFF] rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[#007AFF]">
                StudyMate
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Modifier la Note ✏️</h2>
            <p className="text-gray-600 dark:text-gray-300">Modifiez votre note</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contenu de la note</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre de la note *</Label>
                      <Input
                        id="title"
                        placeholder="Ex: Les dérivées - Cours complet"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Contenu *</Label>
                      <Textarea
                        id="content"
                        placeholder="Écrivez votre note ici..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={15}
                        className="font-mono"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Paramètres</CardTitle>
                    <CardDescription>Configurez votre note</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Matière *</Label>
                      <Select value={subjectId} onValueChange={setSubjectId} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une matière" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${subject.color}`}></div>
                                {subject.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ajouter un tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" size="sm" onClick={addTag}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full bg-[#007AFF] hover:bg-blue-700"
                      disabled={saving || !title.trim() || !content.trim() || !subjectId}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sauvegarde...
                        </>
                      ) : (
                        "Sauvegarder les modifications"
                      )}
                    </Button>
                    <Link href={`/notes/${note.id}`}>
                      <Button type="button" variant="outline" className="w-full">
                        Annuler
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
