"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { BookOpen, Trophy, Clock, CheckCircle, XCircle, RotateCcw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Quiz {
  id: string
  title: string
  description: string | null
  timeLimit: number
  questions: Array<{
    question: string
    options: string[]
    correct: number
  }>
  subject: {
    name: string
    color: string
  }
}

export default function PlayQuizPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [answers, setAnswers] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && params.id) {
      fetchQuiz()
    }
  }, [status, params.id, router])

  useEffect(() => {
    if (quiz && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && quiz && !showResults) {
      handleFinishQuiz()
    }
  }, [timeLeft, quiz, showResults])

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quiz/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setQuiz(data)
        setTimeLeft(data.timeLimit)
        setAnswers(new Array(data.questions.length).fill(""))
      } else {
        toast.error("Quiz non trouvé")
        router.push("/quiz")
      }
    } catch (error) {
      console.error("Error fetching quiz:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const handleNextQuestion = () => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = selectedAnswer
    setAnswers(newAnswers)
    setSelectedAnswer("")

    if (currentQuestion < quiz!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleFinishQuiz(newAnswers)
    }
  }

  const handleFinishQuiz = async (finalAnswers = answers) => {
    if (!quiz) return

    const score = calculateScore(finalAnswers)
    const timeTaken = quiz.timeLimit - timeLeft

    try {
      await fetch("/api/quiz-attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: quiz.id,
          answers: finalAnswers,
          score,
          totalQuestions: quiz.questions.length,
          timeTaken,
        }),
      })
    } catch (error) {
      console.error("Error saving quiz attempt:", error)
    }

    setShowResults(true)
  }

  const calculateScore = (finalAnswers: string[]) => {
    if (!quiz) return 0
    let correct = 0
    finalAnswers.forEach((answer, index) => {
      if (Number.parseInt(answer) === quiz.questions[index].correct) {
        correct++
      }
    })
    return correct
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setAnswers(new Array(quiz!.questions.length).fill(""))
    setSelectedAnswer("")
    setShowResults(false)
    setTimeLeft(quiz!.timeLimit)
  }

  if (status === "loading" || loading) {
    return <div>Chargement...</div>
  }

  if (!session || !quiz) {
    return null
  }

  if (showResults) {
    const score = calculateScore(answers)
    const percentage = Math.round((score / quiz.questions.length) * 100)

    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900">
        <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/quiz">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux quiz
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#007AFF] rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#007AFF]">
                  SamaNote
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Quiz terminé ! 🎉</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {score}/{quiz.questions.length}
                  </div>
                  <div className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{percentage}%</div>
                  <Badge
                    variant={percentage >= 80 ? "default" : percentage >= 60 ? "secondary" : "destructive"}
                    className="mt-2"
                  >
                    {percentage >= 80 ? "Excellent !" : percentage >= 60 ? "Bien !" : "À revoir"}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {quiz.questions.map((question, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <span className="text-sm">Question {index + 1}</span>
                      {Number.parseInt(answers[index]) === question.correct ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button onClick={restartQuiz} variant="outline" className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Recommencer
                  </Button>
                  <Link href="/quiz" className="flex-1">
                    <Button className="w-full">Autres quiz</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900">
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/quiz">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Abandonner
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
        <div className="max-w-2xl mx-auto">
          {/* Quiz Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    {quiz.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-3 h-3 rounded-full ${quiz.subject.color}`}></div>
                    <Badge variant="secondary" className="text-xs">
                      {quiz.subject.name}
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Question {currentQuestion + 1} sur {quiz.questions.length}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>
              <Progress value={((currentQuestion + 1) / quiz.questions.length) * 100} className="mt-4" />
            </CardHeader>
          </Card>

          {/* Question */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{quiz.questions[currentQuestion].question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                {quiz.questions[currentQuestion].options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                >
                  Précédent
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswer}
                  className="bg-[#007AFF] hover:bg-blue-700"
                >
                  {currentQuestion === quiz.questions.length - 1 ? "Terminer" : "Suivant"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
