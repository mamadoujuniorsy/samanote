"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Upload, FileText, Brain, Sparkles, Copy, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MindMapRenderer } from "@/components/analysis-renderers/mindmap-renderer"
import { FlashcardsRenderer } from "@/components/analysis-renderers/flashcards-renderer"
import { KeyPointsRenderer } from "@/components/analysis-renderers/key-points-renderer"
import { SummaryRenderer } from "@/components/analysis-renderers/summary-renderer"

interface Subject {
  id: string
  name: string
  color: string
}

interface Analysis {
  id: string
  title: string
  content: string
  type: string
}

export default function PDFAnalyzerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [analysisType, setAnalysisType] = useState("summary")
  const [subjectId, setSubjectId] = useState("")
  const [title, setTitle] = useState("")
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [originalText, setOriginalText] = useState("")
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchSubjects()
    }
  }, [status, router])

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects")
      const data = await response.json()
      setSubjects(data)
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile)
        if (!title) {
          setTitle(droppedFile.name.replace(".pdf", ""))
        }
      } else {
        toast.error("Seuls les fichiers PDF sont acceptés")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile)
        if (!title) {
          setTitle(selectedFile.name.replace(".pdf", ""))
        }
      } else {
        toast.error("Seuls les fichiers PDF sont acceptés")
      }
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Veuillez sélectionner un fichier PDF")
      return
    }

    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("analysisType", analysisType)
      formData.append("title", title)
      if (subjectId) {
        formData.append("subjectId", subjectId)
      }

      const response = await fetch("/api/pdf/analyze", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysis(data.analysis)
        setOriginalText(data.originalText)
        toast.success("PDF analysé avec succès !")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Erreur lors de l'analyse")
      }
    } catch (error) {
      toast.error("Erreur lors de l'analyse du PDF")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const copyToClipboard = async () => {
    if (analysis) {
      try {
        await navigator.clipboard.writeText(analysis.content)
        toast.success("Contenu copié dans le presse-papiers !")
      } catch (error) {
        toast.error("Erreur lors de la copie")
      }
    }
  }

  const resetAnalysis = () => {
    setFile(null)
    setAnalysis(null)
    setOriginalText("")
    setTitle("")
  }

  const renderAnalysisContent = () => {
    if (!analysis) return null

    switch (analysis.type) {
      case "mindmap":
        return <MindMapRenderer content={analysis.content} />
      case "flashcards":
        return <FlashcardsRenderer content={analysis.content} />
      case "key_points":
        return <KeyPointsRenderer content={analysis.content} />
      case "summary":
      default:
        return <SummaryRenderer content={analysis.content} />
    }
  }

  if (status === "loading") {
    return <div>Chargement...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900">
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            Analyseur de PDF 📄
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Uploadez un PDF de cours et obtenez automatiquement des résumés, cartes mentales ou fiches de révision
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Upload de PDF
                </CardTitle>
                <CardDescription>Glissez-déposez votre PDF ou cliquez pour sélectionner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drag & Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="space-y-2">
                      <FileText className="w-12 h-12 mx-auto text-green-600" />
                      <p className="font-medium text-green-600">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                        Changer de fichier
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 mx-auto text-gray-400" />
                      <div>
                        <p className="text-lg font-medium">Glissez votre PDF ici</p>
                        <p className="text-sm text-gray-500">ou cliquez pour sélectionner</p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="pdf-upload"
                        ref={(input) => {
                          if (input) {
                            ;(window as any).pdfFileInput = input
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => {
                          const input = document.getElementById("pdf-upload") as HTMLInputElement
                          if (input) input.click()
                        }}
                      >
                        Sélectionner un PDF
                      </Button>
                    </div>
                  )}
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre (optionnel)</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Cours de Mathématiques - Chapitre 5"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="analysisType">Type d'analyse</Label>
                    <Select value={analysisType} onValueChange={setAnalysisType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <span className="text-xs">📄</span>
                            </div>
                            <span>Résumé structuré</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="mindmap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                              <span className="text-xs">🗺️</span>
                            </div>
                            <span>Carte mentale</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="flashcards">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                              <span className="text-xs">🎯</span>
                            </div>
                            <span>Fiches de révision</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="key_points">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center">
                              <span className="text-xs">💡</span>
                            </div>
                            <span>Points essentiels</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Matière (optionnel)</Label>
                    <Select value={subjectId} onValueChange={setSubjectId}>
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
                    <p className="text-xs text-gray-500 mt-1">
                      Si sélectionnée, l'analyse sera aussi sauvegardée comme note
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={!file || isAnalyzing}
                  className="w-full bg-[#007AFF] hover:bg-blue-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyser le PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#00C4CC]" />
                  Comment ça marche ?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                    1
                  </div>
                  <p>Uploadez votre PDF de cours (max 10MB)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                    2
                  </div>
                  <p>L'IA extrait et analyse automatiquement le contenu</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                    3
                  </div>
                  <p>Obtenez un résumé, carte mentale ou fiches selon votre choix</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                    4
                  </div>
                  <p>Sauvegardez le résultat dans vos notes si souhaité</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-green-600" />
                    Résultat de l'analyse
                  </span>
                  {analysis && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={copyToClipboard}>
                        <Copy className="w-4 h-4 mr-1" />
                        Copier
                      </Button>
                      <Button size="sm" variant="outline" onClick={resetAnalysis}>
                        Nouvelle analyse
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis ? (
                  <Tabs defaultValue="visual" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="visual">Visualisation</TabsTrigger>
                      <TabsTrigger value="raw">Texte brut</TabsTrigger>
                      <TabsTrigger value="original">Texte extrait</TabsTrigger>
                    </TabsList>
                    <TabsContent value="visual" className="space-y-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <h4 className="font-medium text-green-800 dark:text-green-200">{analysis.title}</h4>
                      </div>
                      {renderAnalysisContent()}
                    </TabsContent>
                    <TabsContent value="raw">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
                          {analysis.content}
                        </pre>
                      </div>
                    </TabsContent>
                    <TabsContent value="original">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
                          {originalText}
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>L'analyse de votre PDF apparaîtra ici</p>
                    <p className="text-sm">Uploadez un PDF et cliquez sur "Analyser"</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {analysis && (
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
                  <Link href="/ai/generate">
                    <Button className="w-full justify-start" variant="outline">
                      <Brain className="w-4 h-4 mr-2" />
                      Analyser davantage avec l'IA
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
