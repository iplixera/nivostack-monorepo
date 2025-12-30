import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { formatFile, Translation } from '@/lib/localization/formatters'

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    const format = request.nextUrl.searchParams.get('format')
    const languageCode = request.nextUrl.searchParams.get('languageCode')
    const category = request.nextUrl.searchParams.get('category')
    const includeEmpty = request.nextUrl.searchParams.get('includeEmpty') === 'true'

    if (!projectId || !format) {
      return NextResponse.json(
        { error: 'Missing required parameters: projectId, format' },
        { status: 400 }
      )
    }

    // Validate format
    const validFormats = ['csv', 'json', 'android_xml', 'ios_strings', 'xliff']
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: `Invalid format. Supported: ${validFormats.join(', ')}` },
        { status: 400 }
      )
    }

    // Authentication
    const apiKey = request.headers.get('x-api-key')
    let project

    if (apiKey) {
      // SDK access
      project = await prisma.project.findFirst({
        where: { id: projectId, apiKey },
      })
    } else {
      // Dashboard access
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const token = authHeader.replace('Bearer ', '')
      const payload = verifyToken(token)

      if (!payload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      project = await prisma.project.findFirst({
        where: { id: projectId, userId: payload.userId },
      })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Build query conditions
    const where: any = { projectId }
    if (category) {
      where.category = category
    }

    // Get all keys
    const keys = await prisma.localizationKey.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    })

    // Get languages
    let languages: Array<{ id: string; code: string; name: string }> = []
    if (languageCode) {
      const lang = await prisma.language.findFirst({
        where: { projectId, code: languageCode, isEnabled: true },
      })
      if (lang) {
        languages = [{ id: lang.id, code: lang.code, name: lang.name }]
      } else {
        return NextResponse.json(
          { error: `Language ${languageCode} not found or disabled` },
          { status: 400 }
        )
      }
    } else {
      // Get all enabled languages
      const allLangs = await prisma.language.findMany({
        where: { projectId, isEnabled: true },
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      })
      languages = allLangs.map((l) => ({ id: l.id, code: l.code, name: l.name }))
    }

    if (languages.length === 0) {
      return NextResponse.json(
        { error: 'No enabled languages found' },
        { status: 400 }
      )
    }

    // For single language export
    if (languageCode && languages.length === 1) {
      const language = languages[0]

      // Get translations for this language
      const translations = await prisma.translation.findMany({
        where: {
          projectId,
          languageId: language.id,
          keyId: { in: keys.map((k) => k.id) },
        },
        include: {
          key: true,
        },
      })

      // Build translation map
      const translationMap = new Map<string, string>()
      for (const t of translations) {
        translationMap.set(t.keyId, t.value)
      }

      // Format translations
      const formattedTranslations: Translation[] = []
      for (const key of keys) {
        const value = translationMap.get(key.id)
        if (value !== undefined || includeEmpty) {
          formattedTranslations.push({
            key: key.key,
            value: value || '',
            description: key.description || undefined,
            category: key.category || undefined,
          })
        }
      }

      // Format file
      const content = formatFile(
        formattedTranslations,
        format as 'csv' | 'json' | 'android_xml' | 'ios_strings' | 'xliff',
        format === 'xliff'
          ? {
              sourceLanguage: { code: 'en', name: 'English' }, // Default, should be configurable
              targetLanguage: { code: language.code, name: language.name },
            }
          : undefined
      )

      // Determine content type and file extension
      const contentTypeMap: Record<string, string> = {
        csv: 'text/csv',
        json: 'application/json',
        android_xml: 'application/xml',
        ios_strings: 'text/plain',
        xliff: 'application/xml',
      }

      const extensionMap: Record<string, string> = {
        csv: 'csv',
        json: 'json',
        android_xml: 'xml',
        ios_strings: 'strings',
        xliff: 'xliff',
      }

      const filename = `translations_${language.code}.${extensionMap[format]}`

      return new NextResponse(content, {
        headers: {
          'Content-Type': contentTypeMap[format] || 'text/plain',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    // Multi-language export (CSV format with language columns)
    if (format === 'csv') {
      // Get all translations
      const allTranslations = await prisma.translation.findMany({
        where: {
          projectId,
          languageId: { in: languages.map((l) => l.id) },
          keyId: { in: keys.map((k) => k.id) },
        },
        include: {
          key: true,
          language: true,
        },
      })

      // Build translation map: keyId -> languageCode -> value
      const translationMap = new Map<string, Map<string, string>>()
      for (const t of allTranslations) {
        if (!translationMap.has(t.keyId)) {
          translationMap.set(t.keyId, new Map())
        }
        translationMap.get(t.keyId)!.set(t.language.code, t.value)
      }

      // Build CSV
      const header = ['key', 'category', 'description', ...languages.map((l) => l.code)]
      const rows: string[][] = []

      for (const key of keys) {
        const row: string[] = [
          key.key,
          key.category || '',
          key.description || '',
        ]

        for (const lang of languages) {
          const value = translationMap.get(key.id)?.get(lang.code) || ''
          row.push(value)
        }

        rows.push(row)
      }

      const csvContent = [header.join(','), ...rows.map((r) => r.map(escapeCSV).join(','))].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="translations.csv"',
        },
      })
    }

    // For other formats with multiple languages, export each language separately
    // This is a simplified approach - in production, you might want to create a ZIP file
    return NextResponse.json(
      { error: 'Multi-language export only supported for CSV format' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

