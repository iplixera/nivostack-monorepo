module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]();
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/src/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateToken",
    ()=>generateToken,
    "getAuthUser",
    ()=>getAuthUser,
    "getProjectByApiKey",
    ()=>getProjectByApiKey,
    "hashPassword",
    ()=>hashPassword,
    "isAdminUser",
    ()=>isAdminUser,
    "validateAdmin",
    ()=>validateAdmin,
    "validateApiKey",
    ()=>validateApiKey,
    "validateToken",
    ()=>validateToken,
    "verifyPassword",
    ()=>verifyPassword,
    "verifyToken",
    ()=>verifyToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$3$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/jsonwebtoken@9.0.3/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
;
;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
async function hashPassword(password) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(password, 12);
}
async function verifyPassword(password, hashedPassword) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, hashedPassword);
}
function generateToken(userId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$3$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign({
        userId
    }, JWT_SECRET, {
        expiresIn: '7d'
    });
}
function verifyToken(token) {
    try {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$3$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET);
    } catch  {
        return null;
    }
}
async function validateToken(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) {
        return null;
    }
    return payload.userId;
}
async function getAuthUser(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) {
        return null;
    }
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
        where: {
            id: payload.userId
        },
        select: {
            id: true,
            email: true,
            name: true,
            isAdmin: true
        }
    });
    return user;
}
function isAdminUser(user) {
    return user?.isAdmin === true;
}
async function getProjectByApiKey(apiKey) {
    const project = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
        where: {
            apiKey
        }
    });
    return project;
}
async function validateApiKey(request) {
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
        return null;
    }
    return getProjectByApiKey(apiKey);
}
async function validateAdmin(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) {
        return null;
    }
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
        where: {
            id: payload.userId
        },
        select: {
            id: true,
            email: true,
            name: true,
            isAdmin: true
        }
    });
    if (!user || !user.isAdmin) {
        return null;
    }
    return user;
}
}),
"[project]/src/lib/mock.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createMockCondition",
    ()=>createMockCondition,
    "createMockEndpoint",
    ()=>createMockEndpoint,
    "createMockEnvironment",
    ()=>createMockEnvironment,
    "createMockResponse",
    ()=>createMockResponse,
    "deleteMockEnvironment",
    ()=>deleteMockEnvironment,
    "getMockEnvironment",
    ()=>getMockEnvironment,
    "getMockEnvironments",
    ()=>getMockEnvironments,
    "getMockResponse",
    ()=>getMockResponse,
    "updateMockEnvironment",
    ()=>updateMockEnvironment
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
/**
 * Check if an endpoint should be mocked based on environment mode
 */ function shouldMockEndpoint(path, method, environment, endpointExists) {
    if (environment.mode === 'selective') {
        // Only mock if endpoint exists in environment
        return endpointExists;
    } else if (environment.mode === 'global') {
        // Check all endpoints (will check if mock exists)
        return true;
    } else if (environment.mode === 'whitelist') {
        // Only mock if in whitelist
        return environment.whitelist.some((pattern)=>matchesPattern(path, pattern));
    } else if (environment.mode === 'blacklist') {
        // Mock all except blacklist
        return !environment.blacklist.some((pattern)=>matchesPattern(path, pattern));
    }
    return false;
}
/**
 * Match path against pattern (supports wildcards and path params)
 */ function matchesPattern(path, pattern) {
    // Convert pattern to regex
    // e.g., "/api/users/*" → "^/api/users/.*$"
    // e.g., "/api/users/:id" → "^/api/users/[^/]+$"
    let regexPattern = pattern.replace(/\*/g, '.*') // Wildcard
    .replace(/:[^/]+/g, '[^/]+') // Path params
    ;
    regexPattern = `^${regexPattern}$`;
    const regex = RegExp(regexPattern);
    return regex.test(path);
}
/**
 * Match endpoint path pattern against request path
 */ function matchEndpointPath(pattern, requestPath) {
    const patternParts = pattern.split('/');
    const requestParts = requestPath.split('/');
    if (patternParts.length !== requestParts.length) {
        // Check for wildcard at end
        if (pattern.endsWith('/*')) {
            const basePattern = pattern.slice(0, -2);
            if (requestPath.startsWith(basePattern)) {
                return {
                    matched: true,
                    pathParams: {}
                };
            }
        }
        return {
            matched: false,
            pathParams: {}
        };
    }
    const pathParams = {};
    let matched = true;
    for(let i = 0; i < patternParts.length; i++){
        const patternPart = patternParts[i];
        const requestPart = requestParts[i];
        if (patternPart.startsWith(':')) {
            // Path parameter
            const paramName = patternPart.slice(1);
            pathParams[paramName] = requestPart;
        } else if (patternPart === '*') {
            continue;
        } else if (patternPart !== requestPart) {
            matched = false;
            break;
        }
    }
    return {
        matched,
        pathParams
    };
}
/**
 * Evaluate condition against request data
 */ function evaluateCondition(condition, request) {
    let valueToCheck = null;
    // Get value based on condition type
    if (condition.type === 'path_param') {
        valueToCheck = request.pathParams[condition.key] || null;
    } else if (condition.type === 'query_param') {
        valueToCheck = request.query[condition.key] || null;
    } else if (condition.type === 'header') {
        const headerKey = condition.isCaseSensitive ? condition.key : Object.keys(request.headers).find((k)=>k.toLowerCase() === condition.key.toLowerCase());
        valueToCheck = headerKey ? request.headers[headerKey] || null : null;
    } else if (condition.type === 'body_json_path') {
        // Simple JSON path evaluation (supports $.key.key)
        try {
            const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
            const path = condition.key.replace(/^\$\./, '').split('.');
            let current = body;
            for (const key of path){
                if (current && typeof current === 'object' && key in current) {
                    current = current[key];
                } else {
                    current = null;
                    break;
                }
            }
            valueToCheck = current !== null && current !== undefined ? String(current) : null;
        } catch  {
            valueToCheck = null;
        }
    }
    // Evaluate operator
    if (condition.operator === 'exists') {
        return valueToCheck !== null && valueToCheck !== undefined;
    } else if (condition.operator === 'not_exists') {
        return valueToCheck === null || valueToCheck === undefined;
    }
    if (valueToCheck === null) {
        return false;
    }
    const checkValue = condition.isCaseSensitive ? valueToCheck : valueToCheck.toLowerCase();
    const matchValue = condition.value ? condition.isCaseSensitive ? condition.value : condition.value.toLowerCase() : null;
    switch(condition.operator){
        case 'equals':
            return checkValue === matchValue;
        case 'contains':
            return matchValue ? checkValue.includes(matchValue) : false;
        case 'matches':
            // Regex match
            try {
                const regex = RegExp(matchValue || '');
                return regex.test(checkValue);
            } catch  {
                return false;
            }
        case 'greater_than':
            const num1 = parseFloat(checkValue);
            const num2 = matchValue ? parseFloat(matchValue) : NaN;
            return !isNaN(num1) && !isNaN(num2) && num1 > num2;
        case 'less_than':
            const num3 = parseFloat(checkValue);
            const num4 = matchValue ? parseFloat(matchValue) : NaN;
            return !isNaN(num3) && !isNaN(num4) && num3 < num4;
        default:
            return false;
    }
}
async function getMockResponse(projectId, environmentId, path, method, query = {}, headers = {}, body = null) {
    // Get environment (use default if not provided)
    let environment;
    if (environmentId) {
        environment = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockEnvironment.findFirst({
            where: {
                id: environmentId,
                projectId,
                isEnabled: true
            }
        });
    } else {
        environment = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockEnvironment.findFirst({
            where: {
                projectId,
                isEnabled: true,
                isDefault: true
            }
        });
    }
    if (!environment) {
        return {
            mockFound: false
        };
    }
    // Get all enabled endpoints for this environment
    const endpoints = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockEndpoint.findMany({
        where: {
            environmentId: environment.id,
            isEnabled: true,
            method: method.toUpperCase()
        },
        include: {
            responses: {
                where: {
                    isEnabled: true
                },
                include: {
                    conditions: {
                        orderBy: {
                            order: 'asc'
                        }
                    }
                },
                orderBy: [
                    {
                        order: 'asc'
                    },
                    {
                        isDefault: 'desc'
                    }
                ]
            },
            conditions: {
                orderBy: {
                    order: 'asc'
                }
            }
        },
        orderBy: {
            order: 'asc'
        }
    });
    // Find matching endpoint
    for (const endpoint of endpoints){
        const { matched, pathParams } = matchEndpointPath(endpoint.path, path);
        if (!matched) {
            continue;
        }
        // Check endpoint-level conditions
        let endpointMatches = true;
        if (endpoint.conditions.length > 0) {
            for (const condition of endpoint.conditions){
                if (!evaluateCondition(condition, {
                    pathParams,
                    query,
                    headers,
                    body
                })) {
                    endpointMatches = false;
                    break;
                }
            }
        }
        if (!endpointMatches) {
            continue;
        }
        // Check if should mock based on environment mode
        const shouldMock = shouldMockEndpoint(path, method, environment, true);
        if (!shouldMock) {
            return {
                mockFound: false
            };
        }
        // Find matching response
        for (const response of endpoint.responses){
            // Check response-level conditions
            let responseMatches = true;
            if (response.conditions.length > 0) {
                for (const condition of response.conditions){
                    if (!evaluateCondition(condition, {
                        pathParams,
                        query,
                        headers,
                        body
                    })) {
                        responseMatches = false;
                        break;
                    }
                }
            } else {
                // No conditions = default response
                responseMatches = true;
            }
            if (responseMatches) {
                return {
                    mockFound: true,
                    statusCode: response.statusCode,
                    headers: response.responseHeaders || {},
                    body: response.responseBody,
                    delay: response.delay,
                    endpointId: endpoint.id,
                    responseId: response.id
                };
            }
        }
        // If no response matched, check for default response
        const defaultResponse = endpoint.responses.find((r)=>r.isDefault);
        if (defaultResponse) {
            return {
                mockFound: true,
                statusCode: defaultResponse.statusCode,
                headers: defaultResponse.responseHeaders || {},
                body: defaultResponse.responseBody,
                delay: defaultResponse.delay,
                endpointId: endpoint.id,
                responseId: defaultResponse.id
            };
        }
    }
    // Check mode to determine if we should return mockFound: false
    // In selective mode, if no endpoint matched, return false
    // In global mode, if no endpoint matched, return false (SDK will forward to real API)
    const endpointExists = endpoints.length > 0;
    const shouldMock = shouldMockEndpoint(path, method, environment, endpointExists);
    if (!shouldMock) {
        return {
            mockFound: false
        };
    }
    // No mock found, but should check mocks
    return {
        mockFound: false
    };
}
async function createMockEnvironment(projectId, userId, data) {
    // If setting as default, unset other defaults
    if (data.isDefault) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockEnvironment.updateMany({
            where: {
                projectId,
                isDefault: true
            },
            data: {
                isDefault: false
            }
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockEnvironment.create({
        data: {
            projectId,
            name: data.name,
            description: data.description,
            basePath: data.basePath,
            mode: data.mode || 'selective',
            whitelist: data.whitelist || [],
            blacklist: data.blacklist || [],
            isDefault: data.isDefault || false,
            createdBy: userId
        }
    });
}
async function getMockEnvironments(projectId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockEnvironment.findMany({
        where: {
            projectId
        },
        include: {
            _count: {
                select: {
                    endpoints: true
                }
            }
        },
        orderBy: [
            {
                isDefault: 'desc'
            },
            {
                createdAt: 'desc'
            }
        ]
    });
}
async function getMockEnvironment(environmentId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockEnvironment.findUnique({
        where: {
            id: environmentId
        },
        include: {
            endpoints: {
                include: {
                    responses: {
                        include: {
                            conditions: true
                        },
                        orderBy: [
                            {
                                order: 'asc'
                            },
                            {
                                isDefault: 'desc'
                            }
                        ]
                    },
                    conditions: true
                },
                orderBy: {
                    order: 'asc'
                }
            }
        }
    });
}
async function createMockEndpoint(environmentId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockEndpoint.create({
        data: {
            environmentId,
            path: data.path,
            method: data.method.toUpperCase(),
            description: data.description,
            order: data.order || 0
        }
    });
}
async function createMockResponse(endpointId, data) {
    // If setting as default, unset other defaults for this endpoint
    if (data.isDefault) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockResponse.updateMany({
            where: {
                endpointId,
                isDefault: true
            },
            data: {
                isDefault: false
            }
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockResponse.create({
        data: {
            endpointId,
            statusCode: data.statusCode,
            name: data.name,
            description: data.description,
            responseBody: data.responseBody,
            responseHeaders: data.responseHeaders,
            delay: data.delay || 0,
            isDefault: data.isDefault || false,
            order: data.order || 0
        }
    });
}
async function createMockCondition(data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockCondition.create({
        data: {
            responseId: data.responseId,
            endpointId: data.endpointId,
            type: data.type,
            key: data.key,
            operator: data.operator,
            value: data.value,
            isCaseSensitive: data.isCaseSensitive || false,
            order: data.order || 0
        }
    });
}
async function updateMockEnvironment(environmentId, data) {
    // If setting as default, unset other defaults
    if (data.isDefault) {
        const env = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockEnvironment.findUnique({
            where: {
                id: environmentId
            },
            select: {
                projectId: true
            }
        });
        if (env) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockEnvironment.updateMany({
                where: {
                    projectId: env.projectId,
                    isDefault: true,
                    id: {
                        not: environmentId
                    }
                },
                data: {
                    isDefault: false
                }
            });
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockEnvironment.update({
        where: {
            id: environmentId
        },
        data
    });
}
async function deleteMockEnvironment(environmentId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockEnvironment.delete({
        where: {
            id: environmentId
        }
    });
}
}),
"[project]/src/app/api/mocks/environments/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.8_@babel+core@7.28.5_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mock.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
;
;
;
async function POST(request) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthUser"])(request);
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const { projectId, name, description, basePath, mode, whitelist, blacklist, isDefault } = await request.json();
        if (!projectId || !name) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'projectId and name are required'
            }, {
                status: 400
            });
        }
        // Verify project ownership
        const project = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findFirst({
            where: {
                id: projectId,
                userId: user.id
            }
        });
        if (!project) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Project not found'
            }, {
                status: 404
            });
        }
        const environment = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createMockEnvironment"])(projectId, user.id, {
            name,
            description,
            basePath,
            mode: mode || 'selective',
            whitelist: whitelist || [],
            blacklist: blacklist || [],
            isDefault: isDefault || false
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            environment
        });
    } catch (error) {
        console.error('Create mock environment error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error instanceof Error ? error.message : 'Internal server error'
        }, {
            status: 500
        });
    }
}
async function GET(request) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthUser"])(request);
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');
        if (!projectId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'projectId is required'
            }, {
                status: 400
            });
        }
        // Verify project ownership
        const project = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findFirst({
            where: {
                id: projectId,
                userId: user.id
            }
        });
        if (!project) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Project not found'
            }, {
                status: 404
            });
        }
        const environments = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMockEnvironments"])(projectId);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            environments
        });
    } catch (error) {
        console.error('Get mock environments error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__791ccf2f._.js.map