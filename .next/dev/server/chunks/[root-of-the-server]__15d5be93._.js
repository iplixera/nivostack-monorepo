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
"[project]/src/lib/business-config/targeting.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Targeting Rules Evaluation Engine
 * Evaluates targeting rules against user/device context
 */ __turbopack_context__.s([
    "evaluateTargeting",
    ()=>evaluateTargeting,
    "shouldReceiveRollout",
    ()=>shouldReceiveRollout
]);
function evaluateTargeting(targetingRules, context, defaultValue) {
    // If no targeting rules, return default value
    if (!targetingRules || !targetingRules.rules || targetingRules.rules.length === 0) {
        return defaultValue;
    }
    // Evaluate each rule
    for (const rule of targetingRules.rules){
        if (evaluateRule(rule, context)) {
            return rule.value;
        }
    }
    // No rules matched, return default
    return targetingRules.defaultValue !== undefined ? targetingRules.defaultValue : defaultValue;
}
/**
 * Evaluate a single targeting rule
 */ function evaluateRule(rule, context) {
    if (!rule.conditions || rule.conditions.length === 0) {
        return true // Empty rule always matches
        ;
    }
    const results = rule.conditions.map((condition)=>evaluateCondition(condition, context));
    // Combine results based on logic
    if (rule.logic === 'AND') {
        return results.every((r)=>r === true);
    } else {
        return results.some((r)=>r === true);
    }
}
/**
 * Evaluate a single condition
 */ function evaluateCondition(condition, context) {
    const { property, operator, value, caseSensitive = false } = condition;
    // Get property value from context
    const propertyValue = getPropertyValue(property, context);
    // Handle exists/notExists operators
    if (operator === 'exists') {
        return propertyValue !== undefined && propertyValue !== null;
    }
    if (operator === 'notExists') {
        return propertyValue === undefined || propertyValue === null;
    }
    // If property doesn't exist and operator requires a value, return false
    if (propertyValue === undefined || propertyValue === null) {
        return false;
    }
    // Normalize values for comparison
    const normalizedPropertyValue = normalizeValue(propertyValue, caseSensitive);
    const normalizedCompareValue = normalizeValue(value, caseSensitive);
    // Evaluate based on operator
    switch(operator){
        case 'equals':
            return normalizedPropertyValue === normalizedCompareValue;
        case 'contains':
            if (typeof normalizedPropertyValue === 'string' && typeof normalizedCompareValue === 'string') {
                return normalizedPropertyValue.includes(normalizedCompareValue);
            }
            return false;
        case 'startsWith':
            if (typeof normalizedPropertyValue === 'string' && typeof normalizedCompareValue === 'string') {
                return normalizedPropertyValue.startsWith(normalizedCompareValue);
            }
            return false;
        case 'endsWith':
            if (typeof normalizedPropertyValue === 'string' && typeof normalizedCompareValue === 'string') {
                return normalizedPropertyValue.endsWith(normalizedCompareValue);
            }
            return false;
        case 'greaterThan':
            return compareNumbers(normalizedPropertyValue, normalizedCompareValue) > 0;
        case 'lessThan':
            return compareNumbers(normalizedPropertyValue, normalizedCompareValue) < 0;
        case 'in':
            if (Array.isArray(normalizedCompareValue)) {
                return normalizedCompareValue.includes(normalizedPropertyValue);
            }
            return false;
        case 'notIn':
            if (Array.isArray(normalizedCompareValue)) {
                return !normalizedCompareValue.includes(normalizedPropertyValue);
            }
            return false;
        default:
            return false;
    }
}
/**
 * Get property value from context using dot notation
 * e.g., "user.email" -> context.user.email
 */ function getPropertyValue(property, context) {
    const parts = property.split('.');
    let value = context;
    for (const part of parts){
        if (value === undefined || value === null) {
            return undefined;
        }
        value = value[part];
    }
    return value;
}
/**
 * Normalize value for comparison
 */ function normalizeValue(value, caseSensitive) {
    if (typeof value === 'string' && !caseSensitive) {
        return value.toLowerCase();
    }
    return value;
}
/**
 * Compare two values as numbers
 */ function compareNumbers(a, b) {
    const numA = typeof a === 'number' ? a : parseFloat(String(a));
    const numB = typeof b === 'number' ? b : parseFloat(String(b));
    if (isNaN(numA) || isNaN(numB)) {
        return 0;
    }
    return numA - numB;
}
function shouldReceiveRollout(rolloutPercentage, context) {
    if (rolloutPercentage >= 100) {
        return true;
    }
    if (rolloutPercentage <= 0) {
        return false;
    }
    // Use userId or deviceId for consistent assignment
    const identifier = context.user?.id || context.device?.deviceId || 'default';
    // Simple hash function for consistent assignment
    const hash = simpleHash(identifier);
    const percentage = hash % 100 + 1 // 1-100
    ;
    return percentage <= rolloutPercentage;
}
/**
 * Simple hash function for consistent user assignment
 */ function simpleHash(str) {
    let hash = 0;
    for(let i = 0; i < str.length; i++){
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}
}),
"[project]/src/lib/business-config/events.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Config Update Event Broadcasting System
 * 
 * This module handles broadcasting config updates to connected SSE clients
 * In production, this could be replaced with Redis Pub/Sub or similar
 */ __turbopack_context__.s([
    "broadcastConfigUpdate",
    ()=>broadcastConfigUpdate,
    "getSubscriberCount",
    ()=>getSubscriberCount,
    "subscribeToConfigUpdates",
    ()=>subscribeToConfigUpdates
]);
// In-memory store for active SSE connections
// In production, use Redis or similar for distributed systems
const activeConnections = new Map();
function subscribeToConfigUpdates(projectId, callback) {
    if (!activeConnections.has(projectId)) {
        activeConnections.set(projectId, new Set());
    }
    const callbacks = activeConnections.get(projectId);
    callbacks.add(callback);
    // Return unsubscribe function
    return ()=>{
        callbacks.delete(callback);
        if (callbacks.size === 0) {
            activeConnections.delete(projectId);
        }
    };
}
function broadcastConfigUpdate(event) {
    const callbacks = activeConnections.get(event.projectId);
    if (callbacks) {
        callbacks.forEach((callback)=>{
            try {
                callback(event);
            } catch (error) {
                console.error('Error broadcasting config update:', error);
            }
        });
    }
}
function getSubscriberCount(projectId) {
    return activeConnections.get(projectId)?.size || 0;
}
}),
"[project]/src/lib/business-config/validation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Config Value Validation Engine
 * Validates config values against schema and constraints
 */ __turbopack_context__.s([
    "validateConfigValue",
    ()=>validateConfigValue
]);
function validateConfigValue(value, valueType, schema, constraints) {
    const errors = [];
    // Type validation
    if (schema?.type && !validateType(value, schema.type)) {
        errors.push(`Value must be of type ${schema.type}`);
    }
    // Value constraints
    if (constraints?.minValue !== null && constraints?.minValue !== undefined) {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value));
        if (isNaN(numValue) || numValue < constraints.minValue) {
            errors.push(`Value must be at least ${constraints.minValue}`);
        }
    }
    if (constraints?.maxValue !== null && constraints?.maxValue !== undefined) {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value));
        if (isNaN(numValue) || numValue > constraints.maxValue) {
            errors.push(`Value must be at most ${constraints.maxValue}`);
        }
    }
    // Length constraints (for strings)
    if (typeof value === 'string') {
        if (constraints?.minLength !== null && constraints?.minLength !== undefined) {
            if (value.length < constraints.minLength) {
                errors.push(`Value must be at least ${constraints.minLength} characters`);
            }
        }
        if (constraints?.maxLength !== null && constraints?.maxLength !== undefined) {
            if (value.length > constraints.maxLength) {
                errors.push(`Value must be at most ${constraints.maxLength} characters`);
            }
        }
        // Pattern validation
        if (constraints?.pattern) {
            try {
                const regex = new RegExp(constraints.pattern);
                if (!regex.test(value)) {
                    errors.push(`Value does not match required pattern`);
                }
            } catch (e) {
                errors.push(`Invalid pattern: ${constraints.pattern}`);
            }
        }
    }
    // Allowed values
    if (constraints?.allowedValues && constraints.allowedValues.length > 0) {
        if (!constraints.allowedValues.includes(value)) {
            errors.push(`Value must be one of: ${constraints.allowedValues.join(', ')}`);
        }
    }
    // Schema validation (for JSON)
    if (valueType === 'json' && schema) {
        const jsonErrors = validateJsonSchema(value, schema);
        errors.push(...jsonErrors);
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
/**
 * Validate value type
 */ function validateType(value, expectedType) {
    switch(expectedType){
        case 'string':
            return typeof value === 'string';
        case 'integer':
            return Number.isInteger(value) || typeof value === 'string' && /^-?\d+$/.test(value);
        case 'boolean':
            return typeof value === 'boolean' || value === 'true' || value === 'false' || value === 1 || value === 0;
        case 'decimal':
            return typeof value === 'number' || !isNaN(parseFloat(String(value)));
        case 'json':
            return typeof value === 'object' && value !== null;
        case 'image':
            return typeof value === 'string' && (value.startsWith('http') || value.startsWith('/'));
        default:
            return true;
    }
}
/**
 * Validate JSON schema (simplified)
 */ function validateJsonSchema(value, schema) {
    const errors = [];
    if (typeof value !== 'object' || value === null) {
        return [
            'Value must be a JSON object'
        ];
    }
    // Validate properties
    if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)){
            if (propSchema.required && !(key in value)) {
                errors.push(`Missing required property: ${key}`);
            }
            if (key in value) {
                const propErrors = validateConfigValue(value[key], propSchema.type || 'string', propSchema, {
                    minValue: propSchema.min,
                    maxValue: propSchema.max,
                    minLength: propSchema.minLength,
                    maxLength: propSchema.maxLength,
                    pattern: propSchema.pattern,
                    allowedValues: propSchema.allowedValues
                });
                errors.push(...propErrors.errors.map((e)=>`${key}: ${e}`));
            }
        }
    }
    // Validate array items
    if (schema.items && Array.isArray(value)) {
        value.forEach((item, index)=>{
            const itemErrors = validateConfigValue(item, schema.items.type || 'string', schema.items, {
                minValue: schema.items.min,
                maxValue: schema.items.max,
                minLength: schema.items.minLength,
                maxLength: schema.items.maxLength,
                pattern: schema.items.pattern,
                allowedValues: schema.items.allowedValues
            });
            errors.push(...itemErrors.errors.map((e)=>`[${index}]: ${e}`));
        });
    }
    return errors;
}
}),
"[project]/src/app/api/business-config/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.8_@babel+core@7.28.5_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$business$2d$config$2f$targeting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/business-config/targeting.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$business$2d$config$2f$events$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/business-config/events.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$business$2d$config$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/business-config/validation.ts [app-route] (ecmascript)");
;
;
;
;
;
;
// Valid value types
const VALUE_TYPES = [
    'string',
    'integer',
    'boolean',
    'decimal',
    'json',
    'image'
];
// Helper to extract the value based on type
function extractValue(config) {
    switch(config.valueType){
        case 'string':
            return config.stringValue;
        case 'integer':
            return config.integerValue;
        case 'boolean':
            return config.booleanValue;
        case 'decimal':
            return config.decimalValue;
        case 'json':
            return config.jsonValue;
        case 'image':
            return config.imageUrl;
        default:
            return null;
    }
}
async function GET(request) {
    try {
        const apiKey = request.headers.get('x-api-key');
        const authHeader = request.headers.get('authorization');
        const projectId = request.nextUrl.searchParams.get('projectId');
        const category = request.nextUrl.searchParams.get('category');
        const key = request.nextUrl.searchParams.get('key');
        // SDK request - return configs for mobile app (simplified format for caching)
        if (apiKey) {
            const project = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
                where: {
                    apiKey
                }
            });
            if (!project) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Invalid API key'
                }, {
                    status: 401
                });
            }
            // Validate subscription and feature access
            const { validateSubscription } = await __turbopack_context__.A("[project]/src/lib/subscription-validation.ts [app-route] (ecmascript, async loader)");
            const validation = await validateSubscription(project.userId);
            if (!validation.valid) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    configs: [],
                    error: validation.error || 'Subscription invalid',
                    message: validation.error || 'Please upgrade to continue using DevBridge.'
                }, {
                    status: 403
                });
            }
            // Get user/device context from request (optional)
            const contextHeader = request.headers.get('x-devbridge-context');
            let context = {};
            if (contextHeader) {
                try {
                    context = JSON.parse(contextHeader);
                } catch (e) {
                    console.warn('Invalid context header:', e);
                }
            }
            // Build where clause
            const where = {
                projectId: project.id,
                isEnabled: true
            };
            if (category) where.category = category;
            if (key) where.key = key;
            const configs = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].businessConfig.findMany({
                where,
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
                    metadata: true
                },
                orderBy: {
                    key: 'asc'
                }
            });
            // Transform to simplified key-value format for SDK with targeting evaluation
            const configMap = {};
            const configMeta = {};
            for (const config of configs){
                // Extract advanced fields from metadata
                const metadata = config.metadata;
                const rolloutPercentage = metadata?.rolloutPercentage || 100;
                const targetingRules = metadata?.targetingRules;
                const defaultValueFromMeta = metadata?.defaultValue;
                // Check rollout percentage first
                const receivesRollout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$business$2d$config$2f$targeting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shouldReceiveRollout"])(rolloutPercentage, context);
                if (!receivesRollout) {
                    // Track that user didn't receive config due to rollout
                    trackConfigUsage(project.id, config.key, {
                        deviceId: context.device?.deviceId,
                        userId: context.user?.id,
                        rolloutReceived: false,
                        targetingMatched: false,
                        cacheHit: false
                    });
                    continue; // Skip this config if user is not in rollout
                }
                // Get default value (use metadata defaultValue if available, otherwise extract from config)
                const defaultValue = defaultValueFromMeta !== undefined ? defaultValueFromMeta : extractValue(config);
                // Check for active experiments on this config
                const activeExperiment = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].experiment.findFirst({
                    where: {
                        configId: config.id,
                        status: 'running',
                        AND: [
                            {
                                OR: [
                                    {
                                        startDate: null
                                    },
                                    {
                                        startDate: {
                                            lte: new Date()
                                        }
                                    }
                                ]
                            },
                            {
                                OR: [
                                    {
                                        endDate: null
                                    },
                                    {
                                        endDate: {
                                            gte: new Date()
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                });
                let finalValue = defaultValue;
                let targetingMatched = false;
                // If experiment exists, assign user to variant
                if (activeExperiment) {
                    try {
                        const { assignToVariant } = await __turbopack_context__.A("[project]/src/lib/business-config/experiments.ts [app-route] (ecmascript, async loader)");
                        const assignment = assignToVariant({
                            id: activeExperiment.id,
                            variants: activeExperiment.variants,
                            assignmentType: activeExperiment.assignmentType,
                            targetingRules: activeExperiment.targetingRules
                        }, {
                            deviceId: context.device?.deviceId,
                            userId: context.user?.id,
                            ...context
                        });
                        if (assignment) {
                            // Store assignment if not exists
                            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].experimentAssignment.upsert({
                                where: {
                                    experimentId_deviceId_userId: {
                                        experimentId: activeExperiment.id,
                                        deviceId: context.device?.deviceId || null,
                                        userId: context.user?.id || null
                                    }
                                },
                                update: {
                                    lastSeenAt: new Date()
                                },
                                create: {
                                    experimentId: activeExperiment.id,
                                    deviceId: context.device?.deviceId || null,
                                    userId: context.user?.id || null,
                                    variantIndex: assignment.variantIndex,
                                    variantName: assignment.variant.name
                                }
                            });
                            // Use experiment variant value
                            finalValue = assignment.variant.value;
                        }
                    } catch (error) {
                        console.error('Experiment assignment error:', error);
                    // Fallback to targeting/default
                    }
                }
                // If no experiment or experiment assignment failed, evaluate targeting rules
                if (finalValue === defaultValue && targetingRules) {
                    try {
                        const targetedValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$business$2d$config$2f$targeting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evaluateTargeting"])(targetingRules, context, defaultValueFromMeta !== undefined ? defaultValueFromMeta : defaultValue);
                        targetingMatched = targetedValue !== defaultValue;
                        finalValue = targetedValue;
                    } catch (error) {
                        console.error('Targeting evaluation error:', error);
                        // Fallback to default value on error
                        finalValue = defaultValue;
                    }
                }
                // Track config usage
                trackConfigUsage(project.id, config.key, {
                    deviceId: context.device?.deviceId,
                    userId: context.user?.id,
                    rolloutReceived: true,
                    targetingMatched,
                    cacheHit: false // TODO: Implement cache detection
                });
                configMap[config.key] = finalValue;
                configMeta[config.key] = {
                    type: config.valueType,
                    category: config.category,
                    version: config.version,
                    updatedAt: config.updatedAt.toISOString()
                };
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                configs: configMap,
                meta: configMeta,
                fetchedAt: new Date().toISOString()
            });
        }
        // Dashboard request - return full configs
        if (authHeader && projectId) {
            const token = authHeader.replace('Bearer ', '');
            const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(token);
            if (!payload) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Unauthorized'
                }, {
                    status: 401
                });
            }
            // Verify project ownership
            const project = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findFirst({
                where: {
                    id: projectId,
                    userId: payload.userId
                }
            });
            if (!project) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Project not found'
                }, {
                    status: 404
                });
            }
            // Build where clause
            const where = {
                projectId
            };
            if (category) where.category = category;
            const configs = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].businessConfig.findMany({
                where,
                orderBy: [
                    {
                        category: 'asc'
                    },
                    {
                        key: 'asc'
                    }
                ]
            });
            // Get unique categories
            const categories = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].businessConfig.findMany({
                where: {
                    projectId
                },
                select: {
                    category: true
                },
                distinct: [
                    'category'
                ]
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                configs,
                categories: categories.map((c)=>c.category).filter(Boolean)
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Unauthorized'
        }, {
            status: 401
        });
    } catch (error) {
        console.error('BusinessConfig GET error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const token = authHeader.replace('Bearer ', '');
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(token);
        if (!payload) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const body = await request.json();
        const { projectId, key, label, description, valueType, value, category, isEnabled, metadata, targetingRules, defaultValue, rolloutPercentage, validationSchema, minValue, maxValue, minLength, maxLength, pattern, allowedValues, deploymentStrategy, deploymentConfig } = body;
        if (!projectId || !key || !valueType) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing required fields: projectId, key, valueType'
            }, {
                status: 400
            });
        }
        if (!VALUE_TYPES.includes(valueType)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Invalid valueType. Must be one of: ${VALUE_TYPES.join(', ')}`
            }, {
                status: 400
            });
        }
        // Validate value if validation schema/constraints provided
        const constraints = {
            minValue,
            maxValue,
            minLength,
            maxLength,
            pattern,
            allowedValues
        };
        if (validationSchema || Object.values(constraints).some((v)=>v !== undefined && v !== null)) {
            const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$business$2d$config$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateConfigValue"])(value, valueType, validationSchema, constraints);
            if (!validation.valid) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Validation failed',
                    details: validation.errors
                }, {
                    status: 400
                });
            }
        }
        // Verify project ownership
        const project = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findFirst({
            where: {
                id: projectId,
                userId: payload.userId
            }
        });
        if (!project) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Project not found'
            }, {
                status: 404
            });
        }
        // Check business config keys quota
        const { checkThrottling } = await __turbopack_context__.A("[project]/src/lib/throttling.ts [app-route] (ecmascript, async loader)");
        const throttling = await checkThrottling(project.userId, 'businessConfigKeys');
        if (throttling.throttled || throttling.usage && throttling.usage.limit !== null && throttling.usage.used >= throttling.usage.limit) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: throttling.error || `Business config keys limit reached. You have used ${throttling.usage?.used || 0} of ${throttling.usage?.limit || 0} keys. Please upgrade your plan to create more keys.`,
                usage: throttling.usage
            }, {
                status: throttling.throttled ? 429 : 403,
                headers: throttling.retryAfter ? {
                    'Retry-After': throttling.retryAfter.toString()
                } : {}
            });
        }
        // Prepare value fields based on type
        const valueFields = getValueFields(valueType, value);
        // Store advanced fields in metadata JSON
        const advancedMetadata = {};
        if (targetingRules) advancedMetadata.targetingRules = targetingRules;
        if (defaultValue !== undefined) advancedMetadata.defaultValue = defaultValue;
        if (rolloutPercentage !== undefined) advancedMetadata.rolloutPercentage = Math.max(0, Math.min(100, rolloutPercentage));
        if (validationSchema) advancedMetadata.validationSchema = validationSchema;
        if (minValue !== undefined) advancedMetadata.minValue = minValue;
        if (maxValue !== undefined) advancedMetadata.maxValue = maxValue;
        if (minLength !== undefined) advancedMetadata.minLength = minLength;
        if (maxLength !== undefined) advancedMetadata.maxLength = maxLength;
        if (pattern) advancedMetadata.pattern = pattern;
        if (allowedValues) advancedMetadata.allowedValues = allowedValues;
        if (deploymentStrategy) advancedMetadata.deploymentStrategy = deploymentStrategy;
        if (deploymentConfig) advancedMetadata.deploymentConfig = deploymentConfig;
        // Merge with existing metadata
        const finalMetadata = metadata || {};
        const combinedMetadata = {
            ...finalMetadata,
            ...advancedMetadata
        };
        const config = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].businessConfig.create({
            data: {
                projectId,
                key,
                label: label || null,
                description: description || null,
                valueType,
                ...valueFields,
                category: category || null,
                isEnabled: isEnabled !== false,
                metadata: Object.keys(combinedMetadata).length > 0 ? combinedMetadata : null
            }
        });
        // Log change
        await logConfigChange(config.id, projectId, payload.userId, 'create', null, extractValue(config), body);
        // Broadcast update to SSE subscribers
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$business$2d$config$2f$events$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["broadcastConfigUpdate"])({
            projectId,
            configKey: config.key,
            version: config.version,
            updatedAt: config.updatedAt
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            config
        });
    } catch (error) {
        console.error('BusinessConfig POST error:', error);
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'A config with this key already exists in this project'
            }, {
                status: 409
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
async function PUT(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const token = authHeader.replace('Bearer ', '');
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(token);
        if (!payload) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const body = await request.json();
        const { id, key, label, description, valueType, value, category, isEnabled, metadata, targetingRules, defaultValue, rolloutPercentage, validationSchema, minValue, maxValue, minLength, maxLength, pattern, allowedValues, deploymentStrategy, deploymentConfig } = body;
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing config ID'
            }, {
                status: 400
            });
        }
        // Verify config ownership
        const existingConfig = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].businessConfig.findUnique({
            where: {
                id
            },
            include: {
                project: true
            }
        });
        if (!existingConfig || existingConfig.project.userId !== payload.userId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Config not found'
            }, {
                status: 404
            });
        }
        // Prepare update data
        const updateData = {};
        if (key !== undefined) updateData.key = key;
        if (label !== undefined) updateData.label = label || null;
        if (description !== undefined) updateData.description = description || null;
        if (category !== undefined) updateData.category = category || null;
        if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
        if (metadata !== undefined) updateData.metadata = metadata;
        if (targetingRules !== undefined) updateData.targetingRules = targetingRules || null;
        if (defaultValue !== undefined) updateData.defaultValue = defaultValue !== null ? defaultValue : null;
        if (rolloutPercentage !== undefined) updateData.rolloutPercentage = Math.max(0, Math.min(100, rolloutPercentage));
        if (validationSchema !== undefined) updateData.validationSchema = validationSchema || null;
        if (minValue !== undefined) updateData.minValue = minValue !== null ? minValue : null;
        if (maxValue !== undefined) updateData.maxValue = maxValue !== null ? maxValue : null;
        if (minLength !== undefined) updateData.minLength = minLength !== null ? minLength : null;
        if (maxLength !== undefined) updateData.maxLength = maxLength !== null ? maxLength : null;
        if (pattern !== undefined) updateData.pattern = pattern || null;
        if (allowedValues !== undefined) updateData.allowedValues = allowedValues || null;
        if (deploymentStrategy !== undefined) updateData.deploymentStrategy = deploymentStrategy || null;
        if (deploymentConfig !== undefined) updateData.deploymentConfig = deploymentConfig || null;
        // Validate value if validation constraints are being updated
        if (value !== undefined && (validationSchema !== undefined || minValue !== undefined || maxValue !== undefined || minLength !== undefined || maxLength !== undefined || pattern !== undefined || allowedValues !== undefined)) {
            const finalValue = valueType !== undefined ? value : extractValue(existingConfig);
            const finalType = valueType !== undefined ? valueType : existingConfig.valueType;
            const finalSchema = validationSchema !== undefined ? validationSchema : existingConfig.validationSchema;
            const finalConstraints = {
                minValue: minValue !== undefined ? minValue : existingConfig.minValue,
                maxValue: maxValue !== undefined ? maxValue : existingConfig.maxValue,
                minLength: minLength !== undefined ? minLength : existingConfig.minLength,
                maxLength: maxLength !== undefined ? maxLength : existingConfig.maxLength,
                pattern: pattern !== undefined ? pattern : existingConfig.pattern,
                allowedValues: allowedValues !== undefined ? allowedValues : existingConfig.allowedValues
            };
            const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$business$2d$config$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateConfigValue"])(finalValue, finalType, finalSchema, finalConstraints);
            if (!validation.valid) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Validation failed',
                    details: validation.errors
                }, {
                    status: 400
                });
            }
        }
        // Handle value type and value changes
        if (valueType !== undefined) {
            if (!VALUE_TYPES.includes(valueType)) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: `Invalid valueType. Must be one of: ${VALUE_TYPES.join(', ')}`
                }, {
                    status: 400
                });
            }
            updateData.valueType = valueType;
            // Clear all value fields and set new one
            updateData.stringValue = null;
            updateData.integerValue = null;
            updateData.booleanValue = null;
            updateData.decimalValue = null;
            updateData.jsonValue = null;
            updateData.imageUrl = null;
            if (value !== undefined) {
                const valueFields = getValueFields(valueType, value);
                Object.assign(updateData, valueFields);
            }
        } else if (value !== undefined) {
            // Update value using existing type
            const valueFields = getValueFields(existingConfig.valueType, value);
            Object.assign(updateData, valueFields);
        }
        // Increment version on any update
        updateData.version = existingConfig.version + 1;
        // Store before value for change log
        const beforeValue = extractValue(existingConfig);
        const config = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].businessConfig.update({
            where: {
                id
            },
            data: updateData
        });
        // Log change
        const afterValue = extractValue(config);
        await logConfigChange(config.id, config.projectId, payload.userId, 'update', beforeValue, afterValue, body);
        // Broadcast update to SSE subscribers
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$business$2d$config$2f$events$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["broadcastConfigUpdate"])({
            projectId: config.projectId,
            configKey: config.key,
            version: config.version,
            updatedAt: config.updatedAt
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            config
        });
    } catch (error) {
        console.error('BusinessConfig PUT error:', error);
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'A config with this key already exists in this project'
            }, {
                status: 409
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
async function DELETE(request) {
    try {
        const authHeader = request.headers.get('authorization');
        const configId = request.nextUrl.searchParams.get('id');
        if (!authHeader) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const token = authHeader.replace('Bearer ', '');
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(token);
        if (!payload) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        if (!configId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing config ID'
            }, {
                status: 400
            });
        }
        // Verify config ownership
        const existingConfig = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].businessConfig.findUnique({
            where: {
                id: configId
            },
            include: {
                project: true
            }
        });
        if (!existingConfig || existingConfig.project.userId !== payload.userId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Config not found'
            }, {
                status: 404
            });
        }
        // Log change before deletion
        const beforeValue = extractValue(existingConfig);
        await logConfigChange(existingConfig.id, existingConfig.projectId, payload.userId, 'delete', beforeValue, null, {});
        // Broadcast update to SSE subscribers
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$business$2d$config$2f$events$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["broadcastConfigUpdate"])({
            projectId: existingConfig.projectId,
            configKey: existingConfig.key,
            version: existingConfig.version,
            updatedAt: new Date()
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].businessConfig.delete({
            where: {
                id: configId
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        });
    } catch (error) {
        console.error('BusinessConfig DELETE error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
// Helper function to prepare value fields based on type
function getValueFields(valueType, value) {
    const fields = {
        stringValue: null,
        integerValue: null,
        booleanValue: null,
        decimalValue: null,
        jsonValue: null,
        imageUrl: null
    };
    if (value === null || value === undefined) {
        return fields;
    }
    switch(valueType){
        case 'string':
            fields.stringValue = String(value);
            break;
        case 'integer':
            fields.integerValue = parseInt(String(value), 10) || 0;
            break;
        case 'boolean':
            fields.booleanValue = value === true || value === 'true' || value === 1;
            break;
        case 'decimal':
            fields.decimalValue = parseFloat(String(value)) || 0;
            break;
        case 'json':
            try {
                fields.jsonValue = typeof value === 'string' ? JSON.parse(value) : value;
            } catch (e) {
                // If JSON parsing fails, treat as invalid and return null fields
                throw new Error(`Invalid JSON value: ${e instanceof Error ? e.message : 'Unknown error'}`);
            }
            break;
        case 'image':
            fields.imageUrl = String(value);
            break;
    }
    return fields;
}
/**
 * Log config changes to audit trail
 */ async function logConfigChange(configId, projectId, userId, action, beforeValue, afterValue, changes) {
    try {
        // Get user name for display
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
            where: {
                id: userId
            },
            select: {
                name: true,
                email: true
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].configChangeLog.create({
            data: {
                configId,
                projectId,
                userId,
                userName: user?.name || user?.email || 'Unknown',
                action,
                beforeValue: beforeValue !== undefined ? beforeValue : null,
                afterValue: afterValue !== undefined ? afterValue : null,
                changes: changes || null
            }
        });
    } catch (error) {
        console.error('Failed to log config change:', error);
    // Don't fail the request if logging fails
    }
}
/**
 * Track config usage metrics
 */ async function trackConfigUsage(projectId, configKey, metrics) {
    try {
        const uniqueKey = `${projectId}:${configKey}:${metrics.deviceId || 'none'}:${metrics.userId || 'none'}`;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].configUsageMetric.upsert({
            where: {
                projectId_configKey_deviceId_userId: {
                    projectId,
                    configKey,
                    deviceId: metrics.deviceId || null,
                    userId: metrics.userId || null
                }
            },
            update: {
                fetchCount: {
                    increment: 1
                },
                cacheHit: metrics.cacheHit,
                targetingMatched: metrics.targetingMatched,
                rolloutReceived: metrics.rolloutReceived,
                lastFetchedAt: new Date()
            },
            create: {
                projectId,
                configKey,
                deviceId: metrics.deviceId || null,
                userId: metrics.userId || null,
                fetchCount: 1,
                cacheHit: metrics.cacheHit,
                targetingMatched: metrics.targetingMatched,
                rolloutReceived: metrics.rolloutReceived
            }
        });
    } catch (error) {
        console.error('Failed to track config usage:', error);
    // Don't fail the request if tracking fails
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__15d5be93._.js.map