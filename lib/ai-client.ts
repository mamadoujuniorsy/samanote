import { NextResponse } from "next/server"

const FREE_MODELS = [
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "mistralai/mistral-small-24b-instruct-2501:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
]

interface AIRequestOptions {
  messages: { role: string; content: string }[]
  temperature?: number
  max_tokens?: number
  jsonMode?: boolean
}

export async function generateAIResponse(options: AIRequestOptions) {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing")
  }

  let lastError = null

  for (const model of FREE_MODELS) {
    try {
      console.log(`Attempting with model: ${model}`)
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://samanote.com",
          "X-Title": "SamaNote",
        },
        body: JSON.stringify({
          model: model,
          messages: options.messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 2000,
          response_format: options.jsonMode ? { type: "json_object" } : undefined,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.warn(`Model ${model} failed with status ${response.status}: ${errorText}`)
        throw new Error(`Status ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
        throw new Error("Invalid response format from OpenRouter")
      }

      return data.choices[0].message.content
    } catch (error) {
      console.error(`Error with model ${model}:`, error)
      lastError = error
      // Continue to next model
    }
  }

  throw new Error(`All AI models failed. Last error: ${lastError}`)
}
