"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react"

interface Flashcard {
  title: string
  question: string
  answer: string
}

interface FlashcardsRendererProps {
  content: string
}

export function FlashcardsRenderer({ content }: FlashcardsRendererProps) {
  const [currentCard, setCurrentCard] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const flashcards = parseFlashcards(content)

  function parseFlashcards(markdown: string): Flashcard[] {
    const cards: Flashcard[] = []
    const regex = /## Fiche \d+: (.*?)\s*\*\*Question\*\*: (.*?)\s*\*\*Réponse\*\*: (.*?)(?=## Fiche|\n\n\n|$)/gs

    let match
    while ((match = regex.exec(markdown)) !== null) {
      cards.push({
        title: match[1].trim(),
        question: match[2].trim(),
        answer: match[3].trim(),
      })
    }

    return cards
  }

  const handlePrevious = () => {
    setFlipped(false)
    setCurrentCard((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setFlipped(false)
    setCurrentCard((prev) => (prev === flashcards.length - 1 ? 0 : prev + 1))
  }

  const handleFlip = () => {
    setFlipped(!flipped)
  }

  if (flashcards.length === 0) {
    return <div className="text-center p-4">Aucune fiche trouvée dans le contenu</div>
  }

  return (
    <div className="flashcards-container">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500">
          Fiche {currentCard + 1} sur {flashcards.length}
        </p>
      </div>

      <Card
        className={`relative h-80 cursor-pointer transition-all duration-500 ${
          flipped ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"
        }`}
        onClick={handleFlip}
      >
        <div className="absolute top-2 right-2 text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded-full">
          {flashcards[currentCard].title}
        </div>

        <CardContent className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            {flipped ? (
              <div className="animate-fade-in">
                <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Réponse:</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">{flashcards[currentCard].answer}</div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Question:</h3>
                <p className="text-xl font-medium">{flashcards[currentCard].question}</p>
                <p className="mt-4 text-sm text-gray-500">(Cliquez pour voir la réponse)</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={handlePrevious}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Précédente
        </Button>

        <Button variant="outline" onClick={handleFlip}>
          <RotateCw className="w-4 h-4 mr-2" />
          Retourner
        </Button>

        <Button variant="outline" onClick={handleNext}>
          Suivante
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
