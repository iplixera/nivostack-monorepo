import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { translateWithGoogle } from '@/lib/localization/translators/google'
import { translateWithDeepL } from '@/lib/localization/translators/deepl'
import { translateWithAzure } from '@/lib/localization/translators/azure'

/**
 * POST /api/localization/translate
 * Translate a key using machine translation provider
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      keyId,
      targetLanguageId,
      sourceLanguageId,
      provider = 'google'
    } = await request.json()

    if (!keyId || !targetLanguageId) {
      return NextResponse.json(
        { error: 'keyId and targetLanguageId are required' },
        { status: 400 }
      )
    }

    // Get translation key and verify ownership
    const translationKey = await prisma.localizationKey.findUnique({
      where: { id: keyId },
      include: { project: true }
    })

    if (!translationKey) {
      return NextResponse.json({ error: 'Translation key not found' }, { status: 404 })
    }

    if (translationKey.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get source language (default to project default if not specified)
    let sourceLanguage
    if (sourceLanguageId) {
      sourceLanguage = await prisma.language.findUnique({
        where: { id: sourceLanguageId }
      })
    } else {
      sourceLanguage = await prisma.language.findFirst({
        where: {
          projectId: translationKey.projectId,
          isDefault: true,
          isEnabled: true
        }
      })
    }

    if (!sourceLanguage) {
      return NextResponse.json({ error: 'Source language not found' }, { status: 404 })
    }

    // Get source translation
    const sourceTranslation = await prisma.translation.findFirst({
      where: {
        keyId,
        languageId: sourceLanguage.id
      }
    })

    if (!sourceTranslation) {
      return NextResponse.json(
        { error: 'Source translation not found' },
        { status: 404 }
      )
    }

    // Get translation provider configuration
    const providerConfig = await prisma.translationProvider.findUnique({
      where: {
        projectId_provider: {
          projectId: translationKey.projectId,
          provider
        }
      }
    })

    if (!providerConfig || !providerConfig.isEnabled) {
      return NextResponse.json(
        { error: `Translation provider ${provider} is not configured or enabled` },
        { status: 400 }
      )
    }

    // Get target language code
    const targetLanguage = await prisma.language.findUnique({ where: { id: targetLanguageId } })
    if (!targetLanguage) {
      return NextResponse.json({ error: 'Target language not found' }, { status: 404 })
    }

    // Translate using the selected provider
    let translatedText: { text: string; confidence?: number }
    
    try {
      switch (provider) {
        case 'google':
          if (!providerConfig.apiKey) {
            return NextResponse.json({ error: 'Google API key not configured' }, { status: 400 })
          }
          translatedText = await translateWithGoogle(
            sourceTranslation.value,
            sourceLanguage.code,
            targetLanguage.code,
            providerConfig.apiKey
          )
          break

        case 'deepl':
          if (!providerConfig.apiKey) {
            return NextResponse.json({ error: 'DeepL API key not configured' }, { status: 400 })
          }
          translatedText = await translateWithDeepL(
            sourceTranslation.value,
            sourceLanguage.code,
            targetLanguage.code,
            providerConfig.apiKey
          )
          break

        case 'azure':
          if (!providerConfig.apiKey) {
            return NextResponse.json({ error: 'Azure API key not configured' }, { status: 400 })
          }
          translatedText = await translateWithAzure(
            sourceTranslation.value,
            sourceLanguage.code,
            targetLanguage.code,
            providerConfig.apiKey,
            providerConfig.apiSecret || 'global'
          )
          break

        default:
          return NextResponse.json({ error: `Unsupported provider: ${provider}` }, { status: 400 })
      }
    } catch (error) {
      console.error('Translation error:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Translation failed' },
        { status: 500 }
      )
    }

    // Calculate cost (placeholder - should be based on actual API pricing)
    const cost = calculateTranslationCost(sourceTranslation.value.length, provider)

    return NextResponse.json({
      translation: {
        value: translatedText.text,
        provider,
        confidence: translatedText.confidence || 0.95,
        cost
      }
    })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


/**
 * Calculate translation cost based on text length and provider
 */
function calculateTranslationCost(textLength: number, provider: string): number {
  // Placeholder pricing (per character)
  const pricing: Record<string, number> = {
    google: 0.00002, // $20 per 1M characters
    deepl: 0.000025, // $25 per 1M characters
    azure: 0.00001 // $10 per 1M characters
  }

  return (pricing[provider] || 0.00002) * textLength
}

