"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, Square, Volume2, Download, Loader2, Sparkles, Mic } from "lucide-react"
import { toast } from "sonner"

interface AudioPlayerProps {
  text: string
  title?: string
  noteId?: string
}

interface AudioInstructions {
  voice: string
  rate: number
  pitch: number
  volume: number
}

export function AudioPlayer({ text, title = "Note", noteId }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancedText, setEnhancedText] = useState("")
  const [ssmlText, setSsmlText] = useState("")
  const [currentText, setCurrentText] = useState(text)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState([80])
  const [playbackRate, setPlaybackRate] = useState("1")
  const [voice, setVoice] = useState("fr-FR")
  const [audioMethod, setAudioMethod] = useState("standard")

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  // Nettoyer les ressources au démontage
  useEffect(() => {
    return () => {
      if (speechRef.current) {
        speechSynthesis.cancel()
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [])

  // Améliorer le texte avec OpenRouter
  const enhanceTextWithAI = async (method: "enhanced" | "ssml") => {
    setIsEnhancing(true)
    try {
      const response = await fetch("/api/audio/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice,
          noteId,
          title,
          method,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'amélioration")
      }

      const data = await response.json()

      if (method === "enhanced") {
        setEnhancedText(data.enhancedText)
        setCurrentText(data.enhancedText)
        setAudioMethod("enhanced")
        toast.success("Texte amélioré pour l'audio !")
      } else if (method === "ssml") {
        setSsmlText(data.ssmlText)
        setCurrentText(data.ssmlText)
        setAudioMethod("ssml")
        toast.success("SSML généré pour une meilleure prononciation !")
      }
    } catch (error) {
      toast.error("Erreur lors de l'amélioration du texte")
      console.error(error)
    } finally {
      setIsEnhancing(false)
    }
  }

  // Obtenir les voix disponibles
  const getAvailableVoices = () => {
    const voices = speechSynthesis.getVoices()
    const frenchVoices = voices.filter((voice) => voice.lang.startsWith("fr") || voice.lang.includes("FR"))
    return frenchVoices.length > 0 ? frenchVoices : voices.slice(0, 5)
  }

  // Lecture avec Web Speech API améliorée
  const playWithWebSpeech = () => {
    if (speechSynthesis.speaking) {
      if (speechSynthesis.paused) {
        speechSynthesis.resume()
        setIsPaused(false)
        startProgressTracking()
      } else {
        speechSynthesis.pause()
        setIsPaused(true)
        stopProgressTracking()
      }
      return
    }

    const utterance = new SpeechSynthesisUtterance(currentText)

    // Configuration avancée
    utterance.rate = Number.parseFloat(playbackRate)
    utterance.volume = volume[0] / 100
    utterance.pitch = 1.0

    // Sélection de la voix
    const voices = getAvailableVoices()
    const selectedVoice = voices.find((v) => v.name === voice || v.lang === voice)
    if (selectedVoice) {
      utterance.voice = selectedVoice
    } else {
      utterance.lang = voice
    }

    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
      startProgressTracking()
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
      setProgress(0)
      stopProgressTracking()
    }

    utterance.onerror = (event) => {
      toast.error(`Erreur lors de la lecture: ${event.error}`)
      setIsPlaying(false)
      setIsPaused(false)
      stopProgressTracking()
    }

    // Gestion des pauses pour les longs textes
    utterance.onboundary = (event) => {
      if (event.name === "sentence") {
        // Petite pause entre les phrases
        setTimeout(() => {}, 100)
      }
    }

    speechRef.current = utterance
    speechSynthesis.speak(utterance)
  }

  const startProgressTracking = () => {
    progressInterval.current = setInterval(() => {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        setProgress((prev) => Math.min(prev + 1, 100))
      }
    }, 200)
  }

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
      progressInterval.current = null
    }
  }

  const stopAudio = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setProgress(0)
    stopProgressTracking()
  }

  const downloadText = () => {
    const blob = new Blob([currentText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, "_")}_${audioMethod}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <Tabs defaultValue="player" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="player">🎵 Lecteur</TabsTrigger>
            <TabsTrigger value="enhance">✨ Améliorer</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="player" className="space-y-4">
            {/* Contrôles principaux */}
            <div className="flex items-center gap-3">
              <Button onClick={playWithWebSpeech} disabled={isEnhancing} className="flex-shrink-0">
                {isPlaying && !isPaused ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              <Button
                onClick={stopAudio}
                variant="outline"
                disabled={!isPlaying && !isPaused}
                className="flex-shrink-0"
              >
                <Square className="w-4 h-4" />
              </Button>

              {/* Barre de progression */}
              <div className="flex-1">
                <div className="space-y-1">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-blue-500 transition-all duration-300 ${isPlaying ? "animate-pulse" : ""}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Méthode: {audioMethod}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>

              <Button onClick={downloadText} variant="outline" size="sm" className="flex-shrink-0">
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {/* Aperçu du texte */}
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg max-h-32 overflow-y-auto">
              <p className="text-sm text-gray-600 dark:text-gray-300">{currentText.substring(0, 200)}...</p>
            </div>
          </TabsContent>

          <TabsContent value="enhance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                      <h4 className="font-medium">Texte amélioré</h4>
                    </div>
                    <p className="text-sm text-gray-600">L'IA reformule le texte pour une meilleure écoute</p>
                    <Button onClick={() => enhanceTextWithAI("enhanced")} disabled={isEnhancing} className="w-full">
                      {isEnhancing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Améliorer le texte
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mic className="w-5 h-5 text-green-500" />
                      <h4 className="font-medium">SSML avancé</h4>
                    </div>
                    <p className="text-sm text-gray-600">Génère des balises pour une prononciation optimale</p>
                    <Button
                      onClick={() => enhanceTextWithAI("ssml")}
                      disabled={isEnhancing}
                      variant="outline"
                      className="w-full"
                    >
                      {isEnhancing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Mic className="w-4 h-4 mr-2" />
                      )}
                      Générer SSML
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Prévisualisation des améliorations */}
            {(enhancedText || ssmlText) && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Aperçu du texte amélioré:</h4>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg max-h-40 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap">{enhancedText || ssmlText}</pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Volume */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Volume: {volume[0]}%</span>
                </div>
                <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="w-full" />
              </div>

              {/* Vitesse */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Vitesse de lecture</label>
                <Select value={playbackRate} onValueChange={setPlaybackRate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x (Très lent)</SelectItem>
                    <SelectItem value="0.75">0.75x (Lent)</SelectItem>
                    <SelectItem value="1">1x (Normal)</SelectItem>
                    <SelectItem value="1.25">1.25x (Rapide)</SelectItem>
                    <SelectItem value="1.5">1.5x (Très rapide)</SelectItem>
                    <SelectItem value="2">2x (Ultra rapide)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Voix */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Voix</label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr-FR">Français (France)</SelectItem>
                    <SelectItem value="fr-CA">Français (Canada)</SelectItem>
                    <SelectItem value="fr-BE">Français (Belgique)</SelectItem>
                    <SelectItem value="fr-CH">Français (Suisse)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Méthode audio */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Méthode actuelle</label>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                  {audioMethod === "enhanced" && "✨ Texte amélioré par IA"}
                  {audioMethod === "ssml" && "🎤 SSML avec balises avancées"}
                  {audioMethod === "standard" && "🔊 Synthèse vocale standard"}
                </div>
              </div>
            </div>

            {/* Bouton reset */}
            <Button
              onClick={() => {
                setCurrentText(text)
                setEnhancedText("")
                setSsmlText("")
                setAudioMethod("standard")
                toast.success("Paramètres réinitialisés")
              }}
              variant="outline"
              className="w-full"
            >
              Réinitialiser au texte original
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
