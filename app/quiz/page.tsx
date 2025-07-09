"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Trophy, Calendar, Plus, ArrowLeft, Play, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Quiz {
  id: string
  title: string
  description: string | null
  timeLimit: number
  createdAt: string
  subject: {
    id: string
    name: string
    color: string
  }
  _count: {
    quizAttempts: number
  }
}

export default function QuizListPage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const subjectFilter = searchParams.get("subject")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchQuizzes()
    }
  }, [status, router, subjectFilter])

  const fetchQuizzes = async () => {
    try {
      const url = subjectFilter ? `/api/quiz?subject=${subjectFilter}` : "/api/quiz"
      const response = await fetch(url)
      const data = await response.json()
      setQuizzes(data)

    } catch (error) {
      console.error("Error fetching quizzes:", error)
    } finally {
      setLoading(false)
    }
  }

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
            <Link href="/quiz/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Créer un quiz
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mes Quiz 🧠</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Testez vos connaissances avec des quiz générés à partir de vos notes
          </p>
        </div>

        {quizzes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun quiz</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Créez votre premier quiz à partir de vos notes</p>
              <Link href="/quiz/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un quiz
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${quiz.subject.color}`}></div>
                      <Badge variant="secondary" className="text-xs">
                        {quiz.subject.name}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(quiz.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{quiz.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-2">
                    {quiz.description || "Quiz généré automatiquement"}
                  </CardDescription>
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {Math.floor(quiz.timeLimit / 60)} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {quiz._count.quizAttempts} tentatives
                    </div>
                  </div>
                  <Link href={`/quiz/${quiz.id}/play`}>
                    <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                      <Play className="w-4 h-4 mr-2" />
                      Commencer le quiz
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
