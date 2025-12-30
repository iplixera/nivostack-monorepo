import { prisma } from './prisma'

/**
 * Check if an endpoint should be mocked based on environment mode
 */
function shouldMockEndpoint(
  path: string,
  method: string,
  environment: {
    mode: string
    whitelist: string[]
    blacklist: string[]
  },
  endpointExists: boolean
): boolean {
  if (environment.mode === 'selective') {
    // Only mock if endpoint exists in environment
    return endpointExists
  } else if (environment.mode === 'global') {
    // Check all endpoints (will check if mock exists)
    return true
  } else if (environment.mode === 'whitelist') {
    // Only mock if in whitelist
    return environment.whitelist.some((pattern) => matchesPattern(path, pattern))
  } else if (environment.mode === 'blacklist') {
    // Mock all except blacklist
    return !environment.blacklist.some((pattern) => matchesPattern(path, pattern))
  }
  return false
}

/**
 * Match path against pattern (supports wildcards and path params)
 */
function matchesPattern(path: string, pattern: string): boolean {
  // Convert pattern to regex
  // e.g., "/api/users/*" → "^/api/users/.*$"
  // e.g., "/api/users/:id" → "^/api/users/[^/]+$"
  let regexPattern = pattern
    .replace(/\*/g, '.*') // Wildcard
    .replace(/:[^/]+/g, '[^/]+') // Path params
  regexPattern = `^${regexPattern}$`
  
  const regex = RegExp(regexPattern)
  return regex.test(path)
}

/**
 * Match endpoint path pattern against request path
 */
function matchEndpointPath(pattern: string, requestPath: string): {
  matched: boolean
  pathParams: Record<string, string>
} {
  const patternParts = pattern.split('/')
  const requestParts = requestPath.split('/')
  
  if (patternParts.length !== requestParts.length) {
    // Check for wildcard at end
    if (pattern.endsWith('/*')) {
      const basePattern = pattern.slice(0, -2)
      if (requestPath.startsWith(basePattern)) {
        return { matched: true, pathParams: {} }
      }
    }
    return { matched: false, pathParams: {} }
  }
  
  const pathParams: Record<string, string> = {}
  let matched = true
  
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i]
    const requestPart = requestParts[i]
    
    if (patternPart.startsWith(':')) {
      // Path parameter
      const paramName = patternPart.slice(1)
      pathParams[paramName] = requestPart
    } else if (patternPart === '*') {
      // Wildcard - matches anything
      continue
    } else if (patternPart !== requestPart) {
      matched = false
      break
    }
  }
  
  return { matched, pathParams }
}

/**
 * Evaluate condition against request data
 */
function evaluateCondition(
  condition: {
    type: string
    key: string
    operator: string
    value: string | null
    isCaseSensitive: boolean
  },
  request: {
    pathParams: Record<string, string>
    query: Record<string, string>
    headers: Record<string, string>
    body: unknown
  }
): boolean {
  let valueToCheck: string | null = null
  
  // Get value based on condition type
  if (condition.type === 'path_param') {
    valueToCheck = request.pathParams[condition.key] || null
  } else if (condition.type === 'query_param') {
    valueToCheck = request.query[condition.key] || null
  } else if (condition.type === 'header') {
    const headerKey = condition.isCaseSensitive
      ? condition.key
      : Object.keys(request.headers).find(k => k.toLowerCase() === condition.key.toLowerCase())
    valueToCheck = headerKey ? request.headers[headerKey] || null : null
  } else if (condition.type === 'body_json_path') {
    // Simple JSON path evaluation (supports $.key.key)
    try {
      const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body
      const path = condition.key.replace(/^\$\./, '').split('.')
      let current: any = body
      for (const key of path) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key]
        } else {
          current = null
          break
        }
      }
      valueToCheck = current !== null && current !== undefined ? String(current) : null
    } catch {
      valueToCheck = null
    }
  }
  
  // Evaluate operator
  if (condition.operator === 'exists') {
    return valueToCheck !== null && valueToCheck !== undefined
  } else if (condition.operator === 'not_exists') {
    return valueToCheck === null || valueToCheck === undefined
  }
  
  if (valueToCheck === null) {
    return false
  }
  
  const checkValue = condition.isCaseSensitive ? valueToCheck : valueToCheck.toLowerCase()
  const matchValue = condition.value
    ? (condition.isCaseSensitive ? condition.value : condition.value.toLowerCase())
    : null
  
  switch (condition.operator) {
    case 'equals':
      return checkValue === matchValue
    case 'contains':
      return matchValue ? checkValue.includes(matchValue) : false
    case 'matches':
      // Regex match
      try {
        const regex = RegExp(matchValue || '')
        return regex.test(checkValue)
      } catch {
        return false
      }
    case 'greater_than':
      const num1 = parseFloat(checkValue)
      const num2 = matchValue ? parseFloat(matchValue) : NaN
      return !isNaN(num1) && !isNaN(num2) && num1 > num2
    case 'less_than':
      const num3 = parseFloat(checkValue)
      const num4 = matchValue ? parseFloat(matchValue) : NaN
      return !isNaN(num3) && !isNaN(num4) && num3 < num4
    default:
      return false
  }
}

/**
 * Get mock response for a request
 */
export async function getMockResponse(
  projectId: string,
  environmentId: string | null,
  path: string,
  method: string,
  query: Record<string, string> = {},
  headers: Record<string, string> = {},
  body: unknown = null
): Promise<{
  mockFound: boolean
  statusCode?: number
  headers?: Record<string, string>
  body?: unknown
  delay?: number
  endpointId?: string
  responseId?: string
} | null> {
  // Get environment (use default if not provided)
  let environment
  if (environmentId) {
    environment = await prisma.mockEnvironment.findFirst({
      where: {
        id: environmentId,
        projectId,
        isEnabled: true,
      },
    })
  } else {
    environment = await prisma.mockEnvironment.findFirst({
      where: {
        projectId,
        isEnabled: true,
        isDefault: true,
      },
    })
  }
  
  if (!environment) {
    return { mockFound: false }
  }
  
  // Get all enabled endpoints for this environment
  const endpoints = await prisma.mockEndpoint.findMany({
    where: {
      environmentId: environment.id,
      isEnabled: true,
      method: method.toUpperCase(),
    },
    include: {
      responses: {
        where: { isEnabled: true },
        include: {
          conditions: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: [{ order: 'asc' }, { isDefault: 'desc' }],
      },
      conditions: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  })
  
  // Find matching endpoint
  for (const endpoint of endpoints) {
    const { matched, pathParams } = matchEndpointPath(endpoint.path, path)
    
    if (!matched) {
      continue
    }
    
    // Check endpoint-level conditions
    let endpointMatches = true
    if (endpoint.conditions.length > 0) {
      for (const condition of endpoint.conditions) {
        if (!evaluateCondition(condition, { pathParams, query, headers, body })) {
          endpointMatches = false
          break
        }
      }
    }
    
    if (!endpointMatches) {
      continue
    }
    
    // Check if should mock based on environment mode
    const shouldMock = shouldMockEndpoint(path, method, environment, true)
    if (!shouldMock) {
      return { mockFound: false }
    }
    
    // Find matching response
    for (const response of endpoint.responses) {
      // Check response-level conditions
      let responseMatches = true
      if (response.conditions.length > 0) {
        for (const condition of response.conditions) {
          if (!evaluateCondition(condition, { pathParams, query, headers, body })) {
            responseMatches = false
            break
          }
        }
      } else {
        // No conditions = default response
        responseMatches = true
      }
      
      if (responseMatches) {
        return {
          mockFound: true,
          statusCode: response.statusCode,
          headers: (response.responseHeaders as Record<string, string>) || {},
          body: response.responseBody,
          delay: response.delay,
          endpointId: endpoint.id,
          responseId: response.id,
        }
      }
    }
    
    // If no response matched, check for default response
    const defaultResponse = endpoint.responses.find((r) => r.isDefault)
    if (defaultResponse) {
      return {
        mockFound: true,
        statusCode: defaultResponse.statusCode,
        headers: (defaultResponse.responseHeaders as Record<string, string>) || {},
        body: defaultResponse.responseBody,
        delay: defaultResponse.delay,
        endpointId: endpoint.id,
        responseId: defaultResponse.id,
      }
    }
  }
  
  // Check mode to determine if we should return mockFound: false
  // In selective mode, if no endpoint matched, return false
  // In global mode, if no endpoint matched, return false (SDK will forward to real API)
  const endpointExists = endpoints.length > 0
  const shouldMock = shouldMockEndpoint(path, method, environment, endpointExists)
  
  if (!shouldMock) {
    return { mockFound: false }
  }
  
  // No mock found, but should check mocks
  return { mockFound: false }
}

/**
 * Create mock environment
 */
export async function createMockEnvironment(
  projectId: string,
  userId: string,
  data: {
    name: string
    description?: string
    basePath?: string
    mode?: string
    whitelist?: string[]
    blacklist?: string[]
    isDefault?: boolean
  }
) {
  // If setting as default, unset other defaults
  if (data.isDefault) {
    await prisma.mockEnvironment.updateMany({
      where: { projectId, isDefault: true },
      data: { isDefault: false },
    })
  }
  
  return prisma.mockEnvironment.create({
    data: {
      projectId,
      name: data.name,
      description: data.description,
      basePath: data.basePath,
      mode: data.mode || 'selective',
      whitelist: data.whitelist || [],
      blacklist: data.blacklist || [],
      isDefault: data.isDefault || false,
      createdBy: userId,
    },
  })
}

/**
 * Get mock environments for a project
 */
export async function getMockEnvironments(projectId: string) {
  return prisma.mockEnvironment.findMany({
    where: { projectId },
    include: {
      _count: {
        select: {
          endpoints: true,
        },
      },
    },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
}

/**
 * Get mock environment by ID
 */
export async function getMockEnvironment(environmentId: string) {
  return prisma.mockEnvironment.findUnique({
    where: { id: environmentId },
    include: {
      endpoints: {
        include: {
          responses: {
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
  })
}

/**
 * Create mock endpoint
 */
export async function createMockEndpoint(
  environmentId: string,
  data: {
    path: string
    method: string
    description?: string
    order?: number
  }
) {
  return prisma.mockEndpoint.create({
    data: {
      environmentId,
      path: data.path,
      method: data.method.toUpperCase(),
      description: data.description,
      order: data.order || 0,
    },
  })
}

/**
 * Create mock response
 */
export async function createMockResponse(
  endpointId: string,
  data: {
    statusCode: number
    name?: string
    description?: string
    responseBody?: unknown
    responseHeaders?: Record<string, string>
    delay?: number
    isDefault?: boolean
    order?: number
  }
) {
  // If setting as default, unset other defaults for this endpoint
  if (data.isDefault) {
    await prisma.mockResponse.updateMany({
      where: { endpointId, isDefault: true },
      data: { isDefault: false },
    })
  }
  
  return prisma.mockResponse.create({
    data: {
      endpointId,
      statusCode: data.statusCode,
      name: data.name,
      description: data.description,
      responseBody: data.responseBody as any,
      responseHeaders: data.responseHeaders as any,
      delay: data.delay || 0,
      isDefault: data.isDefault || false,
      order: data.order || 0,
    },
  })
}

/**
 * Create mock condition
 */
export async function createMockCondition(
  data: {
    responseId?: string
    endpointId?: string
    type: string
    key: string
    operator: string
    value?: string
    isCaseSensitive?: boolean
    order?: number
  }
) {
  return prisma.mockCondition.create({
    data: {
      responseId: data.responseId,
      endpointId: data.endpointId,
      type: data.type,
      key: data.key,
      operator: data.operator,
      value: data.value,
      isCaseSensitive: data.isCaseSensitive || false,
      order: data.order || 0,
    },
  })
}

/**
 * Update mock environment
 */
export async function updateMockEnvironment(
  environmentId: string,
  data: {
    name?: string
    description?: string
    basePath?: string
    mode?: string
    whitelist?: string[]
    blacklist?: string[]
    isEnabled?: boolean
    isDefault?: boolean
  }
) {
  // If setting as default, unset other defaults
  if (data.isDefault) {
    const env = await prisma.mockEnvironment.findUnique({
      where: { id: environmentId },
      select: { projectId: true },
    })
    if (env) {
      await prisma.mockEnvironment.updateMany({
        where: { projectId: env.projectId, isDefault: true, id: { not: environmentId } },
        data: { isDefault: false },
      })
    }
  }
  
  return prisma.mockEnvironment.update({
    where: { id: environmentId },
    data,
  })
}

/**
 * Delete mock environment
 */
export async function deleteMockEnvironment(environmentId: string) {
  return prisma.mockEnvironment.delete({
    where: { id: environmentId },
  })
}

