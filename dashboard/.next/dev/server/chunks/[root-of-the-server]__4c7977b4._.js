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
"[project]/dashboard/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
/**
 * Primary Prisma Client (Read/Write)
 * 
 * Use this client for all write operations and when read replica is not needed.
 * This connects to the primary database.
 */ const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
    log: ("TURBOPACK compile-time truthy", 1) ? [
        'query',
        'error',
        'warn'
    ] : "TURBOPACK unreachable"
});
if ("TURBOPACK compile-time truthy", 1) {
    globalForPrisma.prisma = prisma;
    // In development, ensure Prisma client is properly initialized
    if (typeof prisma.user === 'undefined') {
        console.warn('⚠️  Prisma client models not available. Restart dev server after running: pnpm prisma generate');
    }
}
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
"[project]/dashboard/src/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/prisma.ts [app-route] (ecmascript)");
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
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
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
    const project = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
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
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
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
"[project]/dashboard/src/lib/plan.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getPlan",
    ()=>getPlan,
    "getPlanByName",
    ()=>getPlanByName,
    "getPlanLimits",
    ()=>getPlanLimits,
    "getPublicPlans",
    ()=>getPublicPlans
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/prisma.ts [app-route] (ecmascript)");
;
async function getPlan(planId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].plan.findUnique({
        where: {
            id: planId
        }
    });
}
async function getPlanByName(name) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].plan.findUnique({
        where: {
            name
        }
    });
}
async function getPublicPlans() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].plan.findMany({
        where: {
            isPublic: true
        },
        orderBy: {
            price: 'asc'
        }
    });
}
async function getPlanLimits(planId) {
    const plan = await getPlan(planId);
    if (!plan) return null;
    return {
        maxProjects: plan.maxProjects,
        maxDevices: plan.maxDevices,
        maxApiTraces: plan.maxApiTraces,
        maxLogs: plan.maxLogs,
        maxSessions: plan.maxSessions,
        maxCrashes: plan.maxCrashes,
        retentionDays: plan.retentionDays
    };
}
}),
"[project]/dashboard/src/lib/subscription.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createSubscription",
    ()=>createSubscription,
    "expireSubscription",
    ()=>expireSubscription,
    "getSubscription",
    ()=>getSubscription,
    "getUsageStats",
    ()=>getUsageStats,
    "isFeatureAllowed",
    ()=>isFeatureAllowed,
    "isTrialActive",
    ()=>isTrialActive
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$plan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/plan.ts [app-route] (ecmascript)");
;
;
async function createSubscription(userId, planName = 'free') {
    const plan = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].plan.findUnique({
        where: {
            name: planName
        }
    });
    if (!plan) {
        throw new Error(`Plan "${planName}" not found`);
    }
    const trialStartDate = new Date();
    // Use plan's retentionDays as trial period, or default to 30 days
    // For free plans, retentionDays typically represents the trial period
    const trialDays = plan.retentionDays || 30;
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);
    const currentPeriodEnd = new Date(trialEndDate);
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.create({
        data: {
            userId,
            planId: plan.id,
            status: 'active',
            trialStartDate,
            trialEndDate,
            currentPeriodStart: trialStartDate,
            currentPeriodEnd
        },
        include: {
            plan: true
        }
    });
}
async function getSubscription(userId) {
    const sub = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.findUnique({
        where: {
            userId
        },
        include: {
            plan: true
        }
    });
    // Type assertion to include admin fields
    return sub;
}
async function isTrialActive(subscription) {
    if (!subscription) return false;
    // Check if admin disabled the subscription
    if (subscription.enabled === false) return false;
    // Check if trial expired
    if (subscription.status === 'expired') return false;
    if (subscription.status !== 'active') return false;
    const now = new Date();
    return subscription.trialEndDate > now;
}
async function isFeatureAllowed(subscription, feature) {
    if (!subscription) return false;
    // If trial expired, no features allowed
    if (!await isTrialActive(subscription)) {
        return false;
    }
    const plan = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$plan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPlan"])(subscription.planId);
    if (!plan) return false;
    // Map feature names to plan flags
    const featureMap = {
        deviceTracking: 'allowScreenTracking',
        sessionTracking: 'allowScreenTracking',
        apiTracking: 'allowApiTracking',
        screenTracking: 'allowScreenTracking',
        crashReporting: 'allowCrashReporting',
        logging: 'allowLogging',
        businessConfig: 'allowBusinessConfig',
        localization: 'allowLocalization',
        customDomains: 'allowCustomDomains',
        webhooks: 'allowWebhooks',
        teamMembers: 'allowTeamMembers',
        prioritySupport: 'allowPrioritySupport'
    };
    const planFlag = featureMap[feature];
    if (!planFlag) return false;
    return plan[planFlag] === true;
}
async function getUsageStats(userId) {
    const subscription = await getSubscription(userId);
    if (!subscription) {
        return null;
    }
    const plan = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$plan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPlan"])(subscription.planId);
    if (!plan) {
        return null;
    }
    // Use quota overrides if set, otherwise use plan defaults
    const getLimit = (quotaOverride, planLimit)=>{
        return quotaOverride !== undefined && quotaOverride !== null ? quotaOverride : planLimit;
    };
    const maxProjects = getLimit(subscription.quotaMaxProjects, plan.maxProjects);
    const maxDevices = getLimit(subscription.quotaMaxDevices, plan.maxDevices);
    const maxMockEndpoints = getLimit(subscription.quotaMaxMockEndpoints, plan.maxMockEndpoints);
    const maxApiEndpoints = getLimit(subscription.quotaMaxApiEndpoints, plan.maxApiEndpoints);
    const maxApiRequests = getLimit(subscription.quotaMaxApiRequests, plan.maxApiRequests);
    const maxLogs = getLimit(subscription.quotaMaxLogs, plan.maxLogs);
    const maxSessions = getLimit(subscription.quotaMaxSessions, plan.maxSessions);
    const maxCrashes = getLimit(subscription.quotaMaxCrashes, plan.maxCrashes);
    const maxBusinessConfigKeys = getLimit(subscription.quotaMaxBusinessConfigKeys, plan.maxBusinessConfigKeys);
    const maxLocalizationLanguages = getLimit(subscription.quotaMaxLocalizationLanguages, plan.maxLocalizationLanguages);
    const maxLocalizationKeys = getLimit(subscription.quotaMaxLocalizationKeys, plan.maxLocalizationKeys);
    // FIXED: Use currentPeriodStart/currentPeriodEnd instead of trialStartDate/trialEndDate
    const periodStart = subscription.currentPeriodStart;
    const periodEnd = subscription.currentPeriodEnd;
    // Count usage for current billing period
    const [mockEndpoints, logs, sessions, crashes, devices, projects, apiEndpoints, apiRequests, businessConfigKeys, localizationLanguages, localizationKeys] = await Promise.all([
        // Mock Endpoints: Lifetime meter (never reset)
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockEndpoint.count({
            where: {
                environment: {
                    project: {
                        userId
                    }
                }
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].log.count({
            where: {
                project: {
                    userId
                },
                createdAt: {
                    gte: periodStart,
                    lt: periodEnd
                }
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.count({
            where: {
                project: {
                    userId
                },
                createdAt: {
                    gte: periodStart,
                    lt: periodEnd
                }
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].crash.count({
            where: {
                project: {
                    userId
                },
                createdAt: {
                    gte: periodStart,
                    lt: periodEnd
                }
            }
        }),
        // FIXED: Devices now period-based (resets monthly)
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].device.count({
            where: {
                project: {
                    userId
                },
                createdAt: {
                    gte: periodStart,
                    lt: periodEnd
                }
            }
        }),
        // Projects: Lifetime meter (never reset)
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.count({
            where: {
                userId
            }
        }),
        // API Endpoints: Unique endpoints in current period
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiTrace.groupBy({
            by: [
                'url'
            ],
            where: {
                project: {
                    userId
                },
                createdAt: {
                    gte: periodStart,
                    lt: periodEnd
                }
            }
        }).then((result)=>result.length),
        // API Requests: Total requests in current period
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiTrace.count({
            where: {
                project: {
                    userId
                },
                createdAt: {
                    gte: periodStart,
                    lt: periodEnd
                }
            }
        }),
        // Business Config Keys: Lifetime meter (never reset)
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].businessConfig.count({
            where: {
                project: {
                    userId
                }
            }
        }),
        // Localization Languages: Lifetime meter (never reset)
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].language.count({
            where: {
                project: {
                    userId
                }
            }
        }),
        // Localization Keys: Lifetime meter (never reset)
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].localizationKey.count({
            where: {
                project: {
                    userId
                }
            }
        })
    ]);
    return {
        mockEndpoints: {
            used: mockEndpoints,
            limit: maxMockEndpoints,
            percentage: maxMockEndpoints ? mockEndpoints / maxMockEndpoints * 100 : 0
        },
        apiEndpoints: {
            used: apiEndpoints,
            limit: maxApiEndpoints,
            percentage: maxApiEndpoints ? apiEndpoints / maxApiEndpoints * 100 : 0
        },
        apiRequests: {
            used: apiRequests,
            limit: maxApiRequests,
            percentage: maxApiRequests ? apiRequests / maxApiRequests * 100 : 0
        },
        logs: {
            used: logs,
            limit: maxLogs,
            percentage: maxLogs ? logs / maxLogs * 100 : 0
        },
        sessions: {
            used: sessions,
            limit: maxSessions,
            percentage: maxSessions ? sessions / maxSessions * 100 : 0
        },
        crashes: {
            used: crashes,
            limit: maxCrashes,
            percentage: maxCrashes ? crashes / maxCrashes * 100 : 0
        },
        devices: {
            used: devices,
            limit: maxDevices,
            percentage: maxDevices ? devices / maxDevices * 100 : 0
        },
        projects: {
            used: projects,
            limit: maxProjects,
            percentage: maxProjects ? projects / maxProjects * 100 : 0
        },
        businessConfigKeys: {
            used: businessConfigKeys,
            limit: maxBusinessConfigKeys,
            percentage: maxBusinessConfigKeys ? businessConfigKeys / maxBusinessConfigKeys * 100 : 0
        },
        localizationLanguages: {
            used: localizationLanguages,
            limit: maxLocalizationLanguages,
            percentage: maxLocalizationLanguages ? localizationLanguages / maxLocalizationLanguages * 100 : 0
        },
        localizationKeys: {
            used: localizationKeys,
            limit: maxLocalizationKeys,
            percentage: maxLocalizationKeys ? localizationKeys / maxLocalizationKeys * 100 : 0
        },
        trialActive: await isTrialActive(subscription),
        trialEndDate: subscription.trialEndDate,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        daysRemaining: Math.max(0, Math.ceil((subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    };
}
async function expireSubscription(subscriptionId) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.update({
        where: {
            id: subscriptionId
        },
        data: {
            status: 'expired'
        }
    });
}
}),
"[project]/dashboard/src/lib/subscription-validation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "validateFeature",
    ()=>validateFeature,
    "validateSubscription",
    ()=>validateSubscription
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/subscription.ts [app-route] (ecmascript)");
;
;
async function validateSubscription(userId) {
    const subscription = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSubscription"])(userId);
    // Check 1: Subscription exists
    if (!subscription) {
        return {
            valid: false,
            error: 'No subscription found'
        };
    }
    // Check 2: Subscription enabled (admin control)
    if (!subscription.enabled) {
        return {
            valid: false,
            error: 'Subscription disabled by admin',
            subscription
        };
    }
    // Check 3: Subscription status
    if (subscription.status !== 'active') {
        return {
            valid: false,
            error: `Subscription ${subscription.status}`,
            subscription
        };
    }
    // Check 4: Grace period expired (for paid plans)
    if (subscription.gracePeriodEnd && subscription.gracePeriodEnd <= new Date()) {
        return {
            valid: false,
            error: 'Subscription suspended due to payment failure',
            subscription
        };
    }
    // Check 5: Trial expiration (for free plans or trial periods)
    const trialActive = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTrialActive"])(subscription);
    if (!trialActive && subscription.status === 'active') {
        // For free plans, if trial expired, subscription should be expired
        // But check anyway for safety
        return {
            valid: false,
            error: 'Trial expired',
            subscription
        };
    }
    return {
        valid: true,
        subscription
    };
}
async function validateFeature(userId, feature) {
    const validation = await validateSubscription(userId);
    if (!validation.valid) {
        return validation;
    }
    // Import here to avoid circular dependency
    const { isFeatureAllowed } = await __turbopack_context__.A("[project]/dashboard/src/lib/subscription.ts [app-route] (ecmascript, async loader)");
    const featureAllowed = await isFeatureAllowed(validation.subscription, feature);
    if (!featureAllowed) {
        return {
            valid: false,
            error: `Feature ${feature} not available in your plan`,
            subscription: validation.subscription,
            featureAllowed: false
        };
    }
    return {
        ...validation,
        featureAllowed: true
    };
}
}),
"[project]/dashboard/src/lib/enforcement.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "evaluateEnforcementState",
    ()=>evaluateEnforcementState,
    "getDefaultEnforcementConfig",
    ()=>getDefaultEnforcementConfig,
    "getEnforcementConfig",
    ()=>getEnforcementConfig,
    "getEnforcementState",
    ()=>getEnforcementState,
    "updateEnforcementState",
    ()=>updateEnforcementState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/subscription.ts [app-route] (ecmascript)");
;
;
;
function getDefaultEnforcementConfig() {
    return {
        warnThreshold: 80,
        hardThreshold: 100,
        gracePeriodHours: 48,
        overageBufferPercent: 0,
        moduleRules: {
            apiTraces: {
                samplingRate: 10,
                dropResponseBodies: true
            },
            logs: {
                prioritizeCrashes: true,
                minRetentionDays: 7
            },
            sessions: {
                samplingRate: 10,
                capEventsPerSession: 100
            },
            businessConfig: {
                freezePublishing: true,
                serveLastPublished: true
            },
            localization: {
                freezePublishing: true,
                serveLastPublished: true
            }
        }
    };
}
function getEnforcementConfig(plan) {
    if (!plan?.enforcementConfig) {
        return getDefaultEnforcementConfig();
    }
    const config = plan.enforcementConfig;
    const defaults = getDefaultEnforcementConfig();
    return {
        warnThreshold: config.warnThreshold ?? defaults.warnThreshold,
        hardThreshold: config.hardThreshold ?? defaults.hardThreshold,
        gracePeriodHours: config.gracePeriodHours ?? defaults.gracePeriodHours,
        overageBufferPercent: config.overageBufferPercent ?? defaults.overageBufferPercent,
        moduleRules: {
            ...defaults.moduleRules,
            ...config.moduleRules
        }
    };
}
async function evaluateEnforcementState(userId) {
    const subscription = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSubscription"])(userId);
    if (!subscription) {
        throw new Error('Subscription not found');
    }
    // Get plan with enforcement config
    const plan = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].plan.findUnique({
        where: {
            id: subscription.planId
        }
    });
    if (!plan) {
        throw new Error('Plan not found');
    }
    const config = getEnforcementConfig(plan);
    const usage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUsageStats"])(userId);
    if (!usage) {
        // No usage data - default to ACTIVE
        return {
            state: 'ACTIVE',
            triggeredMetrics: [],
            effectivePolicy: getDefaultEffectivePolicy(),
            nextEvaluationAt: new Date(Date.now() + 15 * 60 * 1000)
        };
    }
    // Check all meters for threshold violations
    const triggeredMetrics = [];
    const meters = [
        'devices',
        'apiRequests',
        'logs',
        'sessions',
        'crashes',
        'projects'
    ];
    let maxPercentage = 0;
    let hasHardThreshold = false;
    for (const meterKey of meters){
        const meter = usage[meterKey];
        if (!meter || meter.limit === null) continue;
        const percentage = meter.percentage;
        if (percentage >= config.hardThreshold) {
            hasHardThreshold = true;
            triggeredMetrics.push({
                metric: meterKey,
                usage: meter.usage || meter.used || 0,
                limit: meter.limit,
                percentage
            });
        } else if (percentage >= config.warnThreshold) {
            triggeredMetrics.push({
                metric: meterKey,
                usage: meter.usage || meter.used || 0,
                limit: meter.limit,
                percentage
            });
        }
        if (percentage > maxPercentage) {
            maxPercentage = percentage;
        }
    }
    // Get current enforcement state from database
    const currentState = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].enforcementState.findUnique({
        where: {
            subscriptionId: subscription.id
        }
    });
    // Determine new state
    let newState = 'ACTIVE';
    let graceEndsAt;
    if (subscription.status !== 'active' || !subscription.enabled) {
        newState = 'SUSPENDED';
    } else if (hasHardThreshold) {
        // Check if we're in grace period
        if (currentState?.state === 'GRACE' && currentState.graceEndsAt) {
            if (new Date() < currentState.graceEndsAt) {
                // Still in grace period
                newState = 'GRACE';
                graceEndsAt = currentState.graceEndsAt;
            } else {
                // Grace period expired
                newState = 'DEGRADED';
            }
        } else {
            // Enter grace period
            newState = 'GRACE';
            const graceHours = config.gracePeriodHours || 48;
            graceEndsAt = new Date(Date.now() + graceHours * 60 * 60 * 1000);
        }
    } else if (maxPercentage >= config.warnThreshold) {
        newState = 'WARN';
    }
    // Generate effective policy based on state
    const effectivePolicy = generateEffectivePolicy(newState, config, plan);
    // Calculate next evaluation time (15 minutes for active/warn, 5 minutes for grace/degraded)
    const evaluationInterval = newState === 'ACTIVE' || newState === 'WARN' ? 15 : 5;
    const nextEvaluationAt = new Date(Date.now() + evaluationInterval * 60 * 1000);
    return {
        state: newState,
        triggeredMetrics,
        effectivePolicy,
        graceEndsAt,
        nextEvaluationAt
    };
}
/**
 * Generate effective policy based on enforcement state
 */ function generateEffectivePolicy(state, config, plan) {
    const defaultPolicy = getDefaultEffectivePolicy();
    if (state === 'ACTIVE' || state === 'WARN' || state === 'GRACE') {
        // No degradation - use plan defaults
        const retentionDays = plan.retentionDays || 30;
        return {
            sampling: {
                apiTraces: {
                    rate: 1,
                    enabled: false
                },
                sessions: {
                    rate: 1,
                    enabled: false
                },
                logs: {
                    prioritizeCrashes: false,
                    dropDebug: false
                }
            },
            retention: {
                apiTraces: retentionDays,
                logs: retentionDays,
                sessions: retentionDays
            },
            freezes: {
                businessConfig: false,
                localization: false
            }
        };
    }
    if (state === 'DEGRADED') {
        // Apply degradation rules
        const moduleRules = config.moduleRules || {};
        const retentionDays = plan.retentionDays || 30;
        const minRetention = moduleRules.logs?.minRetentionDays || 7;
        return {
            sampling: {
                apiTraces: {
                    rate: moduleRules.apiTraces?.samplingRate || 10,
                    enabled: true
                },
                sessions: {
                    rate: moduleRules.sessions?.samplingRate || 10,
                    enabled: true
                },
                logs: {
                    prioritizeCrashes: moduleRules.logs?.prioritizeCrashes ?? true,
                    dropDebug: true
                }
            },
            retention: {
                apiTraces: Math.max(retentionDays - 7, 7),
                logs: Math.max(minRetention, 7),
                sessions: Math.max(retentionDays - 7, 7)
            },
            freezes: {
                businessConfig: moduleRules.businessConfig?.freezePublishing ?? true,
                localization: moduleRules.localization?.freezePublishing ?? true
            }
        };
    }
    // SUSPENDED - minimal policy
    return {
        sampling: {
            apiTraces: {
                rate: 1,
                enabled: false
            },
            sessions: {
                rate: 1,
                enabled: false
            },
            logs: {
                prioritizeCrashes: false,
                dropDebug: false
            }
        },
        retention: {
            apiTraces: 0,
            logs: 0,
            sessions: 0
        },
        freezes: {
            businessConfig: true,
            localization: true
        }
    };
}
/**
 * Get default effective policy
 */ function getDefaultEffectivePolicy() {
    return {
        sampling: {
            apiTraces: {
                rate: 1,
                enabled: false
            },
            sessions: {
                rate: 1,
                enabled: false
            },
            logs: {
                prioritizeCrashes: false,
                dropDebug: false
            }
        },
        retention: {
            apiTraces: 30,
            logs: 30,
            sessions: 30
        },
        freezes: {
            businessConfig: false,
            localization: false
        }
    };
}
async function updateEnforcementState(subscriptionId, evaluation) {
    const now = new Date();
    const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].enforcementState.findUnique({
        where: {
            subscriptionId
        }
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].enforcementState.upsert({
        where: {
            subscriptionId
        },
        create: {
            subscriptionId,
            state: evaluation.state,
            warnEnteredAt: evaluation.state === 'WARN' ? now : null,
            graceEnteredAt: evaluation.state === 'GRACE' ? now : null,
            graceEndsAt: evaluation.graceEndsAt || null,
            degradedEnteredAt: evaluation.state === 'DEGRADED' ? now : null,
            effectivePolicy: evaluation.effectivePolicy,
            triggeredMetrics: evaluation.triggeredMetrics,
            lastEvaluatedAt: now,
            nextEvaluationAt: evaluation.nextEvaluationAt
        },
        update: {
            state: evaluation.state,
            warnEnteredAt: evaluation.state === 'WARN' && !existing?.warnEnteredAt ? now : existing?.warnEnteredAt,
            graceEnteredAt: evaluation.state === 'GRACE' && !existing?.graceEnteredAt ? now : existing?.graceEnteredAt,
            graceEndsAt: evaluation.graceEndsAt || existing?.graceEndsAt || null,
            degradedEnteredAt: evaluation.state === 'DEGRADED' && !existing?.degradedEnteredAt ? now : existing?.degradedEnteredAt,
            effectivePolicy: evaluation.effectivePolicy,
            triggeredMetrics: evaluation.triggeredMetrics,
            lastEvaluatedAt: now,
            nextEvaluationAt: evaluation.nextEvaluationAt
        }
    });
}
async function getEnforcementState(subscriptionId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].enforcementState.findUnique({
        where: {
            subscriptionId
        }
    });
}
}),
"[project]/dashboard/src/lib/throttling.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkMultipleMeters",
    ()=>checkMultipleMeters,
    "checkThrottling",
    ()=>checkThrottling
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/subscription.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$enforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/enforcement.ts [app-route] (ecmascript)");
;
;
;
async function checkThrottling(userId, meterKey) {
    const usage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUsageStats"])(userId);
    if (!usage) {
        return {
            throttled: false,
            error: 'Usage stats not available'
        };
    }
    const meter = usage[meterKey];
    if (!meter) {
        return {
            throttled: false,
            error: `Meter ${meterKey} not found`
        };
    }
    // If limit is null, it's unlimited - never throttle
    if (meter.limit === null) {
        return {
            throttled: false,
            usage: meter,
            enforcementState: 'ACTIVE'
        };
    }
    // Evaluate enforcement state (uses admin-configured thresholds)
    const subscription = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSubscription"])(userId);
    if (!subscription) {
        return {
            throttled: false,
            usage: meter,
            enforcementState: 'ACTIVE'
        };
    }
    // Get or evaluate enforcement state
    let enforcement = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$enforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnforcementState"])(subscription.id);
    // Re-evaluate if needed
    if (!enforcement || new Date() >= enforcement.nextEvaluationAt) {
        const evaluation = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$enforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evaluateEnforcementState"])(userId);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$enforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateEnforcementState"])(subscription.id, evaluation);
        enforcement = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$enforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnforcementState"])(subscription.id);
    }
    const state = enforcement?.state || 'ACTIVE';
    const effectivePolicy = enforcement?.effectivePolicy;
    // CRITICAL: Check if this specific meter has exceeded its limit
    // This should block regardless of enforcement state (except SUSPENDED which is handled below)
    if (meter.limit !== null && meter.used >= meter.limit) {
        // Quota exceeded - BLOCK immediately
        // Note: Grace period is for overall subscription health, not for individual meter limits
        return {
            throttled: true,
            error: `Quota exceeded: ${meter.used}/${meter.limit} ${meterKey}. Please upgrade your plan.`,
            retryAfter: 3600,
            usage: meter,
            enforcementState: state,
            effectivePolicy
        };
    }
    // SUSPENDED state - block all requests
    if (state === 'SUSPENDED') {
        return {
            throttled: true,
            error: 'Subscription suspended. Please contact support.',
            usage: meter,
            enforcementState: state,
            effectivePolicy
        };
    }
    // DEGRADED state - apply sampling/degradation but don't block
    if (state === 'DEGRADED') {
        // Don't throttle - apply degradation instead (handled by effective policy)
        return {
            throttled: false,
            usage: meter,
            enforcementState: state,
            effectivePolicy
        };
    }
    // GRACE state - allow full fidelity
    if (state === 'GRACE') {
        return {
            throttled: false,
            usage: meter,
            enforcementState: state,
            effectivePolicy
        };
    }
    // WARN or ACTIVE - normal operation
    return {
        throttled: false,
        usage: meter,
        enforcementState: state,
        effectivePolicy
    };
}
async function checkMultipleMeters(userId, meterKeys) {
    const results = {};
    const errors = [];
    for (const meterKey of meterKeys){
        const result = await checkThrottling(userId, meterKey);
        results[meterKey] = result;
        if (result.throttled) {
            errors.push(result.error || `Quota exceeded for ${meterKey}`);
        }
    }
    return {
        throttled: errors.length > 0,
        errors,
        results
    };
}
}),
"[project]/dashboard/src/lib/team-access.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Team Access Control Utilities
 * 
 * Helper functions for checking user roles and permissions in projects
 */ __turbopack_context__.s([
    "canPerformAction",
    ()=>canPerformAction,
    "checkSeatLimit",
    ()=>checkSeatLimit,
    "getInvitationExpiryDays",
    ()=>getInvitationExpiryDays,
    "getProjectMembers",
    ()=>getProjectMembers,
    "getUserProjectRole",
    ()=>getUserProjectRole,
    "hasProjectRole",
    ()=>hasProjectRole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/prisma.ts [app-route] (ecmascript)");
;
async function getUserProjectRole(userId, projectId) {
    const member = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId
            }
        },
        select: {
            role: true
        }
    });
    return member?.role;
}
async function hasProjectRole(userId, projectId, requiredRole) {
    const userRole = await getUserProjectRole(userId, projectId);
    if (!userRole) {
        // Check if user is the project owner (backward compatibility)
        const project = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
            where: {
                id: projectId
            },
            select: {
                userId: true
            }
        });
        if (project?.userId === userId) {
            // User is owner via legacy userId field
            return requiredRole === 'owner' || requiredRole === 'admin' || requiredRole === 'member' || requiredRole === 'viewer';
        }
        return false;
    }
    const roleHierarchy = {
        owner: 4,
        admin: 3,
        member: 2,
        viewer: 1
    };
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
async function canPerformAction(userId, projectId, action) {
    const role = await getUserProjectRole(userId, projectId);
    // If no role, check if user is project owner (backward compatibility)
    if (!role) {
        const project = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
            where: {
                id: projectId
            },
            select: {
                userId: true
            }
        });
        if (project?.userId === userId) {
            // Legacy owner - can do everything
            return true;
        }
        return false;
    }
    // Role-based permissions
    const permissions = {
        owner: [
            'invite',
            'remove_member',
            'change_role',
            'transfer_ownership',
            'delete_project',
            'manage_settings',
            'edit_config',
            'view'
        ],
        admin: [
            'invite',
            'remove_member',
            'change_role',
            'manage_settings',
            'edit_config',
            'view'
        ],
        member: [
            'edit_config',
            'view'
        ],
        viewer: [
            'view'
        ]
    };
    return permissions[role]?.includes(action) ?? false;
}
async function getProjectMembers(projectId) {
    const members = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectMember.findMany({
        where: {
            projectId
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true
                }
            }
        },
        orderBy: [
            {
                role: 'asc'
            },
            {
                joinedAt: 'asc'
            }
        ]
    });
    return members.map((m)=>({
            id: m.id,
            role: m.role,
            user: m.user,
            invitedBy: m.invitedBy,
            invitedAt: m.invitedAt,
            joinedAt: m.joinedAt
        }));
}
async function checkSeatLimit(projectId) {
    // Get project owner's subscription
    const project = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
        where: {
            id: projectId
        },
        include: {
            user: {
                include: {
                    subscription: {
                        include: {
                            plan: true
                        }
                    }
                }
            }
        }
    });
    if (!project) {
        return {
            allowed: false,
            current: 0,
            limit: null
        };
    }
    const plan = project.user.subscription?.plan;
    const maxSeats = plan?.maxTeamMembers ?? plan?.maxSeats ?? null;
    // Count current members
    const currentMembers = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectMember.count({
        where: {
            projectId
        }
    });
    // If no limit, allow unlimited
    if (maxSeats === null) {
        return {
            allowed: true,
            current: currentMembers,
            limit: null
        };
    }
    return {
        allowed: currentMembers < maxSeats,
        current: currentMembers,
        limit: maxSeats
    };
}
async function getInvitationExpiryDays() {
    const config = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].systemConfiguration.findUnique({
        where: {
            category_key: {
                category: 'notifications',
                key: 'invitation_expiry_days'
            }
        }
    });
    if (config?.value) {
        const days = parseInt(config.value, 10);
        if (!isNaN(days) && days > 0) {
            return days;
        }
    }
    return 7 // Default: 7 days
    ;
}
}),
"[project]/dashboard/src/app/api/traces/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.8_@babel+core@7.28.5_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$subscription$2d$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/subscription-validation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$throttling$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/throttling.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$team$2d$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/team-access.ts [app-route] (ecmascript)");
;
;
;
;
;
;
// Default values for settings
const DEFAULT_SDK_SETTINGS = {
    trackingMode: 'all'
};
const DEFAULT_FEATURE_FLAGS = {
    sdkEnabled: true,
    apiTracking: true
};
// Helper to check if tracking is enabled for a device
async function isTrackingEnabled(projectId, deviceId) {
    // Fetch feature flags and SDK settings
    const [featureFlags, sdkSettings, device] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].featureFlags.findUnique({
            where: {
                projectId
            },
            select: {
                sdkEnabled: true,
                apiTracking: true
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].sdkSettings.findUnique({
            where: {
                projectId
            },
            select: {
                trackingMode: true
            }
        }),
        deviceId ? __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].device.findFirst({
            where: {
                projectId,
                deviceId
            },
            select: {
                debugModeEnabled: true,
                debugModeExpiresAt: true
            }
        }) : null
    ]);
    const effectiveFlags = featureFlags || DEFAULT_FEATURE_FLAGS;
    const effectiveSettings = sdkSettings || DEFAULT_SDK_SETTINGS;
    // Check master kill switch
    if (!effectiveFlags.sdkEnabled) return false;
    // Check API tracking feature flag
    if (!effectiveFlags.apiTracking) return false;
    // Check tracking mode
    const trackingMode = effectiveSettings.trackingMode || 'all';
    if (trackingMode === 'none') return false;
    if (trackingMode === 'debug_only') {
        // Only allow if device exists and has active debug mode
        if (!device) return false;
        if (!device.debugModeEnabled) return false;
        // Check if debug mode is expired
        if (device.debugModeExpiresAt && device.debugModeExpiresAt < new Date()) {
            return false;
        }
        return true;
    }
    // trackingMode === 'all'
    return true;
}
// Helper function to check alerts and create monitored errors
async function checkAlertsForTrace(projectId, trace) {
    try {
        // Extract endpoint path from URL
        let endpointPath;
        try {
            const urlObj = new URL(trace.url);
            endpointPath = urlObj.pathname;
        } catch  {
            endpointPath = trace.url;
        }
        // Find matching alerts for this project
        const alerts = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiAlert.findMany({
            where: {
                projectId,
                isEnabled: true
            }
        });
        for (const alert of alerts){
            // Check if endpoint matches
            let endpointMatches = false;
            if (!alert.endpoint) {
                // No endpoint filter = matches all
                endpointMatches = true;
            } else if (alert.endpoint === endpointPath) {
                endpointMatches = true;
            } else if (alert.endpoint.endsWith('/*')) {
                const pattern = alert.endpoint.slice(0, -2);
                endpointMatches = endpointPath.startsWith(pattern);
            }
            if (!endpointMatches) continue;
            // Check if method matches
            if (alert.method && alert.method !== trace.method) continue;
            // Check error conditions
            let isError = false;
            let errorType = '';
            let errorCode = '';
            // Check status codes
            if (trace.statusCode) {
                // Check standard error codes
                if (alert.monitorStandardErrors && alert.standardErrorCodes.length > 0) {
                    if (alert.standardErrorCodes.includes(trace.statusCode)) {
                        isError = true;
                        errorType = 'status_code';
                        errorCode = trace.statusCode.toString();
                    }
                }
                // Check custom status codes
                if (!isError && alert.customStatusCodes.length > 0) {
                    if (alert.customStatusCodes.includes(trace.statusCode)) {
                        isError = true;
                        errorType = 'custom_status_code';
                        errorCode = trace.statusCode.toString();
                    }
                }
            }
            // Check body error field
            if (!isError && alert.bodyErrorField && alert.bodyErrorValues.length > 0 && trace.responseBody) {
                try {
                    const body = JSON.parse(trace.responseBody);
                    const fieldValue = alert.bodyErrorField.split('.').reduce((obj, key)=>obj?.[key], body);
                    if (fieldValue && alert.bodyErrorValues.includes(String(fieldValue))) {
                        isError = true;
                        errorType = 'body_error';
                        errorCode = String(fieldValue);
                    }
                } catch  {
                // Not JSON or field not found
                }
            }
            // Check header error field (would need responseHeaders in trace)
            // Skipping for now as headers aren't always available
            if (isError) {
                // Check if we already have this error tracked
                const existingError = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].monitoredError.findFirst({
                    where: {
                        alertId: alert.id,
                        projectId,
                        endpoint: endpointPath,
                        method: trace.method,
                        errorCode,
                        isResolved: false
                    }
                });
                if (existingError) {
                    // Update existing error
                    const affectedDevices = existingError.affectedDevices;
                    const affectedSessions = existingError.affectedSessions;
                    if (trace.deviceId && !affectedDevices.includes(trace.deviceId)) {
                        affectedDevices.push(trace.deviceId);
                    }
                    if (trace.sessionId && !affectedSessions.includes(trace.sessionId)) {
                        affectedSessions.push(trace.sessionId);
                    }
                    await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].monitoredError.update({
                        where: {
                            id: existingError.id
                        },
                        data: {
                            lastOccurrence: new Date(),
                            occurrenceCount: {
                                increment: 1
                            },
                            affectedDevices,
                            affectedSessions,
                            lastTraceId: trace.id,
                            requestBody: trace.requestBody,
                            responseBody: trace.responseBody,
                            statusCode: trace.statusCode
                        }
                    });
                } else {
                    // Create new monitored error
                    await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].monitoredError.create({
                        data: {
                            alertId: alert.id,
                            projectId,
                            errorType,
                            errorCode,
                            endpoint: endpointPath,
                            method: trace.method,
                            statusCode: trace.statusCode,
                            requestBody: trace.requestBody,
                            responseBody: trace.responseBody,
                            affectedDevices: trace.deviceId ? [
                                trace.deviceId
                            ] : [],
                            affectedSessions: trace.sessionId ? [
                                trace.sessionId
                            ] : [],
                            lastTraceId: trace.id
                        }
                    });
                }
                break; // Only create one error per trace
            }
        }
    } catch (error) {
        console.error('Error checking alerts for trace:', error);
    }
}
// Helper function to calculate cost for a trace
async function calculateTraceCost(projectId, url, method) {
    try {
        // Extract endpoint path from URL
        let endpointPath;
        try {
            const urlObj = new URL(url);
            endpointPath = urlObj.pathname;
        } catch  {
            endpointPath = url;
        }
        console.log(`Trace cost calc: projectId=${projectId}, path=${endpointPath}, method=${method}`);
        // Find matching API config
        // First try exact match with method
        let config = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiConfig.findFirst({
            where: {
                projectId,
                endpoint: endpointPath,
                method: method,
                isEnabled: true
            }
        });
        // If not found, try exact match without method (null method = all methods)
        if (!config) {
            config = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiConfig.findFirst({
                where: {
                    projectId,
                    endpoint: endpointPath,
                    method: null,
                    isEnabled: true
                }
            });
        }
        // If still not found, try pattern matching (endpoints ending with /*)
        if (!config) {
            const configs = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiConfig.findMany({
                where: {
                    projectId,
                    endpoint: {
                        endsWith: '/*'
                    },
                    isEnabled: true
                }
            });
            for (const c of configs){
                const pattern = c.endpoint.slice(0, -2) // Remove /*
                ;
                if (endpointPath.startsWith(pattern)) {
                    if (!c.method || c.method === method) {
                        config = c;
                        break;
                    }
                }
            }
        }
        const cost = config?.costPerRequest || 0;
        console.log(`Trace cost calc result: config=${config?.id || 'none'}, cost=${cost}`);
        return cost;
    } catch (error) {
        console.error('Error calculating trace cost:', error);
        return 0;
    }
}
async function POST(request) {
    try {
        const project = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateApiKey"])(request);
        if (!project) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid API key'
            }, {
                status: 401
            });
        }
        // Validate subscription and feature access
        const validation = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$subscription$2d$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateFeature"])(project.userId, 'apiTracking');
        if (!validation.valid) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: validation.error || 'Subscription invalid'
            }, {
                status: 403
            });
        }
        const { deviceId, sessionToken, url, method, statusCode, requestHeaders, requestBody, responseHeaders, responseBody, duration, error, timestamp, // New metadata fields
        screenName, networkType, country, carrier, ipAddress, userAgent } = await request.json();
        if (!url || !method) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'url and method are required'
            }, {
                status: 400
            });
        }
        // Check throttling for API requests (each trace is a request)
        const requestsThrottling = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$throttling$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkThrottling"])(project.userId, 'apiRequests');
        if (requestsThrottling.throttled || requestsThrottling.usage && requestsThrottling.usage.limit !== null && requestsThrottling.usage.used >= requestsThrottling.usage.limit) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: requestsThrottling.error || `API requests limit reached. You have used ${requestsThrottling.usage?.used || 0} of ${requestsThrottling.usage?.limit || 0} requests. Please upgrade your plan.`,
                usage: requestsThrottling.usage,
                retryAfter: requestsThrottling.retryAfter
            }, {
                status: requestsThrottling.throttled ? 429 : 403,
                headers: {
                    'Retry-After': requestsThrottling.retryAfter?.toString() || '3600'
                }
            });
        }
        // Check API endpoints quota (unique endpoints)
        // Note: We check this before creating, but the actual count happens after creation
        // This is a best-effort check - the final count happens in getUsageStats
        const endpointsThrottling = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$throttling$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkThrottling"])(project.userId, 'apiEndpoints');
        if (endpointsThrottling.throttled || endpointsThrottling.usage && endpointsThrottling.usage.limit !== null && endpointsThrottling.usage.used >= endpointsThrottling.usage.limit) {
            // Check if this is a new unique endpoint
            const existingTrace = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiTrace.findFirst({
                where: {
                    projectId: project.id,
                    url,
                    method,
                    createdAt: {
                        gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Check within current period
                    }
                }
            });
            // Block if limit is reached AND this is a new unique endpoint
            // If endpoint already exists, allow it (reusing existing endpoint doesn't count against limit)
            if (!existingTrace) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: endpointsThrottling.error || `API endpoints limit reached. You have used ${endpointsThrottling.usage?.used || 0} of ${endpointsThrottling.usage?.limit || 0} unique endpoints. Please upgrade your plan.`,
                    usage: endpointsThrottling.usage,
                    retryAfter: endpointsThrottling.retryAfter
                }, {
                    status: endpointsThrottling.throttled ? 429 : 403,
                    headers: {
                        'Retry-After': endpointsThrottling.retryAfter?.toString() || '3600'
                    }
                });
            }
        }
        // Check if tracking is enabled before processing trace
        const trackingAllowed = await isTrackingEnabled(project.id, deviceId);
        if (!trackingAllowed) {
            // Silently reject - SDK should handle this, but server validates too
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                trace: null,
                message: 'Tracking disabled'
            }, {
                status: 200
            });
        }
        // Find device if deviceId provided
        let device = null;
        if (deviceId) {
            device = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].device.findFirst({
                where: {
                    projectId: project.id,
                    deviceId,
                    status: 'active'
                }
            });
        }
        // Find session if sessionToken provided
        let session = null;
        if (sessionToken) {
            session = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.findUnique({
                where: {
                    sessionToken
                }
            });
        }
        // Get IP from request headers if not provided
        const clientIp = ipAddress || request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';
        // Calculate cost for this request
        const cost = await calculateTraceCost(project.id, url, method);
        const processedRequestBody = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
        const processedResponseBody = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody);
        const trace = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiTrace.create({
            data: {
                projectId: project.id,
                deviceId: device?.id,
                sessionId: session?.id,
                url,
                method,
                statusCode,
                requestHeaders,
                requestBody: processedRequestBody,
                responseHeaders,
                responseBody: processedResponseBody,
                duration,
                error,
                screenName,
                networkType,
                country,
                carrier,
                ipAddress: clientIp,
                userAgent,
                cost,
                timestamp: timestamp ? new Date(timestamp) : new Date()
            }
        });
        // Check alerts and create monitored errors if needed (async, don't block response)
        checkAlertsForTrace(project.id, {
            id: trace.id,
            url,
            method,
            statusCode,
            requestBody: processedRequestBody,
            responseBody: processedResponseBody,
            deviceId: device?.id,
            sessionId: session?.id
        }).catch((err)=>console.error('Alert check error:', err));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            trace: {
                id: trace.id,
                cost
            }
        });
    } catch (error) {
        console.error('Create trace error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('Error details:', {
            errorMessage,
            errorStack
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error',
            details: ("TURBOPACK compile-time truthy", 1) ? errorMessage : "TURBOPACK unreachable"
        }, {
            status: 500
        });
    }
}
async function GET(request) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthUser"])(request);
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');
        const deviceId = searchParams.get('deviceId');
        const method = searchParams.get('method');
        const statusCode = searchParams.get('statusCode');
        const screenName = searchParams.get('screenName');
        const groupByDevice = searchParams.get('groupByDevice') === 'true';
        // Pagination parameters (support both page/limit and offset/limit for backwards compatibility)
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')) : (page - 1) * limit;
        if (!projectId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'projectId is required'
            }, {
                status: 400
            });
        }
        // Check if user has access to project (owner or member)
        const hasAccess = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$team$2d$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canPerformAction"])(user.id, projectId, 'view');
        if (!hasAccess) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Project not found or access denied'
            }, {
                status: 404
            });
        }
        // Verify project exists
        const project = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
            where: {
                id: projectId
            }
        });
        if (!project) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Project not found'
            }, {
                status: 404
            });
        }
        const where = {
            projectId
        };
        if (deviceId) where.deviceId = deviceId;
        if (method) where.method = method;
        if (statusCode) where.statusCode = parseInt(statusCode);
        if (screenName) where.screenName = screenName;
        // Get unique screen names for filter dropdown
        const screenNames = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiTrace.findMany({
            where: {
                projectId
            },
            select: {
                screenName: true
            },
            distinct: [
                'screenName'
            ]
        });
        // Get unique devices for grouping
        const devices = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].device.findMany({
            where: {
                projectId
            },
            select: {
                id: true,
                deviceId: true,
                platform: true,
                model: true
            }
        });
        const [traces, total] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiTrace.findMany({
                where,
                include: {
                    device: {
                        select: {
                            deviceId: true,
                            platform: true,
                            model: true
                        }
                    }
                },
                orderBy: {
                    timestamp: 'desc'
                },
                take: limit,
                skip: offset
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiTrace.count({
                where
            })
        ]);
        // Group traces by device if requested
        let groupedTraces = null;
        if (groupByDevice) {
            groupedTraces = devices.map((device)=>({
                    device,
                    traces: traces.filter((t)=>t.device?.deviceId === device.deviceId),
                    count: traces.filter((t)=>t.device?.deviceId === device.deviceId).length
                }));
        }
        const totalPages = Math.ceil(total / limit);
        const pagination = {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            traces,
            total,
            limit,
            offset,
            pagination,
            screenNames: screenNames.map((s)=>s.screenName).filter(Boolean),
            devices,
            groupedTraces
        });
    } catch (error) {
        console.error('Get traces error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
async function DELETE(request) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthUser"])(request);
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');
        const deviceId = searchParams.get('deviceId');
        const traceId = searchParams.get('traceId');
        if (!projectId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'projectId is required'
            }, {
                status: 400
            });
        }
        // Verify user owns the project
        const project = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findFirst({
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
        // Delete specific trace or all traces for project/device
        if (traceId) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiTrace.delete({
                where: {
                    id: traceId,
                    projectId
                }
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'Trace deleted',
                count: 1
            });
        }
        const where = {
            projectId
        };
        if (deviceId) where.deviceId = deviceId;
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiTrace.deleteMany({
            where
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: deviceId ? 'Device traces cleared' : 'All traces cleared',
            count: result.count
        });
    } catch (error) {
        console.error('Delete traces error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4c7977b4._.js.map