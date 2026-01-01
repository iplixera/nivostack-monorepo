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
    const maxTeamMembers = getLimit(subscription.quotaMaxTeamMembers, plan.maxTeamMembers ?? plan.maxSeats);
    // FIXED: Use currentPeriodStart/currentPeriodEnd instead of trialStartDate/trialEndDate
    const periodStart = subscription.currentPeriodStart;
    const periodEnd = subscription.currentPeriodEnd;
    // Count usage for current billing period
    const [mockEndpoints, logs, sessions, crashes, devices, projects, apiEndpoints, apiRequests, businessConfigKeys, localizationLanguages, localizationKeys, teamMembers] = await Promise.all([
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
        }),
        // Team Members: Count all unique team members across all projects owned by user
        // This counts all ProjectMember entries for projects owned by the user
        // Note: The owner themselves are counted if they have ProjectMember entries
        (async ()=>{
            const ownedProjects = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findMany({
                where: {
                    userId
                },
                select: {
                    id: true
                }
            });
            const projectIds = ownedProjects.map((p)=>p.id);
            if (projectIds.length === 0) return 0;
            // Count unique users who are members of any owned project
            // This includes all invited members (admin, member, viewer roles)
            const uniqueMembers = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectMember.findMany({
                where: {
                    projectId: {
                        in: projectIds
                    }
                },
                select: {
                    userId: true
                }
            });
            // Get unique user IDs (using Set to deduplicate)
            const uniqueUserIds = new Set(uniqueMembers.map((m)=>m.userId));
            // Return count of unique team members
            // Note: This counts all members, not including the owner unless they have a ProjectMember entry
            return uniqueUserIds.size;
        })()
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
        teamMembers: {
            used: teamMembers,
            limit: maxTeamMembers,
            percentage: maxTeamMembers ? teamMembers / maxTeamMembers * 100 : 0
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
"[project]/dashboard/src/lib/subscription-analytics.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSubscriptionAnalytics",
    ()=>getSubscriptionAnalytics
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/subscription.ts [app-route] (ecmascript)");
;
;
async function getSubscriptionAnalytics() {
    // Get all active subscriptions with users and plans
    const subscriptions = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.findMany({
        where: {
            status: 'active',
            enabled: true
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true
                }
            },
            plan: {
                select: {
                    id: true,
                    name: true,
                    displayName: true,
                    price: true
                }
            }
        }
    });
    // Plan distribution
    const planCounts = {};
    subscriptions.forEach((sub)=>{
        const planName = sub.plan.name;
        if (!planCounts[planName]) {
            planCounts[planName] = {
                count: 0,
                revenue: 0
            };
        }
        planCounts[planName].count++;
        planCounts[planName].revenue += sub.plan.price;
    });
    const totalSubscriptions = subscriptions.length;
    const planDistribution = Object.entries(planCounts).map(([planName, data])=>{
        const plan = subscriptions.find((s)=>s.plan.name === planName)?.plan;
        return {
            planName,
            planDisplayName: plan?.displayName || planName,
            count: data.count,
            percentage: totalSubscriptions > 0 ? data.count / totalSubscriptions * 100 : 0,
            totalRevenue: data.revenue
        };
    });
    // Usage segmentation
    const usageData = [];
    for (const sub of subscriptions){
        try {
            const usage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUsageStats"])(sub.userId);
            if (usage) {
                usageData.push({
                    userId: sub.userId,
                    email: sub.user.email,
                    planName: sub.plan.name,
                    usage
                });
            }
        } catch (error) {
            console.error(`Error getting usage for user ${sub.userId}:`, error);
        }
    }
    // Segment users by usage percentage
    function segmentByUsage(meterKey) {
        const segments = {
            low: [],
            medium: [],
            high: [],
            exceeded: []
        };
        usageData.forEach((data)=>{
            if (!data.usage) return;
            const meter = data.usage[meterKey];
            if (!meter) return;
            const percentage = meter.percentage;
            let segment;
            if (meter.limit === null) {
                // Unlimited - consider as low usage
                segment = 'low';
            } else if (percentage >= 100) {
                segment = 'exceeded';
            } else if (percentage >= 80) {
                segment = 'high';
            } else if (percentage >= 50) {
                segment = 'medium';
            } else {
                segment = 'low';
            }
            segments[segment].push(data);
        });
        return [
            {
                segment: 'low',
                label: 'Low Usage (0-50%)',
                count: segments.low.length,
                percentage: usageData.length > 0 ? segments.low.length / usageData.length * 100 : 0,
                users: segments.low.filter((d)=>d.usage).map((d)=>({
                        userId: d.userId,
                        email: d.email,
                        planName: d.planName,
                        usagePercentage: d.usage[meterKey]?.percentage || 0,
                        meters: {
                            devices: d.usage.devices,
                            apiRequests: d.usage.apiRequests,
                            logs: d.usage.logs,
                            sessions: d.usage.sessions
                        }
                    }))
            },
            {
                segment: 'medium',
                label: 'Medium Usage (50-80%)',
                count: segments.medium.length,
                percentage: usageData.length > 0 ? segments.medium.length / usageData.length * 100 : 0,
                users: segments.medium.filter((d)=>d.usage).map((d)=>({
                        userId: d.userId,
                        email: d.email,
                        planName: d.planName,
                        usagePercentage: d.usage[meterKey]?.percentage || 0,
                        meters: {
                            devices: d.usage.devices,
                            apiRequests: d.usage.apiRequests,
                            logs: d.usage.logs,
                            sessions: d.usage.sessions
                        }
                    }))
            },
            {
                segment: 'high',
                label: 'High Usage (80-100%)',
                count: segments.high.length,
                percentage: usageData.length > 0 ? segments.high.length / usageData.length * 100 : 0,
                users: segments.high.filter((d)=>d.usage).map((d)=>({
                        userId: d.userId,
                        email: d.email,
                        planName: d.planName,
                        usagePercentage: d.usage[meterKey]?.percentage || 0,
                        meters: {
                            devices: d.usage.devices,
                            apiRequests: d.usage.apiRequests,
                            logs: d.usage.logs,
                            sessions: d.usage.sessions
                        }
                    }))
            },
            {
                segment: 'exceeded',
                label: 'Exceeded Limit (100%+)',
                count: segments.exceeded.length,
                percentage: usageData.length > 0 ? segments.exceeded.length / usageData.length * 100 : 0,
                users: segments.exceeded.filter((d)=>d.usage).map((d)=>({
                        userId: d.userId,
                        email: d.email,
                        planName: d.planName,
                        usagePercentage: d.usage[meterKey]?.percentage || 0,
                        meters: {
                            devices: d.usage.devices,
                            apiRequests: d.usage.apiRequests,
                            logs: d.usage.logs,
                            sessions: d.usage.sessions
                        }
                    }))
            }
        ];
    }
    // At-risk users (80%+ usage on any meter)
    const atRiskUsers = usageData.filter((d)=>{
        const meters = d.usage ? [
            d.usage.devices,
            d.usage.apiRequests,
            d.usage.logs,
            d.usage.sessions
        ] : [];
        return meters.some((m)=>m && m.limit !== null && m.percentage >= 80 && m.percentage < 100);
    }).filter((d)=>d.usage).map((d)=>{
        const meters = {
            devices: d.usage.devices,
            apiRequests: d.usage.apiRequests,
            logs: d.usage.logs,
            sessions: d.usage.sessions
        };
        const highestUsage = Object.entries(meters).map(([key, meter])=>({
                meter: key,
                percentage: meter.percentage
            })).sort((a, b)=>b.percentage - a.percentage)[0];
        return {
            userId: d.userId,
            email: d.email,
            planName: d.planName,
            highestUsage,
            allMeters: meters
        };
    }).sort((a, b)=>b.highestUsage.percentage - a.highestUsage.percentage);
    // At-limit users (100%+ usage on any meter)
    const atLimitUsers = usageData.filter((d)=>{
        const meters = d.usage ? [
            d.usage.devices,
            d.usage.apiRequests,
            d.usage.logs,
            d.usage.sessions
        ] : [];
        return meters.some((m)=>m && m.limit !== null && m.percentage >= 100);
    }).filter((d)=>d.usage).map((d)=>{
        const meters = {
            devices: d.usage.devices,
            apiRequests: d.usage.apiRequests,
            logs: d.usage.logs,
            sessions: d.usage.sessions
        };
        const exceededMeters = Object.entries(meters).filter(([_, meter])=>meter.limit !== null && meter.percentage >= 100).map(([key])=>key);
        return {
            userId: d.userId,
            email: d.email,
            planName: d.planName,
            exceededMeters,
            allMeters: meters
        };
    });
    // Conversion opportunities (users on lower plans with high usage)
    const conversionOpportunities = [];
    const planHierarchy = [
        'free',
        'pro',
        'team',
        'enterprise'
    ];
    usageData.forEach((d)=>{
        const currentPlanIndex = planHierarchy.indexOf(d.planName);
        if (currentPlanIndex === -1 || currentPlanIndex === planHierarchy.length - 1 || !d.usage) return;
        const meters = [
            d.usage.devices,
            d.usage.apiRequests,
            d.usage.logs,
            d.usage.sessions
        ];
        const maxUsage = Math.max(...meters.map((m)=>m?.percentage || 0));
        if (maxUsage >= 80) {
            const recommendedPlan = planHierarchy[currentPlanIndex + 1];
            conversionOpportunities.push({
                userId: d.userId,
                email: d.email,
                currentPlan: d.planName,
                recommendedPlan,
                reason: `Usage at ${maxUsage.toFixed(1)}% - Consider upgrading to ${recommendedPlan}`,
                usagePercentage: maxUsage
            });
        }
    });
    // Calculate summary
    const totalUsagePercentages = usageData.filter((d)=>d.usage).map((d)=>{
        const meters = [
            d.usage.devices,
            d.usage.apiRequests,
            d.usage.logs,
            d.usage.sessions
        ];
        return Math.max(...meters.map((m)=>m?.percentage || 0));
    });
    const averageUsagePercentage = totalUsagePercentages.length > 0 ? totalUsagePercentages.reduce((a, b)=>a + b, 0) / totalUsagePercentages.length : 0;
    return {
        planDistribution,
        usageSegmentation: {
            devices: segmentByUsage('devices'),
            apiRequests: segmentByUsage('apiRequests'),
            logs: segmentByUsage('logs'),
            sessions: segmentByUsage('sessions')
        },
        atRiskUsers,
        atLimitUsers,
        conversionOpportunities: conversionOpportunities.sort((a, b)=>b.usagePercentage - a.usagePercentage),
        summary: {
            totalUsers: subscriptions.length,
            totalActiveSubscriptions: subscriptions.length,
            averageUsagePercentage,
            usersAtRisk: atRiskUsers.length,
            usersAtLimit: atLimitUsers.length,
            conversionOpportunities: conversionOpportunities.length
        }
    };
}
}),
"[project]/dashboard/src/app/api/admin/analytics/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.8_@babel+core@7.28.5_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$subscription$2d$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/subscription-analytics.ts [app-route] (ecmascript)");
;
;
;
async function GET(request) {
    try {
        const admin = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateAdmin"])(request);
        if (!admin) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized - Admin access required'
            }, {
                status: 403
            });
        }
        const analytics = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$subscription$2d$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSubscriptionAnalytics"])();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            analytics
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__389dadaa._.js.map