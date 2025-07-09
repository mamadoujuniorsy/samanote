// API Route: /api/pdf/analyze/route.ts
// Composant Frontend simplifié (corrections importantes)
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const analysisType = formData.get("analysisType") as string
    const title = formData.get("title") as string

    if (!file || !analysisType) {
      return NextResponse.json({ error: "Fichier et type d'analyse requis" }, { status: 400 })
    }

    // Vérifier que c'est un PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Seuls les fichiers PDF sont acceptés" }, { status: 400 })
    }

    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Le fichier est trop volumineux (max 10MB)" }, { status: 400 })
    }

    let extractedText = ""

    try {
      // Convertir le fichier en buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Extraire le texte du PDF avec pdf-parse
      const pdfParse = await import("pdf-parse/lib/pdf-parse")
      const data = await pdfParse.default(buffer)
      extractedText = data.text

      console.log("Texte extrait:", extractedText.substring(0, 200) + "...")

    } catch (pdfError) {
      console.error("Erreur extraction PDF:", pdfError)
      return NextResponse.json(
        { error: "Impossible d'extraire le texte du PDF. Assurez-vous que le PDF contient du texte." },
        { status: 400 }
      )
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return NextResponse.json(
        { error: "Le PDF ne contient pas assez de texte exploitable" },
        { status: 400 }
      )
    }

    // Limiter la taille du texte pour l'IA (max 6000 caractères pour éviter les limits)
    const textToAnalyze = extractedText.substring(0, 6000)

    // Générer le prompt selon le type d'analyse
    let prompt = ""
    let analysisTitle = ""

    switch (analysisType) {
      case "summary":
        prompt = `Tu es un assistant éducatif expert. Analyse ce contenu de cours et crée un résumé structuré et détaillé en français.

Instructions:
- Utilise le format Markdown pour structurer le contenu
- Organise avec des titres (##) et sous-titres (###)
- Mets en évidence les concepts clés avec **gras**
- Utilise des listes à puces pour les points importants
- Garde un style académique mais accessible

Contenu à analyser:
${textToAnalyze}

Réponds uniquement avec le résumé structuré.`
        analysisTitle = `Résumé - ${title || file.name.replace('.pdf', '')}`
        break

      case "mindmap":
        prompt = `Tu es un assistant éducatif expert. Analyse ce contenu de cours et crée une carte mentale textuelle en français.

Instructions:
- Utilise une structure hiérarchique claire
- Format: 
  # Concept Principal
  ## Sous-concept 1
  - Point important
  - Détail
  ## Sous-concept 2
  - Point important
- Identifie les relations entre concepts
- Maximum 4 niveaux de hiérarchie

Contenu à analyser:
${textToAnalyze}

Réponds uniquement avec la carte mentale.`
        analysisTitle = `Carte Mentale - ${title || file.name.replace('.pdf', '')}`
        break

      case "flashcards":
        prompt = `Tu es un assistant éducatif expert. Analyse ce contenu de cours et crée des fiches de révision en français.

Instructions:
- Crée 8-12 fiches couvrant les concepts principaux
- Format exact:
  ## Fiche 1: [Titre du concept]
  **Question**: [Question claire]
  **Réponse**: [Réponse détaillée]
  
  ## Fiche 2: [Titre du concept]
  **Question**: [Question claire]
  **Réponse**: [Réponse détaillée]
- Varie les types de questions (définitions, exemples, applications)

Contenu à analyser:
${textToAnalyze}

Réponds uniquement avec les fiches de révision.`
        analysisTitle = `Fiches de Révision - ${title || file.name.replace('.pdf', '')}`
        break

      case "key_points":
        prompt = `Tu es un assistant éducatif expert. Analyse ce contenu de cours et extrais les points essentiels en français.

Instructions:
- Utilise ce format exact:
  # Points Essentiels
  
  ## 🎯 Concepts Clés
  - **[Concept]**: [Explication courte]
  
  ## 📚 Définitions Importantes
  - **[Terme]**: [Définition]
  
  ## 💡 Points à Retenir
  - [Point important]
  
  ## 📋 Formules/Méthodes (si applicable)
  - [Formule ou méthode]
- Sois concis mais complet

Contenu à analyser:
${textToAnalyze}

Réponds uniquement avec les points essentiels.`
        analysisTitle = `Points Essentiels - ${title || file.name.replace('.pdf', '')}`
        break

      default:
        return NextResponse.json({ error: "Type d'analyse non supporté" }, { status: 400 })
    }

    // Vérifier la clé API
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("Clé API OpenRouter manquante")
    }

    // Appel à OpenRouter avec gestion d'erreur améliorée
    console.log("Appel à OpenRouter...")
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "SamaNote PDF Analyzer",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-small-3.2-24b-instruct:free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2500,
        temperature: 0.3, // Réduit pour plus de cohérence
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erreur OpenRouter:", response.status, errorText)
      throw new Error(`Erreur OpenRouter: ${response.status} - ${errorText}`)
    }

    const aiData = await response.json()
    console.log("Réponse OpenRouter:", aiData)

    const generatedContent = aiData.choices?.[0]?.message?.content

    if (!generatedContent) {
      console.error("Pas de contenu généré:", aiData)
      throw new Error("Aucun contenu généré par l'IA")
    }

    // Retourner directement le résultat sans sauvegarde
    return NextResponse.json({
      success: true,
      analysis: {
        title: analysisTitle,
        content: generatedContent.trim(),
        type: analysisType,
      },
      originalText: textToAnalyze.substring(0, 500) + "...",
    })

  } catch (error: any) {
    console.error("Erreur analyse PDF:", error)
    return NextResponse.json(
      { 
        error: error.message || "Erreur lors de l'analyse du PDF",
        details: error.stack 
      }, 
      { status: 500 }
    )
  }
}

