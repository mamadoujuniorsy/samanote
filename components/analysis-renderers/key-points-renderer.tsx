"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface KeyPointsRendererProps {
  content: string
}

export function KeyPointsRenderer({ content }: KeyPointsRendererProps) {
  const sections = parseKeyPoints(content)

  function parseKeyPoints(markdown: string) {
    const sections: Record<string, { title: string; emoji: string; items: string[] }> = {
      concepts: { title: "Concepts Clés", emoji: "🎯", items: [] },
      definitions: { title: "Définitions", emoji: "📚", items: [] },
      points: { title: "Points à Retenir", emoji: "💡", items: [] },
      formulas: { title: "Formules/Méthodes", emoji: "📋", items: [] },
    }

    let currentSection = ""

    markdown.split("\n").forEach((line) => {
      if (line.includes("Concepts Clés")) {
        currentSection = "concepts"
      } else if (line.includes("Définitions")) {
        currentSection = "definitions"
      } else if (line.includes("Points à Retenir")) {
        currentSection = "points"
      } else if (line.includes("Formules/Méthodes")) {
        currentSection = "formulas"
      } else if (line.trim().startsWith("- ") && currentSection) {
        sections[currentSection].items.push(line.trim().substring(2))
      }
    })

    return sections
  }

  return (
    <div className="key-points-container">
      <Tabs defaultValue="concepts">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="concepts">🎯 Concepts</TabsTrigger>
          <TabsTrigger value="definitions">📚 Définitions</TabsTrigger>
          <TabsTrigger value="points">💡 Points</TabsTrigger>
          <TabsTrigger value="formulas">📋 Formules</TabsTrigger>
        </TabsList>

        {Object.entries(sections).map(([key, section]) => (
          <TabsContent key={key} value={key} className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <span className="mr-2">{section.emoji}</span>
                  {section.title}
                </h3>

                <ul className="space-y-3">
                  {section.items.map((item, index) => (
                    <li key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      {item}
                    </li>
                  ))}

                  {section.items.length === 0 && (
                    <li className="text-gray-500 italic">Aucun élément trouvé dans cette section</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
