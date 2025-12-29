/**
 * Azure Translator API Integration
 */

export interface TranslationResult {
  text: string
  confidence?: number
  detectedSourceLanguage?: string
}

export async function translateWithAzure(
  text: string,
  sourceLang: string,
  targetLang: string,
  apiKey: string,
  region: string = 'global'
): Promise<TranslationResult> {
  if (!apiKey) {
    throw new Error('Azure Translator API key is required')
  }

  try {
    const endpoint = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${sourceLang}&to=${targetLang}`
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Ocp-Apim-Subscription-Region': region,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{ text }])
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Azure Translator API error: ${error || response.statusText}`)
    }

    const data = await response.json()
    
    if (data?.[0]?.translations?.[0]) {
      return {
        text: data[0].translations[0].text,
        detectedSourceLanguage: data[0].detectedLanguage?.language?.toLowerCase(),
        confidence: data[0].detectedLanguage?.score || 0.95
      }
    }

    throw new Error('Invalid response from Azure Translator API')
  } catch (error) {
    console.error('Azure Translate error:', error)
    throw error
  }
}

