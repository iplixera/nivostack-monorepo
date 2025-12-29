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
"[project]/src/lib/admin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "changeSubscriptionPlan",
    ()=>changeSubscriptionPlan,
    "createPlan",
    ()=>createPlan,
    "createSubscriptionForUser",
    ()=>createSubscriptionForUser,
    "deletePlan",
    ()=>deletePlan,
    "disableSubscription",
    ()=>disableSubscription,
    "enableSubscription",
    ()=>enableSubscription,
    "getAllPlans",
    ()=>getAllPlans,
    "getAllSubscriptions",
    ()=>getAllSubscriptions,
    "getAllUsers",
    ()=>getAllUsers,
    "getPlanById",
    ()=>getPlanById,
    "getPlatformStats",
    ()=>getPlatformStats,
    "getRevenueStats",
    ()=>getRevenueStats,
    "getSubscriptionDetails",
    ()=>getSubscriptionDetails,
    "isAdmin",
    ()=>isAdmin,
    "updatePlan",
    ()=>updatePlan,
    "updateSubscriptionQuotas",
    ()=>updateSubscriptionQuotas,
    "updateSubscriptionStatus",
    ()=>updateSubscriptionStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
async function isAdmin(userId) {
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
        where: {
            id: userId
        },
        select: {
            isAdmin: true
        }
    });
    return user?.isAdmin === true;
}
async function getAllUsers() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findMany({
        include: {
            subscription: {
                include: {
                    plan: true
                }
            },
            projects: {
                select: {
                    id: true
                }
            },
            _count: {
                select: {
                    projects: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}
async function getAllSubscriptions() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.findMany({
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
                    price: true,
                    maxProjects: true,
                    maxDevices: true,
                    maxMockEndpoints: true,
                    maxApiEndpoints: true,
                    maxApiRequests: true,
                    maxLogs: true,
                    maxSessions: true,
                    maxCrashes: true,
                    maxBusinessConfigKeys: true,
                    maxLocalizationLanguages: true,
                    maxLocalizationKeys: true,
                    retentionDays: true
                }
            },
            invoices: {
                select: {
                    id: true,
                    amount: true,
                    status: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}
async function enableSubscription(subscriptionId, adminUserId) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.update({
        where: {
            id: subscriptionId
        },
        data: {
            enabled: true,
            enabledBy: adminUserId,
            enabledAt: new Date(),
            updatedAt: new Date()
        }
    });
}
async function disableSubscription(subscriptionId, adminUserId) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.update({
        where: {
            id: subscriptionId
        },
        data: {
            enabled: false,
            disabledBy: adminUserId,
            disabledAt: new Date(),
            updatedAt: new Date()
        }
    });
}
async function getPlatformStats() {
    const [totalUsers, activeSubscriptions, expiredSubscriptions, disabledSubscriptions, totalProjects, totalDevices, totalApiTraces, totalLogs, totalSessions, totalCrashes, businessConfigs, localizationKeys] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.count(),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.count({
            where: {
                enabled: true,
                status: 'active'
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.count({
            where: {
                status: 'expired'
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.count({
            where: {
                enabled: false
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.count(),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].device.count(),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiTrace.count(),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].log.count(),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.count(),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].crash.count(),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].businessConfig.count(),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].localizationKey.count()
    ]);
    return {
        users: {
            total: totalUsers,
            active: activeSubscriptions,
            expired: expiredSubscriptions,
            disabled: disabledSubscriptions
        },
        platform: {
            projects: totalProjects,
            devices: totalDevices,
            apiTraces: totalApiTraces,
            logs: totalLogs,
            sessions: totalSessions,
            crashes: totalCrashes
        },
        features: {
            businessConfig: businessConfigs,
            localization: localizationKeys
        }
    };
}
async function getRevenueStats() {
    const subscriptions = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.findMany({
        include: {
            plan: true,
            invoices: {
                where: {
                    status: 'paid'
                }
            }
        }
    });
    const totalRevenue = subscriptions.reduce((sum, sub)=>{
        const invoiceTotal = sub.invoices.reduce((invoiceSum, inv)=>invoiceSum + inv.amount, 0);
        return sum + invoiceTotal;
    }, 0);
    const activeSubscriptions = subscriptions.filter((sub)=>sub.enabled && sub.status === 'active').length;
    const expiredSubscriptions = subscriptions.filter((sub)=>sub.status === 'expired').length;
    return {
        totalRevenue,
        activeSubscriptions,
        expiredSubscriptions
    };
}
async function getAllPlans() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].plan.findMany({
        include: {
            _count: {
                select: {
                    subscriptions: true
                }
            }
        },
        orderBy: {
            price: 'asc'
        }
    });
}
async function getPlanById(planId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].plan.findUnique({
        where: {
            id: planId
        },
        include: {
            _count: {
                select: {
                    subscriptions: true
                }
            }
        }
    });
}
async function createPlan(data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].plan.create({
        data: {
            name: data.name,
            displayName: data.displayName,
            description: data.description || null,
            price: data.price,
            currency: data.currency || 'USD',
            interval: data.interval || 'month',
            isActive: data.isActive !== undefined ? data.isActive : true,
            isPublic: data.isPublic !== undefined ? data.isPublic : true,
            maxProjects: data.maxProjects ?? null,
            maxDevices: data.maxDevices ?? null,
            maxMockEndpoints: data.maxMockEndpoints ?? null,
            maxApiEndpoints: data.maxApiEndpoints ?? null,
            maxApiRequests: data.maxApiRequests ?? null,
            maxLogs: data.maxLogs ?? null,
            maxSessions: data.maxSessions ?? null,
            maxCrashes: data.maxCrashes ?? null,
            retentionDays: data.retentionDays ?? null,
            allowApiTracking: data.allowApiTracking ?? true,
            allowScreenTracking: data.allowScreenTracking ?? true,
            allowCrashReporting: data.allowCrashReporting ?? true,
            allowLogging: data.allowLogging ?? true,
            allowBusinessConfig: data.allowBusinessConfig ?? true,
            allowLocalization: data.allowLocalization ?? true,
            allowCustomDomains: data.allowCustomDomains ?? false,
            allowWebhooks: data.allowWebhooks ?? false,
            allowTeamMembers: data.allowTeamMembers ?? false,
            allowPrioritySupport: data.allowPrioritySupport ?? false,
            enforcementConfig: data.enforcementConfig || null
        }
    });
}
async function updatePlan(planId, data) {
    // Filter out read-only fields that might be sent from frontend
    const { id, createdAt, updatedAt, _count, subscriptions, ...updateData } = data;
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].plan.update({
        where: {
            id: planId
        },
        data: {
            ...updateData,
            updatedAt: new Date()
        }
    });
}
async function deletePlan(planId) {
    // Check if plan has active subscriptions
    const subscriptionCount = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.count({
        where: {
            planId,
            status: 'active'
        }
    });
    if (subscriptionCount > 0) {
        throw new Error(`Cannot delete plan: ${subscriptionCount} active subscription(s) are using this plan`);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].plan.delete({
        where: {
            id: planId
        }
    });
}
async function changeSubscriptionPlan(subscriptionId, newPlanId, adminUserId) {
    const subscription = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.findUnique({
        where: {
            id: subscriptionId
        },
        include: {
            plan: true
        }
    });
    if (!subscription) {
        throw new Error('Subscription not found');
    }
    const plan = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].plan.findUnique({
        where: {
            id: newPlanId
        }
    });
    if (!plan) {
        throw new Error('Plan not found');
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.update({
        where: {
            id: subscriptionId
        },
        data: {
            planId: newPlanId,
            // Reset trial dates if moving to free plan
            ...plan.name === 'free' && {
                trialStartDate: new Date(),
                trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            updatedAt: new Date()
        }
    });
}
async function updateSubscriptionQuotas(subscriptionId, quotas) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.update({
        where: {
            id: subscriptionId
        },
        data: {
            ...quotas,
            updatedAt: new Date()
        },
        include: {
            plan: true,
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true
                }
            }
        }
    });
}
async function updateSubscriptionStatus(subscriptionId, status, adminUserId) {
    const updateData = {
        status,
        updatedAt: new Date()
    };
    if (status === 'disabled' || status === 'suspended') {
        updateData.enabled = false;
        updateData.disabledBy = adminUserId;
        updateData.disabledAt = new Date();
    } else if (status === 'active') {
        updateData.enabled = true;
        updateData.enabledBy = adminUserId;
        updateData.enabledAt = new Date();
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.update({
        where: {
            id: subscriptionId
        },
        data: updateData
    });
}
async function getSubscriptionDetails(subscriptionId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.findUnique({
        where: {
            id: subscriptionId
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true
                }
            },
            plan: true,
            invoices: {
                orderBy: {
                    createdAt: 'desc'
                },
                take: 10
            }
        }
    });
}
async function createSubscriptionForUser(userId, planId, adminUserId, options) {
    // Check if user already has a subscription
    const existingSubscription = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.findUnique({
        where: {
            userId
        }
    });
    if (existingSubscription) {
        throw new Error('User already has a subscription. Use changeSubscriptionPlan instead.');
    }
    // Get plan
    const plan = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].plan.findUnique({
        where: {
            id: planId
        }
    });
    if (!plan) {
        throw new Error('Plan not found');
    }
    // Calculate discount
    let discountPercent = options?.discountPercent || null;
    let discountAmount = options?.discountAmount || null;
    let discountedPrice = plan.price;
    // If promo code provided, validate and apply
    if (options?.promoCodeId) {
        const promoCode = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].promoCode.findUnique({
            where: {
                id: options.promoCodeId
            }
        });
        if (!promoCode) {
            throw new Error('Promo code not found');
        }
        if (!promoCode.isActive) {
            throw new Error('Promo code is not active');
        }
        const now = new Date();
        if (now < promoCode.validFrom) {
            throw new Error('Promo code is not yet valid');
        }
        if (promoCode.validUntil && now > promoCode.validUntil) {
            throw new Error('Promo code has expired');
        }
        if (promoCode.maxUses !== null && promoCode.currentUses >= promoCode.maxUses) {
            throw new Error('Promo code has reached maximum uses');
        }
        if (promoCode.applicablePlans.length > 0 && !promoCode.applicablePlans.includes(plan.name)) {
            throw new Error('Promo code does not apply to this plan');
        }
        if (promoCode.minPlanPrice !== null && plan.price < promoCode.minPlanPrice) {
            throw new Error('Promo code requires a higher plan price');
        }
        // Apply discount
        if (promoCode.discountType === 'percent') {
            discountPercent = promoCode.discountValue;
            discountedPrice = plan.price * (1 - promoCode.discountValue / 100);
        } else {
            discountAmount = promoCode.discountValue;
            discountedPrice = Math.max(0, plan.price - promoCode.discountValue);
        }
        // Increment usage
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].promoCode.update({
            where: {
                id: promoCode.id
            },
            data: {
                currentUses: {
                    increment: 1
                }
            }
        });
    } else if (options?.discountPercent) {
        // Direct percentage discount
        discountedPrice = plan.price * (1 - options.discountPercent / 100);
    } else if (options?.discountAmount) {
        // Direct fixed discount
        discountedPrice = Math.max(0, plan.price - options.discountAmount);
    }
    // Calculate trial dates
    const trialStartDate = new Date();
    const trialDays = plan.retentionDays || 30;
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);
    // Create subscription
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.create({
        data: {
            userId,
            planId,
            status: 'active',
            enabled: true,
            trialStartDate,
            trialEndDate,
            currentPeriodStart: trialStartDate,
            currentPeriodEnd: trialEndDate
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true
                }
            },
            plan: true
        }
    });
}
}),
"[project]/src/app/api/admin/plans/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.8_@babel+core@7.28.5_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/admin.ts [app-route] (ecmascript)");
;
;
;
async function GET(request) {
    try {
        const admin = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateAdmin"])(request);
        if (!admin) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized - Admin access required'
            }, {
                status: 403
            });
        }
        const plans = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllPlans"])();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            plans
        });
    } catch (error) {
        console.error('Get plans error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('Error details:', {
            errorMessage,
            errorStack
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: errorMessage,
            details: ("TURBOPACK compile-time truthy", 1) ? errorStack : "TURBOPACK unreachable"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const admin = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateAdmin"])(request);
        if (!admin) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized - Admin access required'
            }, {
                status: 403
            });
        }
        const body = await request.json();
        // Validate required fields
        if (!body.name || !body.displayName || body.price === undefined) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing required fields: name, displayName, price'
            }, {
                status: 400
            });
        }
        // Check if plan name already exists
        const existingPlan = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllPlans"])();
        if (existingPlan.some((p)=>p.name === body.name)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Plan with name "${body.name}" already exists`
            }, {
                status: 409
            });
        }
        const plan = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createPlan"])(body);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            plan
        }, {
            status: 201
        });
    } catch (error) {
        console.error('Create plan error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error instanceof Error ? error.message : 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ac862c27._.js.map