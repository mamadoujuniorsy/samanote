"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Search, Filter, Plus, FileText, Calendar, Tag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

interface Subject {
  id: string
  name: string
  color: string
}

export default function NotesPage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [notes, setNotes] = useState<Note[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get("subject") || "all")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      const [notesResponse, subjectsResponse] = await Promise.all([fetch("/api/notes"), fetch("/api/subjects")])

      const notesData = await notesResponse.json()
      const subjectsData = await subjectsResponse.json()

      setNotes(notesData)
      setSubjects(subjectsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === "all" || note.subject.id === selectedSubject

    return matchesSearch && matchesSubject
  })

  if (status === "loading" || loading) {
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
          <div className="flex items-center justify-between">
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
            <Link href="/notes/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle note
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mes Notes 📚</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Organisez et retrouvez facilement toutes vos notes de cours
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher dans vos notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
        </div>

        <Tabs value={selectedSubject} onValueChange={setSelectedSubject} className="space-y-6">
          <TabsList className="grid w-full grid-cols-auto">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            {subjects.map((subject) => (
              <TabsTrigger key={subject.id} value={subject.name}>
                {subject.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedSubject} className="space-y-6">
            {filteredNotes.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune note</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {selectedSubject === "all"
                      ? "Commencez par créer votre première note"
                      : "aucune note"}
                  </p>
                  <Link href="/notes/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Créer une note
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${note.subject.color}`}></div>
                          <Badge variant="secondary" className="text-xs">
                            {note.subject.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(note.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {note.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4 line-clamp-3">
                        {note.content.substring(0, 150)}...
                      </CardDescription>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {note.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Link href={`/notes/${note.id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            <FileText className="w-4 h-4 mr-1" />
                            Lire
                          </Button>
                        </Link>
                        <Link href={`/notes/${note.id}/edit`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            Modifier
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
