"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Brain, FileText, Trophy, Calendar, TrendingUp, Plus, Search, LogOut, Upload } from "lucide-react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Subject {
  id: string
  name: string
  description: string | null
  color: string
  _count: {
    notes: number
  }
}

interface Note {
  id: string
  title: string
  createdAt: string
  subject: {
    name: string
  }
}

interface QuizAttempt {
  id: string
  score: number
  totalQuestions: number
  completedAt: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      const [subjectsResponse, notesResponse, attemptsResponse] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/notes?limit=5"),
        fetch("/api/quiz-attempts?limit=5"),
      ])

      const subjectsData = await subjectsResponse.json()
      const notesData = await notesResponse.json()
      const attemptsData = await attemptsResponse.json()

      setSubjects(subjectsData)
      setNotes(notesData)
      setQuizAttempts(attemptsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" })
  }

  const getSubjectProgress = (noteCount: number) => {
    return Math.min(noteCount * 10, 100)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <p>Chargement...</p>
        </div>
      </div>
    )
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SamaNote
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bonjour, {session.user?.name || "Étudiant"} ! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Prêt à continuer tes études ? Tu as {subjects.length} matières et {notes.length} notes.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Notes totales</p>
                  <p className="text-3xl font-bold">{notes.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Quiz réussis</p>
                  <p className="text-3xl font-bold">{quizAttempts.length}</p>
                </div>
                <Trophy className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Matières</p>
                  <p className="text-3xl font-bold">{subjects.length}</p>
                </div>
                <Brain className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Score moyen</p>
                  <p className="text-3xl font-bold">
                    {quizAttempts.length > 0
                      ? Math.round(
                          quizAttempts.reduce(
                            (acc, attempt) => acc + (attempt.score / attempt.totalQuestions) * 100,
                            0,
                          ) / quizAttempts.length,
                        )
                      : 0}
                    %
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subjects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Matières</h3>
              <Link href="/subjects/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle matière
                </Button>
              </Link>
            </div>

            {subjects.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune matière</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Commencez par créer votre première matière</p>
                  <Link href="/subjects/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Créer une matière
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subjects.map((subject) => {
                  const progress = getSubjectProgress(subject._count.notes)

                  return (
                    <Card key={subject.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${subject.color}`}></div>
                            <CardTitle className="text-lg">{subject.name}</CardTitle>
                          </div>
                          <Badge variant="secondary">{subject._count.notes} notes</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                            <span>Progression</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex gap-2 pt-2">
                            <Link href={`/notes?subject=${subject.id}`} className="flex-1">
                              <Button size="sm" variant="outline" className="w-full">
                                <FileText className="w-4 h-4 mr-1" />
                                Notes
                              </Button>
                            </Link>
                            <Link href={`/quiz?subject=${subject.id}`} className="flex-1">
                              <Button size="sm" variant="outline" className="w-full">
                                <Brain className="w-4 h-4 mr-1" />
                                Quiz
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notes.slice(0, 3).map((note) => (
                  <div key={note.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="w-2 h-2 rounded-full mt-2 bg-blue-500"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{note.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{note.subject.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))}
                {notes.length === 0 && <p className="text-center text-gray-500 py-4">Aucune activité récente</p>}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/notes/new">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle note
                  </Button>
                </Link>
                <Link href="/pdf-analyzer">
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Analyser un PDF
                  </Button>
                </Link>
                <Link href="/ai/generate">
                  <Button className="w-full justify-start" variant="outline">
                    <Brain className="w-4 h-4 mr-2" />
                    Générer une fiche
                  </Button>
                </Link>
                <Link href="/quiz/create">
                  <Button className="w-full justify-start" variant="outline">
                    <Trophy className="w-4 h-4 mr-2" />
                    Créer un quiz
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
