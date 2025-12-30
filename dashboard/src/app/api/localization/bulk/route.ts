import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

interface BulkEditRequest {
  projectId: string
  operation: 'update_translations' | 'delete_keys' | 'assign_category' | 'enable_languages' | 'disable_languages'
  filters: {
    keyIds?: string[]
    languageIds?: string[]
    category?: string
    hasTranslation?: boolean
    isReviewed?: boolean
  }
  updates: {
    category?: string
    translations?: Array<{
      keyId: string
      languageId: string
      value: string
    }>
    isEnabled?: boolean
  }
}

export async function PATCH(request: NextRequest) {
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

    const body: BulkEditRequest = await request.json()
    const { projectId, operation, filters, updates } = body

    if (!projectId || !operation) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: payload.userId },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const affected = {
      keys: 0,
      translations: 0,
    }
    const errors: Array<{ key?: string; message: string }> = []

    // Build where clause for keys
    const keyWhere: any = { projectId }
    if (filters.keyIds && filters.keyIds.length > 0) {
      keyWhere.id = { in: filters.keyIds }
    }
    if (filters.category) {
      keyWhere.category = filters.category
    }

    // Build where clause for languages
    const languageWhere: any = { projectId }
    if (filters.languageIds && filters.languageIds.length > 0) {
      languageWhere.id = { in: filters.languageIds }
    }

    await prisma.$transaction(async (tx) => {
      switch (operation) {
        case 'update_translations': {
          if (!updates.translations || updates.translations.length === 0) {
            throw new Error('No translations provided')
          }

          for (const trans of updates.translations) {
            try {
              // Verify key and language belong to project
              const key = await tx.localizationKey.findFirst({
                where: { id: trans.keyId, projectId },
              })
              const language = await tx.language.findFirst({
                where: { id: trans.languageId, projectId },
              })

              if (!key || !language) {
                errors.push({
                  key: trans.keyId,
                  message: 'Key or language not found',
                })
                continue
              }

              // Apply filters
              if (filters.keyIds && !filters.keyIds.includes(trans.keyId)) {
                continue
              }
              if (filters.languageIds && !filters.languageIds.includes(trans.languageId)) {
                continue
              }

              // Upsert translation
              await tx.translation.upsert({
                where: {
                  keyId_languageId: {
                    keyId: trans.keyId,
                    languageId: trans.languageId,
                  },
                },
                update: {
                  value: trans.value,
                  isReviewed: false, // Reset review on update
                },
                create: {
                  projectId,
                  keyId: trans.keyId,
                  languageId: trans.languageId,
                  value: trans.value,
                },
              })

              affected.translations++
            } catch (error) {
              errors.push({
                key: trans.keyId,
                message: error instanceof Error ? error.message : 'Unknown error',
              })
            }
          }
          break
        }

        case 'delete_keys': {
          // Find keys matching filters
          const keysToDelete = await tx.localizationKey.findMany({
            where: keyWhere,
            select: { id: true },
          })

          const keyIds = keysToDelete.map((k) => k.id)

          // Delete translations first (cascade should handle this, but explicit for clarity)
          await tx.translation.deleteMany({
            where: {
              projectId,
              keyId: { in: keyIds },
            },
          })

          // Delete keys
          await tx.localizationKey.deleteMany({
            where: {
              projectId,
              id: { in: keyIds },
            },
          })

          affected.keys = keysToDelete.length
          break
        }

        case 'assign_category': {
          if (!updates.category) {
            throw new Error('Category not provided')
          }

          const result = await tx.localizationKey.updateMany({
            where: keyWhere,
            data: {
              category: updates.category,
            },
          })

          affected.keys = result.count
          break
        }

        case 'enable_languages': {
          const result = await tx.language.updateMany({
            where: languageWhere,
            data: {
              isEnabled: true,
            },
          })

          affected.keys = result.count // Reusing for languages count
          break
        }

        case 'disable_languages': {
          // Prevent disabling default language
          const defaultLanguage = await tx.language.findFirst({
            where: { projectId, isDefault: true },
          })

          const whereClause: any = { ...languageWhere }
          if (defaultLanguage) {
            whereClause.id = { not: defaultLanguage.id }
          }

          const result = await tx.language.updateMany({
            where: whereClause,
            data: {
              isEnabled: false,
            },
          })

          affected.keys = result.count
          break
        }

        default:
          throw new Error(`Unknown operation: ${operation}`)
      }
    })

    return NextResponse.json({
      success: true,
      affected,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Bulk operation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

