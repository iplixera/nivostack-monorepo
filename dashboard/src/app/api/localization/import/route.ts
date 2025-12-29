import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { parseFile, ParsedTranslation } from '@/lib/localization/parsers'

interface ImportOptions {
  createMissingKeys: boolean
  updateExisting: boolean
  dryRun: boolean
  category?: string
}

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const formData = await request.formData()
    const projectId = formData.get('projectId') as string
    const format = formData.get('format') as string
    const languageCode = formData.get('languageCode') as string | null
    const file = formData.get('file') as File | null
    const optionsJson = formData.get('options') as string | null

    if (!projectId || !format || !file) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, format, file' },
        { status: 400 }
      )
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: payload.userId },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Validate format
    const validFormats = ['csv', 'json', 'android_xml', 'ios_strings', 'xliff']
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: `Invalid format. Supported: ${validFormats.join(', ')}` },
        { status: 400 }
      )
    }

    // Parse options
    let options: ImportOptions = {
      createMissingKeys: true,
      updateExisting: true,
      dryRun: false,
    }

    if (optionsJson) {
      try {
        options = { ...options, ...JSON.parse(optionsJson) }
      } catch (e) {
        // Invalid JSON, use defaults
      }
    }

    // Read file content
    const fileContent = await file.text()

    // Parse file
    const parseResult = parseFile(
      fileContent,
      format as 'csv' | 'json' | 'android_xml' | 'ios_strings' | 'xliff'
    )

    if (parseResult.errors.length > 0 && parseResult.translations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse file',
          errors: parseResult.errors,
        },
        { status: 400 }
      )
    }

    // Find or get language
    let language
    if (languageCode) {
      language = await prisma.language.findFirst({
        where: { projectId, code: languageCode, isEnabled: true },
      })

      if (!language) {
        return NextResponse.json(
          { error: `Language ${languageCode} not found or disabled` },
          { status: 400 }
        )
      }
    } else {
      // Get default language
      language = await prisma.language.findFirst({
        where: { projectId, isDefault: true, isEnabled: true },
      })

      if (!language) {
        return NextResponse.json(
          { error: 'No language specified and no default language found' },
          { status: 400 }
        )
      }
    }

    // If dry run, return preview
    if (options.dryRun) {
      const preview = parseResult.translations.map((t) => {
        return {
          key: t.key,
          value: t.value,
          action: 'create' as const, // Simplified for preview
        }
      })

      return NextResponse.json({
        success: true,
        preview,
        stats: {
          keysCreated: parseResult.translations.length,
          keysUpdated: 0,
          keysSkipped: 0,
          translationsCreated: parseResult.translations.length,
          translationsUpdated: 0,
          errors: parseResult.errors,
        },
      })
    }

    // Process imports in transaction
    const stats = {
      keysCreated: 0,
      keysUpdated: 0,
      keysSkipped: 0,
      translationsCreated: 0,
      translationsUpdated: 0,
      errors: [] as Array<{ key?: string; message: string }>,
    }

    await prisma.$transaction(async (tx) => {
      for (const parsed of parseResult.translations) {
        try {
          // Find or create key
          let key = await tx.localizationKey.findFirst({
            where: { projectId, key: parsed.key },
          })

          if (!key) {
            if (options.createMissingKeys) {
              key = await tx.localizationKey.create({
                data: {
                  projectId,
                  key: parsed.key,
                  description: parsed.description || null,
                  category: parsed.category || options.category || null,
                },
              })
              stats.keysCreated++
            } else {
              stats.keysSkipped++
              stats.errors.push({
                key: parsed.key,
                message: 'Key does not exist and createMissingKeys is false',
              })
              continue
            }
          }

          // Find or create translation
          const existingTranslation = await tx.translation.findUnique({
            where: {
              keyId_languageId: {
                keyId: key.id,
                languageId: language.id,
              },
            },
          })

          if (existingTranslation) {
            if (options.updateExisting) {
              await tx.translation.update({
                where: { id: existingTranslation.id },
                data: {
                  value: parsed.value,
                  isReviewed: false, // Reset review status on update
                },
              })
              stats.translationsUpdated++
            } else {
              stats.errors.push({
                key: parsed.key,
                message: 'Translation exists and updateExisting is false',
              })
            }
          } else {
            await tx.translation.create({
              data: {
                projectId,
                keyId: key.id,
                languageId: language.id,
                value: parsed.value,
              },
            })
            stats.translationsCreated++
          }
        } catch (error) {
          stats.errors.push({
            key: parsed.key,
            message: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    })

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

