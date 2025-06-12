"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Brain, FileText, Sparkles, Copy, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Subject {
  id: string
  name: string
  color: string
}

interface Note {
  id: string
  title: string
  content: string
  subject: {
    name: string
  }
}

export default function AIGeneratePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [inputNotes, setInputNotes] = useState("")
  const [contentType, setContentType] = useState("summary")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      const [subjectsResponse, notesResponse] = await Promise.all([fetch("/api/subjects"), fetch("/api/notes?limit=5")])

      const subjectsData = await subjectsResponse.json()
      const notesData = await notesResponse.json()

      setSubjects(subjectsData)
      setNotes(notesData)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleGenerate = async () => {
    if (!inputNotes.trim()) {
      toast.error("Veuillez saisir des notes à transformer")
      return
    }

    setIsGenerating(true)

    try {
      const subjectName = subjects.find((s) => s.id === selectedSubject)?.name || "le sujet"

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: inputNotes,
          type: contentType,
          subject: subjectName,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la génération")
      }

      const data = await response.json()
      setGeneratedContent(data.content)
      toast.success("Contenu généré avec succès !")
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la génération")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent)
      toast.success("Contenu copié dans le presse-papiers !")
    } catch (error) {
      toast.error("Erreur lors de la copie")
    }
  }

  if (status === "loading") {
    return <div>Chargement...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SamaNote
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            Générateur IA 🤖
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Transformez vos notes en résumés, fiches de révision ou quiz personnalisés
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Configuration
                </CardTitle>
                <CardDescription>Choisissez le type de contenu à générer et vos notes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type de contenu</label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">📄 Résumé</SelectItem>
                      <SelectItem value="flashcard">🎯 Fiches de révision</SelectItem>
                      <SelectItem value="quiz">❓ Questions de quiz</SelectItem>
                      <SelectItem value="mindmap">🗺️ Carte mentale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Matière (optionnel)</label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
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

                <div>
                  <label className="text-sm font-medium mb-2 block">Vos notes</label>
                  <Textarea
                    placeholder="Collez ici vos notes de cours que vous souhaitez transformer..."
                    value={inputNotes}
                    onChange={(e) => setInputNotes(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!inputNotes.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Générer avec l'IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Mes notes récentes</CardTitle>
                <CardDescription>Cliquez pour utiliser une note existante</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {notes.slice(0, 3).map((note) => (
                  <Button
                    key={note.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => setInputNotes(note.content)}
                  >
                    <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                    <div className="truncate">
                      <div className="font-medium">{note.title}</div>
                      <div className="text-xs text-gray-500">{note.subject.name}</div>
                    </div>
                  </Button>
                ))}
                {notes.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    <Link href="/notes/new" className="text-blue-600 hover:underline">
                      Créez d'abord quelques notes
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    Contenu généré
                  </span>
                  {generatedContent && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={copyToClipboard}>
                        <Copy className="w-4 h-4 mr-1" />
                        Copier
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      {generatedContent}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Le contenu généré apparaîtra ici</p>
                    <p className="text-sm">Ajoutez vos notes et cliquez sur "Générer"</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {generatedContent && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copier le contenu
                  </Button>
                  <Link href="/notes/new">
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Créer une note avec ce contenu
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
