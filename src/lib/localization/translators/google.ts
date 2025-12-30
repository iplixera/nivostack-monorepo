/**
 * Google Translate API Integration
 */

export interface TranslationResult {
  text: string
  confidence?: number
  detectedSourceLanguage?: string
}

export async function translateWithGoogle(
  text: string,
  sourceLang: string,
  targetLang: string,
  apiKey: string
): Promise<TranslationResult> {
  if (!apiKey) {
    throw new Error('Google Translate API key is required')
  }

  try {
    // Google Cloud Translation API v2
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text'
        })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Google Translate API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    
    if (data.data?.translations?.[0]) {
      return {
        text: data.data.translations[0].translatedText,
        detectedSourceLanguage: data.data.translations[0].detectedSourceLanguage,
        confidence: 0.95 // Google doesn't provide confidence, use default
      }
    }

    throw new Error('Invalid response from Google Translate API')
  } catch (error) {
    console.error('Google Translate error:', error)
    throw error
  }
}

