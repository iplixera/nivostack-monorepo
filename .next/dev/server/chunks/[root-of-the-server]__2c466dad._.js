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
"[project]/src/lib/plan.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
async function getPlan(planId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].plan.findUnique({
        where: {
            id: planId
        }
    });
}
async function getPlanByName(name) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].plan.findUnique({
        where: {
            name
        }
    });
}
async function getPublicPlans() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].plan.findMany({
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
"[project]/src/lib/subscription.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/plan.ts [app-route] (ecmascript)");
;
;
async function createSubscription(userId, planName = 'free') {
    const plan = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].plan.findUnique({
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
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.create({
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
    const sub = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.findUnique({
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
    const plan = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPlan"])(subscription.planId);
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
    const plan = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPlan"])(subscription.planId);
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
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mockEndpoint.count({
            where: {
                environment: {
                    project: {
                        userId
                    }
                }
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].log.count({
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
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.count({
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
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].crash.count({
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
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].device.count({
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
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.count({
            where: {
                userId
            }
        }),
        // API Endpoints: Unique endpoints in current period
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiTrace.groupBy({
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
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiTrace.count({
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
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].businessConfig.count({
            where: {
                project: {
                    userId
                }
            }
        }),
        // Localization Languages: Lifetime meter (never reset)
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].language.count({
            where: {
                project: {
                    userId
                }
            }
        }),
        // Localization Keys: Lifetime meter (never reset)
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].localizationKey.count({
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
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.update({
        where: {
            id: subscriptionId
        },
        data: {
            status: 'expired'
        }
    });
}
}),
"[project]/src/lib/subscription-validation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "validateFeature",
    ()=>validateFeature,
    "validateSubscription",
    ()=>validateSubscription
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/subscription.ts [app-route] (ecmascript)");
;
;
async function validateSubscription(userId) {
    const subscription = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSubscription"])(userId);
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
    const trialActive = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTrialActive"])(subscription);
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
    const { isFeatureAllowed } = await __turbopack_context__.A("[project]/src/lib/subscription.ts [app-route] (ecmascript, async loader)");
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
"[project]/src/lib/enforcement.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/subscription.ts [app-route] (ecmascript)");
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
    const subscription = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSubscription"])(userId);
    if (!subscription) {
        throw new Error('Subscription not found');
    }
    // Get plan with enforcement config
    const plan = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].plan.findUnique({
        where: {
            id: subscription.planId
        }
    });
    if (!plan) {
        throw new Error('Plan not found');
    }
    const config = getEnforcementConfig(plan);
    const usage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUsageStats"])(userId);
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
        'apiTraces',
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
                usage: meter.used,
                limit: meter.limit,
                percentage
            });
        } else if (percentage >= config.warnThreshold) {
            triggeredMetrics.push({
                metric: meterKey,
                usage: meter.used,
                limit: meter.limit,
                percentage
            });
        }
        if (percentage > maxPercentage) {
            maxPercentage = percentage;
        }
    }
    // Get current enforcement state from database
    const currentState = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].enforcementState.findUnique({
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
    const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].enforcementState.findUnique({
        where: {
            subscriptionId
        }
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].enforcementState.upsert({
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
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].enforcementState.findUnique({
        where: {
            subscriptionId
        }
    });
}
}),
"[project]/src/lib/throttling.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkMultipleMeters",
    ()=>checkMultipleMeters,
    "checkThrottling",
    ()=>checkThrottling
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/subscription.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$enforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/enforcement.ts [app-route] (ecmascript)");
;
;
;
async function checkThrottling(userId, meterKey) {
    const usage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUsageStats"])(userId);
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
    const subscription = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSubscription"])(userId);
    if (!subscription) {
        return {
            throttled: false,
            usage: meter,
            enforcementState: 'ACTIVE'
        };
    }
    // Get or evaluate enforcement state
    let enforcement = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$enforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnforcementState"])(subscription.id);
    // Re-evaluate if needed
    if (!enforcement || new Date() >= enforcement.nextEvaluationAt) {
        const evaluation = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$enforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evaluateEnforcementState"])(userId);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$enforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateEnforcementState"])(subscription.id, evaluation);
        enforcement = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$enforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnforcementState"])(subscription.id);
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
"[project]/src/app/api/sessions/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.8_@babel+core@7.28.5_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subscription$2d$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/subscription-validation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$throttling$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/throttling.ts [app-route] (ecmascript)");
;
;
;
;
;
async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        const projectId = request.nextUrl.searchParams.get('projectId');
        const deviceId = request.nextUrl.searchParams.get('deviceId');
        const isActive = request.nextUrl.searchParams.get('isActive');
        // Pagination parameters
        const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
        const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
        const sortBy = request.nextUrl.searchParams.get('sortBy') || 'startedAt';
        const sortOrder = request.nextUrl.searchParams.get('sortOrder') || 'desc';
        if (!authHeader || !projectId) {
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
        const whereClause = {
            projectId
        };
        if (deviceId) {
            whereClause.deviceId = deviceId;
        }
        if (isActive === 'true') {
            whereClause.isActive = true;
        } else if (isActive === 'false') {
            whereClause.isActive = false;
        }
        // Calculate pagination offset
        const skip = (page - 1) * limit;
        // Build orderBy clause
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        const [sessions, totalCount] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.findMany({
                where: whereClause,
                include: {
                    device: {
                        select: {
                            deviceId: true,
                            platform: true,
                            model: true
                        }
                    },
                    _count: {
                        select: {
                            apiTraces: true
                        }
                    }
                },
                orderBy,
                skip,
                take: limit
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.count({
                where: whereClause
            })
        ]);
        // Calculate cost per session
        const sessionsWithCost = await Promise.all(sessions.map(async (session)=>{
            const costResult = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiTrace.aggregate({
                where: {
                    sessionId: session.id
                },
                _sum: {
                    cost: true
                },
                _count: true
            });
            return {
                id: session.id,
                sessionToken: session.sessionToken,
                startedAt: session.startedAt,
                endedAt: session.endedAt,
                isActive: session.isActive,
                duration: session.duration,
                screenCount: session.screenCount,
                screenFlow: session.screenFlow,
                device: session.device,
                requestCount: costResult._count,
                totalCost: costResult._sum.cost || 0
            };
        }));
        const totalPages = Math.ceil(totalCount / limit);
        const pagination = {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            sessions: sessionsWithCost,
            pagination
        });
    } catch (error) {
        console.error('Sessions GET error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const apiKey = request.headers.get('x-api-key');
        if (!apiKey) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
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
        const validation = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subscription$2d$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateFeature"])(project.userId, 'sessionTracking');
        if (!validation.valid) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: validation.error || 'Subscription invalid',
                message: validation.error || 'Please upgrade to continue using DevBridge.'
            }, {
                status: 403
            });
        }
        // Check throttling for sessions
        const throttling = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$throttling$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkThrottling"])(project.userId, 'sessions');
        if (throttling.throttled) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: throttling.error || 'Quota exceeded',
                retryAfter: throttling.retryAfter
            }, {
                status: 429,
                headers: {
                    'Retry-After': throttling.retryAfter?.toString() || '3600'
                }
            });
        }
        const body = await request.json();
        const { deviceId, sessionToken, metadata, // New session context fields
        appVersion, osVersion, locale, timezone, networkType, entryScreen, userProperties } = body;
        if (!deviceId || !sessionToken) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing required fields'
            }, {
                status: 400
            });
        }
        // Find or create the device
        let device = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].device.findFirst({
            where: {
                projectId: project.id,
                deviceId,
                status: 'active'
            }
        });
        if (!device) {
            // Device should already exist from registration, but create if not
            device = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].device.create({
                data: {
                    projectId: project.id,
                    deviceId,
                    platform: metadata?.platform || 'unknown'
                }
            });
        }
        // End any existing active sessions for this device
        const endedSessions = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.updateMany({
            where: {
                deviceId: device.id,
                isActive: true
            },
            data: {
                isActive: false,
                endedAt: new Date()
            }
        });
        // Calculate duration for ended sessions
        if (endedSessions.count > 0) {
            const activeSessions = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.findMany({
                where: {
                    deviceId: device.id,
                    endedAt: {
                        not: null
                    },
                    duration: null
                }
            });
            for (const sess of activeSessions){
                if (sess.endedAt && sess.startedAt) {
                    const durationSeconds = Math.floor((sess.endedAt.getTime() - sess.startedAt.getTime()) / 1000);
                    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.update({
                        where: {
                            id: sess.id
                        },
                        data: {
                            duration: durationSeconds
                        }
                    });
                }
            }
        }
        // Create new session with context
        const session = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.create({
            data: {
                projectId: project.id,
                deviceId: device.id,
                sessionToken,
                appVersion,
                osVersion,
                locale,
                timezone,
                networkType,
                entryScreen,
                screenFlow: entryScreen ? [
                    entryScreen
                ] : [],
                screenCount: entryScreen ? 1 : 0,
                userProperties: userProperties || {},
                metadata: metadata || {},
                isActive: true
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            sessionId: session.id,
            sessionToken: session.sessionToken
        });
    } catch (error) {
        console.error('Sessions POST error:', error);
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            // Session token already exists - return existing session
            const body = await request.json().catch(()=>({}));
            const existingSession = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.findUnique({
                where: {
                    sessionToken: body.sessionToken
                }
            });
            if (existingSession) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    sessionId: existingSession.id,
                    sessionToken: existingSession.sessionToken
                });
            }
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
        const apiKey = request.headers.get('x-api-key');
        if (!apiKey) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
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
        const body = await request.json();
        const { sessionToken, exitScreen, screenFlow, eventCount, errorCount, userProperties } = body;
        if (!sessionToken) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing session token'
            }, {
                status: 400
            });
        }
        // Get the current session first to calculate duration
        const currentSession = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.findFirst({
            where: {
                sessionToken,
                projectId: project.id
            }
        });
        if (!currentSession) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Session not found'
            }, {
                status: 404
            });
        }
        const endedAt = new Date();
        const durationSeconds = Math.floor((endedAt.getTime() - currentSession.startedAt.getTime()) / 1000);
        // Calculate unique screen count from screenFlow
        const uniqueScreens = screenFlow ? new Set(screenFlow).size : currentSession.screenCount;
        const session = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.update({
            where: {
                id: currentSession.id
            },
            data: {
                isActive: false,
                endedAt,
                exitScreen: exitScreen || (screenFlow && screenFlow.length > 0 ? screenFlow[screenFlow.length - 1] : null),
                screenFlow: screenFlow || currentSession.screenFlow,
                screenCount: uniqueScreens,
                duration: durationSeconds,
                eventCount: eventCount ?? currentSession.eventCount,
                errorCount: errorCount ?? currentSession.errorCount,
                userProperties: userProperties ? {
                    ...currentSession.userProperties,
                    ...userProperties
                } : currentSession.userProperties
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            sessionId: session.id,
            duration: durationSeconds,
            screenCount: uniqueScreens
        });
    } catch (error) {
        console.error('Sessions PUT error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
async function PATCH(request) {
    try {
        const apiKey = request.headers.get('x-api-key');
        if (!apiKey) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
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
        const body = await request.json();
        const { sessionToken, screenName, incrementEventCount, incrementErrorCount, userProperties, metadata } = body;
        if (!sessionToken) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing session token'
            }, {
                status: 400
            });
        }
        // Get current session
        const currentSession = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.findFirst({
            where: {
                sessionToken,
                projectId: project.id
            }
        });
        if (!currentSession) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Session not found'
            }, {
                status: 404
            });
        }
        // Build update data
        const updateData = {};
        // Add screen to flow if provided
        if (screenName) {
            const currentFlow = currentSession.screenFlow || [];
            // Only add if it's different from the last screen (avoid duplicates from re-renders)
            if (currentFlow.length === 0 || currentFlow[currentFlow.length - 1] !== screenName) {
                updateData.screenFlow = [
                    ...currentFlow,
                    screenName
                ];
                updateData.screenCount = new Set([
                    ...currentFlow,
                    screenName
                ]).size;
            }
        }
        // Increment counters
        if (incrementEventCount) {
            updateData.eventCount = currentSession.eventCount + (typeof incrementEventCount === 'number' ? incrementEventCount : 1);
        }
        if (incrementErrorCount) {
            updateData.errorCount = currentSession.errorCount + (typeof incrementErrorCount === 'number' ? incrementErrorCount : 1);
        }
        // Merge user properties
        if (userProperties) {
            updateData.userProperties = {
                ...currentSession.userProperties,
                ...userProperties
            };
        }
        // Merge metadata
        if (metadata) {
            updateData.metadata = {
                ...currentSession.metadata,
                ...metadata
            };
        }
        // Only update if there's something to update
        if (Object.keys(updateData).length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: 'No updates to apply'
            });
        }
        const session = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.update({
            where: {
                id: currentSession.id
            },
            data: updateData
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            sessionId: session.id,
            screenCount: session.screenCount,
            eventCount: session.eventCount
        });
    } catch (error) {
        console.error('Sessions PATCH error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2c466dad._.js.map