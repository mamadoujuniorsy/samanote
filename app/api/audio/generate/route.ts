import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateAIResponse } from "@/lib/ai-client"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { text, voice = "alloy", noteId, title, method = "enhanced" } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Texte requis" }, { status: 400 })
    }

    // Vérifier si l'audio existe déjà en cache
    if (noteId) {
      const existingAudio = await prisma.generatedContent.findFirst({
        where: {
          userId: session.user.id,
          noteId: noteId,
          type: "audio",
        },
      })

      if (existingAudio) {
        console.log("Audio existant trouvé:", existingAudio.id)
      }
    }

    if (method === "enhanced") {
      // Méthode 1: Améliorer le texte avec OpenRouter pour une meilleure lecture
      const enhancedText = await enhanceTextForSpeech(text)

      // Utiliser Web Speech API côté serveur avec le texte amélioré
      return NextResponse.json({
        enhancedText,
        method: "enhanced_web_speech",
        instructions: {
          voice: voice,
          rate: 1.0,
          pitch: 1.0,
          volume: 0.8,
        },
      })
    } else if (method === "ssml") {
      // Méthode 2: Générer du SSML pour une meilleure prononciation
      const ssmlText = await generateSSML(text)

      return NextResponse.json({
        ssmlText,
        method: "ssml",
        instructions: {
          voice: voice,
          rate: 1.0,
          pitch: 1.0,
          volume: 0.8,
        },
      })
    } else {
      // Méthode 3: Fallback vers Web Speech API standard
      return NextResponse.json({
        text: text.substring(0, 4096),
        method: "web_speech",
        instructions: {
          voice: voice,
          rate: 1.0,
          pitch: 1.0,
          volume: 0.8,
        },
      })
    }
  } catch (error: any) {
    console.error("Erreur génération audio:", error)
    return NextResponse.json({ error: "Erreur lors de la génération audio" }, { status: 500 })
  }
}

async function enhanceTextForSpeech(text: string): Promise<string> {
  try {
    const content = await generateAIResponse({
      messages: [
        {
          role: "user",
          content: `Améliore ce texte pour qu'il soit plus agréable à écouter en synthèse vocale. 
        Ajoute des pauses naturelles, reformule les phrases complexes, et rends le contenu plus fluide pour l'écoute.
        Garde le même contenu informatif mais optimise pour l'audio.
        
        Texte original: ${text.substring(0, 3000)}`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    })

    return content || text
  } catch (error) {
    console.error("Erreur amélioration texte:", error)
    return text
  }
}

async function generateSSML(text: string): Promise<string> {
  try {
    const content = await generateAIResponse({
      messages: [
        {
          role: "user",
          content: `Convertis ce texte en SSML (Speech Synthesis Markup Language) pour améliorer la synthèse vocale.
        Ajoute des balises pour les pauses, l'emphase, et la prononciation.
        
        Exemple de format SSML:
        <speak>
          <p>Voici un paragraphe avec <emphasis level="strong">emphase</emphasis>.</p>
          <break time="1s"/>
          <p>Et voici une pause d'une seconde.</p>
        </speak>
        
        Texte à convertir: ${text.substring(0, 3000)}`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    })

    return content || text
  } catch (error) {
    console.error("Erreur génération SSML:", error)
    return text
  }
}
