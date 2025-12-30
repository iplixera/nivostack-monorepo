/**
 * DeepL API Integration
 */

export interface TranslationResult {
  text: string
  confidence?: number
  detectedSourceLanguage?: string
}

export async function translateWithDeepL(
  text: string,
  sourceLang: string,
  targetLang: string,
  apiKey: string
): Promise<TranslationResult> {
  if (!apiKey) {
    throw new Error('DeepL API key is required')
  }

  try {
    // DeepL API v2
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        text: text,
        source_lang: sourceLang.toUpperCase(),
        target_lang: targetLang.toUpperCase()
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`DeepL API error: ${error || response.statusText}`)
    }

    const data = await response.json()
    
    if (data.translations?.[0]) {
      return {
        text: data.translations[0].text,
        detectedSourceLanguage: data.translations[0].detected_source_language?.toLowerCase(),
        confidence: 0.98 // DeepL typically has high confidence
      }
    }

    throw new Error('Invalid response from DeepL API')
  } catch (error) {
    console.error('DeepL Translate error:', error)
    throw error
  }
}

