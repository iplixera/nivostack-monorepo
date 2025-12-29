import { prisma } from './prisma'

// Feature registry for extensibility
const FEATURE_REGISTRY = {
  business_config: {
    name: 'Business Configuration',
    snapshot: snapshotBusinessConfig,
  },
  localization: {
    name: 'Localization',
    snapshot: snapshotLocalization,
  },
  api_mocks: {
    name: 'API Mocks',
    snapshot: snapshotApiMocks,
  },
} as const

type FeatureType = keyof typeof FEATURE_REGISTRY

/**
 * Snapshot current business config state (API response format)
 */
async function snapshotBusinessConfig(projectId: string) {
  const configs = await prisma.businessConfig.findMany({
    where: {
      projectId,
      isEnabled: true,
    },
    select: {
      key: true,
      valueType: true,
      stringValue: true,
      integerValue: true,
      booleanValue: true,
      decimalValue: true,
      jsonValue: true,
      imageUrl: true,
      category: true,
      version: true,
      updatedAt: true,
    },
    orderBy: { key: 'asc' },
  })

  // Transform to API response format
  const configMap: Record<string, unknown> = {}
  const configMeta: Record<string, { type: string; category: string | null; version: number; updatedAt: string }> = {}

  for (const config of configs) {
    // Extract value based on type
    let value: unknown = null
    switch (config.valueType) {
      case 'string':
        value = config.stringValue
        break
      case 'integer':
        value = config.integerValue
        break
      case 'boolean':
        value = config.booleanValue
        break
      case 'decimal':
        value = config.decimalValue
        break
      case 'json':
        value = config.jsonValue
        break
      case 'image':
        value = config.imageUrl
        break
    }

    configMap[config.key] = value
    configMeta[config.key] = {
      type: config.valueType,
      category: config.category,
      version: config.version,
      updatedAt: config.updatedAt.toISOString(),
    }
  }

  return {
    configs: configMap,
    meta: configMeta,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Snapshot current localization state (API response format)
 */
async function snapshotLocalization(projectId: string) {
  const languages = await prisma.language.findMany({
    where: { projectId },
    include: {
      translations: {
        include: {
          key: true,
        },
      },
    },
  })

  // Transform to API response format
  const translations: Record<string, Record<string, string>> = {}
  const languageList: string[] = []

  for (const lang of languages) {
    languageList.push(lang.code)
    translations[lang.code] = {}

    for (const translation of lang.translations) {
      translations[lang.code][translation.key.key] = translation.value
    }
  }

  return {
    translations,
    languages: languageList,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Snapshot current API Mocks state (API response format)
 */
async function snapshotApiMocks(projectId: string) {
  const environments = await prisma.mockEnvironment.findMany({
    where: { projectId },
    include: {
      endpoints: {
        where: { isEnabled: true },
        include: {
          responses: {
            where: { isEnabled: true },
            include: {
              conditions: true,
            },
            orderBy: [{ order: 'asc' }, { isDefault: 'desc' }],
          },
          conditions: true,
        },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Transform to API response format
  const environmentsData = environments.map((env) => ({
    id: env.id,
    name: env.name,
    description: env.description,
    basePath: env.basePath,
    mode: env.mode,
    whitelist: env.whitelist,
    blacklist: env.blacklist,
    isEnabled: env.isEnabled,
    isDefault: env.isDefault,
    endpoints: env.endpoints.map((endpoint) => ({
      id: endpoint.id,
      path: endpoint.path,
      method: endpoint.method,
      description: endpoint.description,
      order: endpoint.order,
      responses: endpoint.responses.map((response) => ({
        id: response.id,
        statusCode: response.statusCode,
        name: response.name,
        description: response.description,
        responseBody: response.responseBody,
        responseHeaders: response.responseHeaders,
        delay: response.delay,
        isDefault: response.isDefault,
        order: response.order,
        conditions: response.conditions.map((condition) => ({
          type: condition.type,
          key: condition.key,
          operator: condition.operator,
          value: condition.value,
          isCaseSensitive: condition.isCaseSensitive,
          order: condition.order,
        })),
      })),
      conditions: endpoint.conditions.map((condition) => ({
        type: condition.type,
        key: condition.key,
        operator: condition.operator,
        value: condition.value,
        isCaseSensitive: condition.isCaseSensitive,
        order: condition.order,
      })),
    })),
  }))

  return {
    environments: environmentsData,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Compare two builds and generate change log
 */
async function compareBuilds(
  projectId: string,
  oldBuildId: string | null,
  newBuildId: string,
  userId: string
) {
  const newBuild = await prisma.build.findUnique({
    where: { id: newBuildId },
    include: {
      features: true,
    },
  })

  if (!newBuild) {
    throw new Error('New build not found')
  }

  const changeLogs: Array<{
    buildId: string
    featureType: string
    changeType: 'added' | 'deleted' | 'changed'
    itemKey: string
    itemLabel: string | null
    oldValue: unknown
    newValue: unknown
    changedBy: string
  }> = []

  // If no old build, all items are "added"
  if (!oldBuildId) {
    for (const feature of newBuild.features) {
      const snapshot = feature.snapshotData as Record<string, unknown>
      
      if (feature.featureType === 'business_config') {
        const configs = snapshot.configs as Record<string, unknown>
        for (const [key, value] of Object.entries(configs)) {
          changeLogs.push({
            buildId: newBuildId,
            featureType: feature.featureType,
            changeType: 'added',
            itemKey: key,
            itemLabel: key,
            oldValue: null,
            newValue: value,
            changedBy: userId,
          })
        }
      } else if (feature.featureType === 'localization') {
        const translations = snapshot.translations as Record<string, Record<string, string>>
        for (const [langCode, langTranslations] of Object.entries(translations)) {
          for (const [key, value] of Object.entries(langTranslations)) {
            changeLogs.push({
              buildId: newBuildId,
              featureType: feature.featureType,
              changeType: 'added',
              itemKey: `${langCode}:${key}`,
              itemLabel: `${langCode}:${key}`,
              oldValue: null,
              newValue: value,
              changedBy: userId,
            })
          }
        }
      } else if (feature.featureType === 'api_mocks') {
        const environments = snapshot.environments as Array<{
          id: string
          name: string
          endpoints: Array<{ id: string; path: string; method: string }>
        }>
        for (const env of environments) {
          for (const endpoint of env.endpoints) {
            changeLogs.push({
              buildId: newBuildId,
              featureType: feature.featureType,
              changeType: 'added',
              itemKey: `${env.id}:${endpoint.id}`,
              itemLabel: `${env.name} - ${endpoint.method} ${endpoint.path}`,
              oldValue: null,
              newValue: endpoint,
              changedBy: userId,
            })
          }
        }
      }
    }
  } else {
    // Compare with previous build
    const oldBuild = await prisma.build.findUnique({
      where: { id: oldBuildId },
      include: {
        features: true,
      },
    })

    if (oldBuild) {
      // Compare each feature type
      for (const featureType of Object.keys(FEATURE_REGISTRY) as FeatureType[]) {
        const oldFeature = oldBuild.features.find(f => f.featureType === featureType)
        const newFeature = newBuild.features.find(f => f.featureType === featureType)

        const oldData = oldFeature?.snapshotData as Record<string, unknown> | undefined
        const newData = newFeature?.snapshotData as Record<string, unknown> | undefined

        if (featureType === 'business_config') {
          const oldConfigs = oldData?.configs as Record<string, unknown> | undefined
          const newConfigs = newData?.configs as Record<string, unknown> | undefined

          // Find added and changed
          if (newConfigs) {
            for (const [key, newValue] of Object.entries(newConfigs)) {
              const oldValue = oldConfigs?.[key]
              if (oldValue === undefined) {
                changeLogs.push({
                  buildId: newBuildId,
                  featureType,
                  changeType: 'added',
                  itemKey: key,
                  itemLabel: key,
                  oldValue: null,
                  newValue,
                  changedBy: userId,
                })
              } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                changeLogs.push({
                  buildId: newBuildId,
                  featureType,
                  changeType: 'changed',
                  itemKey: key,
                  itemLabel: key,
                  oldValue,
                  newValue,
                  changedBy: userId,
                })
              }
            }
          }

          // Find deleted
          if (oldConfigs) {
            for (const key of Object.keys(oldConfigs)) {
              if (!newConfigs || !(key in newConfigs)) {
                changeLogs.push({
                  buildId: newBuildId,
                  featureType,
                  changeType: 'deleted',
                  itemKey: key,
                  itemLabel: key,
                  oldValue: oldConfigs[key],
                  newValue: null,
                  changedBy: userId,
                })
              }
            }
          }
        } else if (featureType === 'localization') {
          const oldTranslations = oldData?.translations as Record<string, Record<string, string>> | undefined
          const newTranslations = newData?.translations as Record<string, Record<string, string>> | undefined

          // Find added and changed
          if (newTranslations) {
            for (const [langCode, langTranslations] of Object.entries(newTranslations)) {
              for (const [key, newValue] of Object.entries(langTranslations)) {
                const itemKey = `${langCode}:${key}`
                const oldValue = oldTranslations?.[langCode]?.[key]
                if (oldValue === undefined) {
                  changeLogs.push({
                    buildId: newBuildId,
                    featureType,
                    changeType: 'added',
                    itemKey,
                    itemLabel: itemKey,
                    oldValue: null,
                    newValue,
                    changedBy: userId,
                  })
                } else if (oldValue !== newValue) {
                  changeLogs.push({
                    buildId: newBuildId,
                    featureType,
                    changeType: 'changed',
                    itemKey,
                    itemLabel: itemKey,
                    oldValue,
                    newValue,
                    changedBy: userId,
                  })
                }
              }
            }
          }

          // Find deleted
          if (oldTranslations) {
            for (const [langCode, langTranslations] of Object.entries(oldTranslations)) {
              for (const key of Object.keys(langTranslations)) {
                const itemKey = `${langCode}:${key}`
                if (!newTranslations?.[langCode] || !(key in newTranslations[langCode])) {
                  changeLogs.push({
                    buildId: newBuildId,
                    featureType,
                    changeType: 'deleted',
                    itemKey,
                    itemLabel: itemKey,
                    oldValue: langTranslations[key],
                    newValue: null,
                    changedBy: userId,
                  })
                }
              }
            }
          }
        } else if (featureType === 'api_mocks') {
          const oldEnvironments = oldData?.environments as Array<{
            id: string
            name: string
            endpoints: Array<{ id: string; path: string; method: string; responses: any[] }>
          }> | undefined
          const newEnvironments = newData?.environments as Array<{
            id: string
            name: string
            endpoints: Array<{ id: string; path: string; method: string; responses: any[] }>
          }> | undefined

          // Find added and changed endpoints
          if (newEnvironments) {
            for (const newEnv of newEnvironments) {
              const oldEnv = oldEnvironments?.find(e => e.id === newEnv.id)
              
              for (const newEndpoint of newEnv.endpoints) {
                const oldEndpoint = oldEnv?.endpoints.find(e => e.id === newEndpoint.id)
                const itemKey = `${newEnv.id}:${newEndpoint.id}`
                const itemLabel = `${newEnv.name} - ${newEndpoint.method} ${newEndpoint.path}`
                
                if (!oldEndpoint) {
                  changeLogs.push({
                    buildId: newBuildId,
                    featureType,
                    changeType: 'added',
                    itemKey,
                    itemLabel,
                    oldValue: null,
                    newValue: newEndpoint,
                    changedBy: userId,
                  })
                } else if (JSON.stringify(oldEndpoint) !== JSON.stringify(newEndpoint)) {
                  changeLogs.push({
                    buildId: newBuildId,
                    featureType,
                    changeType: 'changed',
                    itemKey,
                    itemLabel,
                    oldValue: oldEndpoint,
                    newValue: newEndpoint,
                    changedBy: userId,
                  })
                }
              }
            }
          }

          // Find deleted endpoints
          if (oldEnvironments) {
            for (const oldEnv of oldEnvironments) {
              const newEnv = newEnvironments?.find(e => e.id === oldEnv.id)
              
              for (const oldEndpoint of oldEnv.endpoints) {
                const exists = newEnv?.endpoints.some(e => e.id === oldEndpoint.id)
                if (!exists) {
                  changeLogs.push({
                    buildId: newBuildId,
                    featureType,
                    changeType: 'deleted',
                    itemKey: `${oldEnv.id}:${oldEndpoint.id}`,
                    itemLabel: `${oldEnv.name} - ${oldEndpoint.method} ${oldEndpoint.path}`,
                    oldValue: oldEndpoint,
                    newValue: null,
                    changedBy: userId,
                  })
                }
              }
            }
          }
        }
      }
    }
  }

  // Save change logs
  if (changeLogs.length > 0) {
    await prisma.buildChangeLog.createMany({
      data: changeLogs.map(log => ({
        buildId: log.buildId,
        featureType: log.featureType,
        changeType: log.changeType,
        itemKey: log.itemKey,
        itemLabel: log.itemLabel,
        oldValue: log.oldValue as any,
        newValue: log.newValue as any,
        changedBy: log.changedBy,
      })),
    })
  }

  return changeLogs
}

/**
 * Create a new build for a specific feature type
 */
export async function createBuild(
  projectId: string,
  userId: string,
  featureType: FeatureType,
  name?: string,
  description?: string
) {
  // Get next version number for this feature type
  const lastBuild = await prisma.build.findFirst({
    where: { 
      projectId,
      features: {
        some: {
          featureType,
        },
      },
    },
    orderBy: { version: 'desc' },
    select: { version: true },
  })

  const nextVersion = (lastBuild?.version || 0) + 1

  // Get previous build for this feature type for comparison
  const previousBuild = await prisma.build.findFirst({
    where: {
      projectId,
      features: {
        some: {
          featureType,
        },
      },
    },
    orderBy: { version: 'desc' },
    select: { id: true },
  })

  // Create snapshot for the specific feature
  let snapshot: any
  let itemCount = 0
  let configCount = 0
  let translationCount = 0

  if (featureType === 'business_config') {
    snapshot = await snapshotBusinessConfig(projectId)
    itemCount = Object.keys(snapshot.configs).length
    configCount = itemCount
  } else if (featureType === 'localization') {
    snapshot = await snapshotLocalization(projectId)
    translationCount = Object.values(snapshot.translations).reduce(
      (sum: number, lang: any) => sum + Object.keys(lang).length,
      0
    )
    itemCount = translationCount
  } else if (featureType === 'api_mocks') {
    snapshot = await snapshotApiMocks(projectId)
    // Count total endpoints across all environments
    itemCount = snapshot.environments.reduce(
      (sum: number, env: any) => sum + env.endpoints.length,
      0
    )
  } else {
    throw new Error(`Unknown feature type: ${featureType}`)
  }

  // Create build with only this feature
  const build = await prisma.build.create({
    data: {
      projectId,
      version: nextVersion,
      name: name || `${FEATURE_REGISTRY[featureType].name} v${nextVersion}`,
      description,
      createdBy: userId,
      businessConfigSnapshot: featureType === 'business_config' ? snapshot as any : null,
      localizationSnapshot: featureType === 'localization' ? snapshot as any : null,
      configCount,
      translationCount,
      features: {
        create: [
          {
            featureType,
            snapshotData: snapshot as any,
            itemCount,
          },
        ],
      },
    },
    include: {
      features: true,
    },
  })

  // Generate change log by comparing with previous build
  await compareBuilds(projectId, previousBuild?.id || null, build.id, userId)

  return build
}

/**
 * Get build by ID
 */
export async function getBuild(buildId: string) {
  return prisma.build.findUnique({
    where: { id: buildId },
    include: {
      features: true,
      changeLogs: {
        orderBy: { changedAt: 'desc' },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
}

/**
 * Get user information for a build creator
 */
export async function getBuildCreator(userId: string | null) {
  if (!userId) return null
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
    },
  })
}

/**
 * List all builds for a project, optionally filtered by feature type
 */
export async function getBuildHistory(projectId: string, featureType?: string) {
  const where: any = { projectId }
  
  if (featureType) {
    where.features = {
      some: {
        featureType,
      },
    }
  }

  return prisma.build.findMany({
    where,
    include: {
      features: true,
      _count: {
        select: {
          changeLogs: true,
        },
      },
    },
    orderBy: { version: 'desc' },
  })
}

/**
 * Get active build for a mode
 */
export async function getActiveBuild(projectId: string, mode: 'preview' | 'production') {
  const buildMode = await prisma.buildMode.findUnique({
    where: { projectId },
    include: {
      previewBuild: mode === 'preview',
      productionBuild: mode === 'production',
    },
  })

  if (!buildMode) {
    return null
  }

  const buildId = mode === 'preview' ? buildMode.previewBuildId : buildMode.productionBuildId
  if (!buildId) {
    return null
  }

  return prisma.build.findUnique({
    where: { id: buildId },
    include: {
      features: true,
    },
  })
}

/**
 * Set build mode (preview or production)
 */
export async function setBuildMode(
  projectId: string,
  buildId: string,
  mode: 'preview' | 'production'
) {
  // Verify build belongs to project
  const build = await prisma.build.findUnique({
    where: { id: buildId },
    select: { projectId: true },
  })

  if (!build || build.projectId !== projectId) {
    throw new Error('Build not found or does not belong to project')
  }

  // Get or create BuildMode
  let buildMode = await prisma.buildMode.findUnique({
    where: { projectId },
  })

  if (!buildMode) {
    buildMode = await prisma.buildMode.create({
      data: { projectId },
    })
  }

  // Deactivate previous build in same mode
  const previousBuildId = mode === 'preview' ? buildMode.previewBuildId : buildMode.productionBuildId
  if (previousBuildId) {
    await prisma.build.update({
      where: { id: previousBuildId },
      data: { isActive: false },
    })
  }

  // Activate new build
  await prisma.build.update({
    where: { id: buildId },
    data: {
      mode,
      isActive: true,
    },
  })

  // Update BuildMode
  await prisma.buildMode.update({
    where: { projectId },
    data: {
      previewBuildId: mode === 'preview' ? buildId : buildMode.previewBuildId,
      productionBuildId: mode === 'production' ? buildId : buildMode.productionBuildId,
    },
  })

  return prisma.build.findUnique({
    where: { id: buildId },
  })
}

/**
 * Update build name/description
 */
export async function updateBuild(buildId: string, data: { name?: string; description?: string }) {
  return prisma.build.update({
    where: { id: buildId },
    data,
  })
}

/**
 * Delete build
 */
export async function deleteBuild(buildId: string) {
  // Check if build is active
  const build = await prisma.build.findUnique({
    where: { id: buildId },
    select: { isActive: true, projectId: true },
  })

  if (!build) {
    throw new Error('Build not found')
  }

  if (build.isActive) {
    throw new Error('Cannot delete active build. Deactivate it first.')
  }

  // Remove from BuildMode if referenced
  const buildMode = await prisma.buildMode.findUnique({
    where: { projectId: build.projectId },
  })

  if (buildMode) {
    const updates: { previewBuildId?: null; productionBuildId?: null } = {}
    if (buildMode.previewBuildId === buildId) {
      updates.previewBuildId = null
    }
    if (buildMode.productionBuildId === buildId) {
      updates.productionBuildId = null
    }

    if (Object.keys(updates).length > 0) {
      await prisma.buildMode.update({
        where: { projectId: build.projectId },
        data: updates,
      })
    }
  }

  // Delete build (cascade will delete features and change logs)
  await prisma.build.delete({
    where: { id: buildId },
  })
}

/**
 * Get build diff (compare two builds)
 */
export async function getBuildDiff(buildId1: string, buildId2: string) {
  const [build1, build2] = await Promise.all([
    prisma.build.findUnique({
      where: { id: buildId1 },
      include: { features: true },
    }),
    prisma.build.findUnique({
      where: { id: buildId2 },
      include: { features: true },
    }),
  ])

  if (!build1 || !build2) {
    throw new Error('One or both builds not found')
  }

  // Use compare logic (similar to compareBuilds but return diff structure)
  const diff: Record<string, Array<{
    changeType: 'added' | 'deleted' | 'changed'
    itemKey: string
    itemLabel: string | null
    oldValue: unknown
    newValue: unknown
  }>> = {}

  for (const featureType of Object.keys(FEATURE_REGISTRY) as FeatureType[]) {
    const feature1 = build1.features.find(f => f.featureType === featureType)
    const feature2 = build2.features.find(f => f.featureType === featureType)

    const data1 = feature1?.snapshotData as Record<string, unknown> | undefined
    const data2 = feature2?.snapshotData as Record<string, unknown> | undefined

    diff[featureType] = []

    if (featureType === 'business_config') {
      const configs1 = data1?.configs as Record<string, unknown> | undefined
      const configs2 = data2?.configs as Record<string, unknown> | undefined

      // Find added and changed
      if (configs2) {
        for (const [key, newValue] of Object.entries(configs2)) {
          const oldValue = configs1?.[key]
          if (oldValue === undefined) {
            diff[featureType].push({
              changeType: 'added',
              itemKey: key,
              itemLabel: key,
              oldValue: null,
              newValue,
            })
          } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            diff[featureType].push({
              changeType: 'changed',
              itemKey: key,
              itemLabel: key,
              oldValue,
              newValue,
            })
          }
        }
      }

      // Find deleted
      if (configs1) {
        for (const key of Object.keys(configs1)) {
          if (!configs2 || !(key in configs2)) {
            diff[featureType].push({
              changeType: 'deleted',
              itemKey: key,
              itemLabel: key,
              oldValue: configs1[key],
              newValue: null,
            })
          }
        }
      }
    } else if (featureType === 'localization') {
      const translations1 = data1?.translations as Record<string, Record<string, string>> | undefined
      const translations2 = data2?.translations as Record<string, Record<string, string>> | undefined

      // Find added and changed
      if (translations2) {
        for (const [langCode, langTranslations] of Object.entries(translations2)) {
          for (const [key, newValue] of Object.entries(langTranslations)) {
            const itemKey = `${langCode}:${key}`
            const oldValue = translations1?.[langCode]?.[key]
            if (oldValue === undefined) {
              diff[featureType].push({
                changeType: 'added',
                itemKey,
                itemLabel: itemKey,
                oldValue: null,
                newValue,
              })
            } else if (oldValue !== newValue) {
              diff[featureType].push({
                changeType: 'changed',
                itemKey,
                itemLabel: itemKey,
                oldValue,
                newValue,
              })
            }
          }
        }
      }

      // Find deleted
      if (translations1) {
        for (const [langCode, langTranslations] of Object.entries(translations1)) {
          for (const key of Object.keys(langTranslations)) {
            const itemKey = `${langCode}:${key}`
            if (!translations2?.[langCode] || !(key in translations2[langCode])) {
              diff[featureType].push({
                changeType: 'deleted',
                itemKey,
                itemLabel: itemKey,
                oldValue: langTranslations[key],
                newValue: null,
              })
            }
          }
        }
      }
    }
    
    if (featureType === 'api_mocks') {
        const envs1 = data1?.environments as Array<{
          id: string
          name: string
          endpoints: Array<{ id: string; path: string; method: string; responses: any[] }>
        }> | undefined
        const envs2 = data2?.environments as Array<{
          id: string
          name: string
          endpoints: Array<{ id: string; path: string; method: string; responses: any[] }>
        }> | undefined

        // Find added and changed endpoints
        if (envs2) {
          for (const env2 of envs2) {
            const env1 = envs1?.find(e => e.id === env2.id)
            
            for (const endpoint2 of env2.endpoints) {
              const endpoint1 = env1?.endpoints.find(e => e.id === endpoint2.id)
              const itemKey = `${env2.id}:${endpoint2.id}`
              const itemLabel = `${env2.name} - ${endpoint2.method} ${endpoint2.path}`
              
              if (!endpoint1) {
                diff[featureType].push({
                  changeType: 'added',
                  itemKey,
                  itemLabel,
                  oldValue: null,
                  newValue: endpoint2,
                })
              } else if (JSON.stringify(endpoint1) !== JSON.stringify(endpoint2)) {
                diff[featureType].push({
                  changeType: 'changed',
                  itemKey,
                  itemLabel,
                  oldValue: endpoint1,
                  newValue: endpoint2,
                })
              }
            }
          }
        }

        // Find deleted endpoints
        if (envs1) {
          for (const env1 of envs1) {
            const env2 = envs2?.find(e => e.id === env1.id)
            
            for (const endpoint1 of env1.endpoints) {
              const exists = env2?.endpoints.some(e => e.id === endpoint1.id)
              if (!exists) {
                diff[featureType].push({
                  changeType: 'deleted',
                  itemKey: `${env1.id}:${endpoint1.id}`,
                  itemLabel: `${env1.name} - ${endpoint1.method} ${endpoint1.path}`,
                  oldValue: endpoint1,
                  newValue: null,
                })
              }
            }
          }
        }
    }
  }

  return {
    build1: {
      id: build1.id,
      version: build1.version,
      name: build1.name,
      createdAt: build1.createdAt,
    },
    build2: {
      id: build2.id,
      version: build2.version,
      name: build2.name,
      createdAt: build2.createdAt,
    },
    diff,
  }
}

