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
"[project]/src/lib/build.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createBuild",
    ()=>createBuild,
    "deleteBuild",
    ()=>deleteBuild,
    "getActiveBuild",
    ()=>getActiveBuild,
    "getBuild",
    ()=>getBuild,
    "getBuildCreator",
    ()=>getBuildCreator,
    "getBuildDiff",
    ()=>getBuildDiff,
    "getBuildHistory",
    ()=>getBuildHistory,
    "setBuildMode",
    ()=>setBuildMode,
    "updateBuild",
    ()=>updateBuild
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
// Feature registry for extensibility
const FEATURE_REGISTRY = {
    business_config: {
        name: 'Business Configuration',
        snapshot: snapshotBusinessConfig
    },
    localization: {
        name: 'Localization',
        snapshot: snapshotLocalization
    },
    api_mocks: {
        name: 'API Mocks',
        snapshot: snapshotApiMocks
    }
};
/**
 * Snapshot current business config state (API response format)
 */ async function snapshotBusinessConfig(projectId) {
    const configs = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].businessConfig.findMany({
        where: {
            projectId,
            isEnabled: true
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
            updatedAt: true
        },
        orderBy: {
            key: 'asc'
        }
    });
    // Transform to API response format
    const configMap = {};
    const configMeta = {};
    for (const config of configs){
        // Extract value based on type
        let value = null;
        switch(config.valueType){
            case 'string':
                value = config.stringValue;
                break;
            case 'integer':
                value = config.integerValue;
                break;
            case 'boolean':
                value = config.booleanValue;
                break;
            case 'decimal':
                value = config.decimalValue;
                break;
            case 'json':
                value = config.jsonValue;
                break;
            case 'image':
                value = config.imageUrl;
                break;
        }
        configMap[config.key] = value;
        configMeta[config.key] = {
            type: config.valueType,
            category: config.category,
            version: config.version,
            updatedAt: config.updatedAt.toISOString()
        };
    }
    return {
        configs: configMap,
        meta: configMeta,
        fetchedAt: new Date().toISOString()
    };
}
/**
 * Snapshot current localization state (API response format)
 */ async function snapshotLocalization(projectId) {
    const languages = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].language.findMany({
        where: {
            projectId
        },
        include: {
            translations: {
                include: {
                    key: true
                }
            }
        }
    });
    // Transform to API response format
    const translations = {};
    const languageList = [];
    for (const lang of languages){
        languageList.push(lang.code);
        translations[lang.code] = {};
        for (const translation of lang.translations){
            translations[lang.code][translation.key.key] = translation.value;
        }
    }
    return {
        translations,
        languages: languageList,
        fetchedAt: new Date().toISOString()
    };
}
/**
 * Snapshot current API Mocks state (API response format)
 */ async function snapshotApiMocks(projectId) {
    const environments = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockEnvironment.findMany({
        where: {
            projectId
        },
        include: {
            endpoints: {
                where: {
                    isEnabled: true
                },
                include: {
                    responses: {
                        where: {
                            isEnabled: true
                        },
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
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
    // Transform to API response format
    const environmentsData = environments.map((env)=>({
            id: env.id,
            name: env.name,
            description: env.description,
            basePath: env.basePath,
            mode: env.mode,
            whitelist: env.whitelist,
            blacklist: env.blacklist,
            isEnabled: env.isEnabled,
            isDefault: env.isDefault,
            endpoints: env.endpoints.map((endpoint)=>({
                    id: endpoint.id,
                    path: endpoint.path,
                    method: endpoint.method,
                    description: endpoint.description,
                    order: endpoint.order,
                    responses: endpoint.responses.map((response)=>({
                            id: response.id,
                            statusCode: response.statusCode,
                            name: response.name,
                            description: response.description,
                            responseBody: response.responseBody,
                            responseHeaders: response.responseHeaders,
                            delay: response.delay,
                            isDefault: response.isDefault,
                            order: response.order,
                            conditions: response.conditions.map((condition)=>({
                                    type: condition.type,
                                    key: condition.key,
                                    operator: condition.operator,
                                    value: condition.value,
                                    isCaseSensitive: condition.isCaseSensitive,
                                    order: condition.order
                                }))
                        })),
                    conditions: endpoint.conditions.map((condition)=>({
                            type: condition.type,
                            key: condition.key,
                            operator: condition.operator,
                            value: condition.value,
                            isCaseSensitive: condition.isCaseSensitive,
                            order: condition.order
                        }))
                }))
        }));
    return {
        environments: environmentsData,
        fetchedAt: new Date().toISOString()
    };
}
/**
 * Compare two builds and generate change log
 */ async function compareBuilds(projectId, oldBuildId, newBuildId, userId) {
    const newBuild = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].build.findUnique({
        where: {
            id: newBuildId
        },
        include: {
            features: true
        }
    });
    if (!newBuild) {
        throw new Error('New build not found');
    }
    const changeLogs = [];
    // If no old build, all items are "added"
    if (!oldBuildId) {
        for (const feature of newBuild.features){
            const snapshot = feature.snapshotData;
            if (feature.featureType === 'business_config') {
                const configs = snapshot.configs;
                for (const [key, value] of Object.entries(configs)){
                    changeLogs.push({
                        buildId: newBuildId,
                        featureType: feature.featureType,
                        changeType: 'added',
                        itemKey: key,
                        itemLabel: key,
                        oldValue: null,
                        newValue: value,
                        changedBy: userId
                    });
                }
            } else if (feature.featureType === 'localization') {
                const translations = snapshot.translations;
                for (const [langCode, langTranslations] of Object.entries(translations)){
                    for (const [key, value] of Object.entries(langTranslations)){
                        changeLogs.push({
                            buildId: newBuildId,
                            featureType: feature.featureType,
                            changeType: 'added',
                            itemKey: `${langCode}:${key}`,
                            itemLabel: `${langCode}:${key}`,
                            oldValue: null,
                            newValue: value,
                            changedBy: userId
                        });
                    }
                }
            } else if (feature.featureType === 'api_mocks') {
                const environments = snapshot.environments;
                for (const env of environments){
                    for (const endpoint of env.endpoints){
                        changeLogs.push({
                            buildId: newBuildId,
                            featureType: feature.featureType,
                            changeType: 'added',
                            itemKey: `${env.id}:${endpoint.id}`,
                            itemLabel: `${env.name} - ${endpoint.method} ${endpoint.path}`,
                            oldValue: null,
                            newValue: endpoint,
                            changedBy: userId
                        });
                    }
                }
            }
        }
    } else {
        // Compare with previous build
        const oldBuild = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].build.findUnique({
            where: {
                id: oldBuildId
            },
            include: {
                features: true
            }
        });
        if (oldBuild) {
            // Compare each feature type
            for (const featureType of Object.keys(FEATURE_REGISTRY)){
                const oldFeature = oldBuild.features.find((f)=>f.featureType === featureType);
                const newFeature = newBuild.features.find((f)=>f.featureType === featureType);
                const oldData = oldFeature?.snapshotData;
                const newData = newFeature?.snapshotData;
                if (featureType === 'business_config') {
                    const oldConfigs = oldData?.configs;
                    const newConfigs = newData?.configs;
                    // Find added and changed
                    if (newConfigs) {
                        for (const [key, newValue] of Object.entries(newConfigs)){
                            const oldValue = oldConfigs?.[key];
                            if (oldValue === undefined) {
                                changeLogs.push({
                                    buildId: newBuildId,
                                    featureType,
                                    changeType: 'added',
                                    itemKey: key,
                                    itemLabel: key,
                                    oldValue: null,
                                    newValue,
                                    changedBy: userId
                                });
                            } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                                changeLogs.push({
                                    buildId: newBuildId,
                                    featureType,
                                    changeType: 'changed',
                                    itemKey: key,
                                    itemLabel: key,
                                    oldValue,
                                    newValue,
                                    changedBy: userId
                                });
                            }
                        }
                    }
                    // Find deleted
                    if (oldConfigs) {
                        for (const key of Object.keys(oldConfigs)){
                            if (!newConfigs || !(key in newConfigs)) {
                                changeLogs.push({
                                    buildId: newBuildId,
                                    featureType,
                                    changeType: 'deleted',
                                    itemKey: key,
                                    itemLabel: key,
                                    oldValue: oldConfigs[key],
                                    newValue: null,
                                    changedBy: userId
                                });
                            }
                        }
                    }
                } else if (featureType === 'localization') {
                    const oldTranslations = oldData?.translations;
                    const newTranslations = newData?.translations;
                    // Find added and changed
                    if (newTranslations) {
                        for (const [langCode, langTranslations] of Object.entries(newTranslations)){
                            for (const [key, newValue] of Object.entries(langTranslations)){
                                const itemKey = `${langCode}:${key}`;
                                const oldValue = oldTranslations?.[langCode]?.[key];
                                if (oldValue === undefined) {
                                    changeLogs.push({
                                        buildId: newBuildId,
                                        featureType,
                                        changeType: 'added',
                                        itemKey,
                                        itemLabel: itemKey,
                                        oldValue: null,
                                        newValue,
                                        changedBy: userId
                                    });
                                } else if (oldValue !== newValue) {
                                    changeLogs.push({
                                        buildId: newBuildId,
                                        featureType,
                                        changeType: 'changed',
                                        itemKey,
                                        itemLabel: itemKey,
                                        oldValue,
                                        newValue,
                                        changedBy: userId
                                    });
                                }
                            }
                        }
                    }
                    // Find deleted
                    if (oldTranslations) {
                        for (const [langCode, langTranslations] of Object.entries(oldTranslations)){
                            for (const key of Object.keys(langTranslations)){
                                const itemKey = `${langCode}:${key}`;
                                if (!newTranslations?.[langCode] || !(key in newTranslations[langCode])) {
                                    changeLogs.push({
                                        buildId: newBuildId,
                                        featureType,
                                        changeType: 'deleted',
                                        itemKey,
                                        itemLabel: itemKey,
                                        oldValue: langTranslations[key],
                                        newValue: null,
                                        changedBy: userId
                                    });
                                }
                            }
                        }
                    }
                } else if (featureType === 'api_mocks') {
                    const oldEnvironments = oldData?.environments;
                    const newEnvironments = newData?.environments;
                    // Find added and changed endpoints
                    if (newEnvironments) {
                        for (const newEnv of newEnvironments){
                            const oldEnv = oldEnvironments?.find((e)=>e.id === newEnv.id);
                            for (const newEndpoint of newEnv.endpoints){
                                const oldEndpoint = oldEnv?.endpoints.find((e)=>e.id === newEndpoint.id);
                                const itemKey = `${newEnv.id}:${newEndpoint.id}`;
                                const itemLabel = `${newEnv.name} - ${newEndpoint.method} ${newEndpoint.path}`;
                                if (!oldEndpoint) {
                                    changeLogs.push({
                                        buildId: newBuildId,
                                        featureType,
                                        changeType: 'added',
                                        itemKey,
                                        itemLabel,
                                        oldValue: null,
                                        newValue: newEndpoint,
                                        changedBy: userId
                                    });
                                } else if (JSON.stringify(oldEndpoint) !== JSON.stringify(newEndpoint)) {
                                    changeLogs.push({
                                        buildId: newBuildId,
                                        featureType,
                                        changeType: 'changed',
                                        itemKey,
                                        itemLabel,
                                        oldValue: oldEndpoint,
                                        newValue: newEndpoint,
                                        changedBy: userId
                                    });
                                }
                            }
                        }
                    }
                    // Find deleted endpoints
                    if (oldEnvironments) {
                        for (const oldEnv of oldEnvironments){
                            const newEnv = newEnvironments?.find((e)=>e.id === oldEnv.id);
                            for (const oldEndpoint of oldEnv.endpoints){
                                const exists = newEnv?.endpoints.some((e)=>e.id === oldEndpoint.id);
                                if (!exists) {
                                    changeLogs.push({
                                        buildId: newBuildId,
                                        featureType,
                                        changeType: 'deleted',
                                        itemKey: `${oldEnv.id}:${oldEndpoint.id}`,
                                        itemLabel: `${oldEnv.name} - ${oldEndpoint.method} ${oldEndpoint.path}`,
                                        oldValue: oldEndpoint,
                                        newValue: null,
                                        changedBy: userId
                                    });
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
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].buildChangeLog.createMany({
            data: changeLogs.map((log)=>({
                    buildId: log.buildId,
                    featureType: log.featureType,
                    changeType: log.changeType,
                    itemKey: log.itemKey,
                    itemLabel: log.itemLabel,
                    oldValue: log.oldValue,
                    newValue: log.newValue,
                    changedBy: log.changedBy
                }))
        });
    }
    return changeLogs;
}
async function createBuild(projectId, userId, featureType, name, description) {
    // Get next version number for this feature type
    const lastBuild = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].build.findFirst({
        where: {
            projectId,
            features: {
                some: {
                    featureType
                }
            }
        },
        orderBy: {
            version: 'desc'
        },
        select: {
            version: true
        }
    });
    const nextVersion = (lastBuild?.version || 0) + 1;
    // Get previous build for this feature type for comparison
    const previousBuild = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].build.findFirst({
        where: {
            projectId,
            features: {
                some: {
                    featureType
                }
            }
        },
        orderBy: {
            version: 'desc'
        },
        select: {
            id: true
        }
    });
    // Create snapshot for the specific feature
    let snapshot;
    let itemCount = 0;
    let configCount = 0;
    let translationCount = 0;
    if (featureType === 'business_config') {
        snapshot = await snapshotBusinessConfig(projectId);
        itemCount = Object.keys(snapshot.configs).length;
        configCount = itemCount;
    } else if (featureType === 'localization') {
        snapshot = await snapshotLocalization(projectId);
        translationCount = Object.values(snapshot.translations).reduce((sum, lang)=>sum + Object.keys(lang).length, 0);
        itemCount = translationCount;
    } else if (featureType === 'api_mocks') {
        snapshot = await snapshotApiMocks(projectId);
        // Count total endpoints across all environments
        itemCount = snapshot.environments.reduce((sum, env)=>sum + env.endpoints.length, 0);
    } else {
        throw new Error(`Unknown feature type: ${featureType}`);
    }
    // Create build with only this feature
    const build = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].build.create({
        data: {
            projectId,
            version: nextVersion,
            name: name || `${FEATURE_REGISTRY[featureType].name} v${nextVersion}`,
            description,
            createdBy: userId,
            businessConfigSnapshot: featureType === 'business_config' ? snapshot : null,
            localizationSnapshot: featureType === 'localization' ? snapshot : null,
            configCount,
            translationCount,
            features: {
                create: [
                    {
                        featureType,
                        snapshotData: snapshot,
                        itemCount
                    }
                ]
            }
        },
        include: {
            features: true
        }
    });
    // Generate change log by comparing with previous build
    await compareBuilds(projectId, previousBuild?.id || null, build.id, userId);
    return build;
}
async function getBuild(buildId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].build.findUnique({
        where: {
            id: buildId
        },
        include: {
            features: true,
            changeLogs: {
                orderBy: {
                    changedAt: 'desc'
                }
            },
            project: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
}
async function getBuildCreator(userId) {
    if (!userId) return null;
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            email: true,
            name: true
        }
    });
}
async function getBuildHistory(projectId, featureType) {
    const where = {
        projectId
    };
    if (featureType) {
        where.features = {
            some: {
                featureType
            }
        };
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].build.findMany({
        where,
        include: {
            features: true,
            _count: {
                select: {
                    changeLogs: true
                }
            }
        },
        orderBy: {
            version: 'desc'
        }
    });
}
async function getActiveBuild(projectId, mode) {
    const buildMode = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].buildMode.findUnique({
        where: {
            projectId
        },
        include: {
            previewBuild: mode === 'preview',
            productionBuild: mode === 'production'
        }
    });
    if (!buildMode) {
        return null;
    }
    const buildId = mode === 'preview' ? buildMode.previewBuildId : buildMode.productionBuildId;
    if (!buildId) {
        return null;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].build.findUnique({
        where: {
            id: buildId
        },
        include: {
            features: true
        }
    });
}
async function setBuildMode(projectId, buildId, mode) {
    // Verify build belongs to project
    const build = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].build.findUnique({
        where: {
            id: buildId
        },
        select: {
            projectId: true
        }
    });
    if (!build || build.projectId !== projectId) {
        throw new Error('Build not found or does not belong to project');
    }
    // Get or create BuildMode
    let buildMode = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].buildMode.findUnique({
        where: {
            projectId
        }
    });
    if (!buildMode) {
        buildMode = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].buildMode.create({
            data: {
                projectId
            }
        });
    }
    // Deactivate previous build in same mode
    const previousBuildId = mode === 'preview' ? buildMode.previewBuildId : buildMode.productionBuildId;
    if (previousBuildId) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].build.update({
            where: {
                id: previousBuildId
            },
            data: {
                isActive: false
            }
        });
    }
    // Activate new build
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].build.update({
        where: {
            id: buildId
        },
        data: {
            mode,
            isActive: true
        }
    });
    // Update BuildMode
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].buildMode.update({
        where: {
            projectId
        },
        data: {
            previewBuildId: mode === 'preview' ? buildId : buildMode.previewBuildId,
            productionBuildId: mode === 'production' ? buildId : buildMode.productionBuildId
        }
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].build.findUnique({
        where: {
            id: buildId
        }
    });
}
async function updateBuild(buildId, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].build.update({
        where: {
            id: buildId
        },
        data
    });
}
async function deleteBuild(buildId) {
    // Check if build is active
    const build = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].build.findUnique({
        where: {
            id: buildId
        },
        select: {
            isActive: true,
            projectId: true
        }
    });
    if (!build) {
        throw new Error('Build not found');
    }
    if (build.isActive) {
        throw new Error('Cannot delete active build. Deactivate it first.');
    }
    // Remove from BuildMode if referenced
    const buildMode = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].buildMode.findUnique({
        where: {
            projectId: build.projectId
        }
    });
    if (buildMode) {
        const updates = {};
        if (buildMode.previewBuildId === buildId) {
            updates.previewBuildId = null;
        }
        if (buildMode.productionBuildId === buildId) {
            updates.productionBuildId = null;
        }
        if (Object.keys(updates).length > 0) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].buildMode.update({
                where: {
                    projectId: build.projectId
                },
                data: updates
            });
        }
    }
    // Delete build (cascade will delete features and change logs)
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].build.delete({
        where: {
            id: buildId
        }
    });
}
async function getBuildDiff(buildId1, buildId2) {
    const [build1, build2] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].build.findUnique({
            where: {
                id: buildId1
            },
            include: {
                features: true
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].build.findUnique({
            where: {
                id: buildId2
            },
            include: {
                features: true
            }
        })
    ]);
    if (!build1 || !build2) {
        throw new Error('One or both builds not found');
    }
    // Use compare logic (similar to compareBuilds but return diff structure)
    const diff = {};
    for (const featureType of Object.keys(FEATURE_REGISTRY)){
        const feature1 = build1.features.find((f)=>f.featureType === featureType);
        const feature2 = build2.features.find((f)=>f.featureType === featureType);
        const data1 = feature1?.snapshotData;
        const data2 = feature2?.snapshotData;
        diff[featureType] = [];
        if (featureType === 'business_config') {
            const configs1 = data1?.configs;
            const configs2 = data2?.configs;
            // Find added and changed
            if (configs2) {
                for (const [key, newValue] of Object.entries(configs2)){
                    const oldValue = configs1?.[key];
                    if (oldValue === undefined) {
                        diff[featureType].push({
                            changeType: 'added',
                            itemKey: key,
                            itemLabel: key,
                            oldValue: null,
                            newValue
                        });
                    } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                        diff[featureType].push({
                            changeType: 'changed',
                            itemKey: key,
                            itemLabel: key,
                            oldValue,
                            newValue
                        });
                    }
                }
            }
            // Find deleted
            if (configs1) {
                for (const key of Object.keys(configs1)){
                    if (!configs2 || !(key in configs2)) {
                        diff[featureType].push({
                            changeType: 'deleted',
                            itemKey: key,
                            itemLabel: key,
                            oldValue: configs1[key],
                            newValue: null
                        });
                    }
                }
            }
        } else if (featureType === 'localization') {
            const translations1 = data1?.translations;
            const translations2 = data2?.translations;
            // Find added and changed
            if (translations2) {
                for (const [langCode, langTranslations] of Object.entries(translations2)){
                    for (const [key, newValue] of Object.entries(langTranslations)){
                        const itemKey = `${langCode}:${key}`;
                        const oldValue = translations1?.[langCode]?.[key];
                        if (oldValue === undefined) {
                            diff[featureType].push({
                                changeType: 'added',
                                itemKey,
                                itemLabel: itemKey,
                                oldValue: null,
                                newValue
                            });
                        } else if (oldValue !== newValue) {
                            diff[featureType].push({
                                changeType: 'changed',
                                itemKey,
                                itemLabel: itemKey,
                                oldValue,
                                newValue
                            });
                        }
                    }
                }
            }
            // Find deleted
            if (translations1) {
                for (const [langCode, langTranslations] of Object.entries(translations1)){
                    for (const key of Object.keys(langTranslations)){
                        const itemKey = `${langCode}:${key}`;
                        if (!translations2?.[langCode] || !(key in translations2[langCode])) {
                            diff[featureType].push({
                                changeType: 'deleted',
                                itemKey,
                                itemLabel: itemKey,
                                oldValue: langTranslations[key],
                                newValue: null
                            });
                        }
                    }
                }
            }
        }
        if (featureType === 'api_mocks') {
            const envs1 = data1?.environments;
            const envs2 = data2?.environments;
            // Find added and changed endpoints
            if (envs2) {
                for (const env2 of envs2){
                    const env1 = envs1?.find((e)=>e.id === env2.id);
                    for (const endpoint2 of env2.endpoints){
                        const endpoint1 = env1?.endpoints.find((e)=>e.id === endpoint2.id);
                        const itemKey = `${env2.id}:${endpoint2.id}`;
                        const itemLabel = `${env2.name} - ${endpoint2.method} ${endpoint2.path}`;
                        if (!endpoint1) {
                            diff[featureType].push({
                                changeType: 'added',
                                itemKey,
                                itemLabel,
                                oldValue: null,
                                newValue: endpoint2
                            });
                        } else if (JSON.stringify(endpoint1) !== JSON.stringify(endpoint2)) {
                            diff[featureType].push({
                                changeType: 'changed',
                                itemKey,
                                itemLabel,
                                oldValue: endpoint1,
                                newValue: endpoint2
                            });
                        }
                    }
                }
            }
            // Find deleted endpoints
            if (envs1) {
                for (const env1 of envs1){
                    const env2 = envs2?.find((e)=>e.id === env1.id);
                    for (const endpoint1 of env1.endpoints){
                        const exists = env2?.endpoints.some((e)=>e.id === endpoint1.id);
                        if (!exists) {
                            diff[featureType].push({
                                changeType: 'deleted',
                                itemKey: `${env1.id}:${endpoint1.id}`,
                                itemLabel: `${env1.name} - ${endpoint1.method} ${endpoint1.path}`,
                                oldValue: endpoint1,
                                newValue: null
                            });
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
            createdAt: build1.createdAt
        },
        build2: {
            id: build2.id,
            version: build2.version,
            name: build2.name,
            createdAt: build2.createdAt
        },
        diff
    };
}
}),
"[project]/src/app/api/builds/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.8_@babel+core@7.28.5_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$build$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/build.ts [app-route] (ecmascript)");
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
        const { projectId, featureType, name, description } = await request.json();
        if (!projectId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'projectId is required'
            }, {
                status: 400
            });
        }
        if (!featureType || ![
            'business_config',
            'localization',
            'api_mocks'
        ].includes(featureType)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'featureType is required and must be business_config, localization, or api_mocks'
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
        const build = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$build$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createBuild"])(projectId, user.id, featureType, name, description);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            build
        });
    } catch (error) {
        console.error('Create build error:', error);
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
        const featureType = searchParams.get('featureType');
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
        const builds = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$build$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBuildHistory"])(projectId, featureType || undefined);
        // Enrich builds with creator information
        const buildsWithCreators = await Promise.all(builds.map(async (build)=>{
            const creator = build.createdBy ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$build$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBuildCreator"])(build.createdBy) : null;
            return {
                ...build,
                creator: creator ? {
                    id: creator.id,
                    email: creator.email,
                    name: creator.name
                } : null
            };
        }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            builds: buildsWithCreators
        });
    } catch (error) {
        console.error('Get builds error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7332f36e._.js.map