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
"[project]/dashboard/src/app/api/sdk-settings/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.8_@babel+core@7.28.5_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$team$2d$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/team-access.ts [app-route] (ecmascript)");
;
;
;
;
// Default SDK settings values
const DEFAULT_SDK_SETTINGS = {
    // Tracking mode - 'disabled' by default (safe default)
    trackingMode: 'disabled',
    // Security
    captureRequestBodies: true,
    captureResponseBodies: true,
    capturePrintStatements: false,
    sanitizeSensitiveData: true,
    sensitiveFieldPatterns: [
        'password',
        'token',
        'secret',
        'apiKey',
        'api_key',
        'authorization',
        'cookie'
    ],
    // Performance
    maxLogQueueSize: 100,
    maxTraceQueueSize: 50,
    flushIntervalSeconds: 30,
    enableBatching: true,
    // Log control - 'debug' by default (can be set to 'disabled' to turn off logging)
    minLogLevel: 'debug',
    verboseErrors: false
};
async function GET(request) {
    try {
        const apiKey = request.headers.get('x-api-key');
        const authHeader = request.headers.get('authorization');
        const projectId = request.nextUrl.searchParams.get('projectId');
        let project;
        // SDK authentication (API key)
        if (apiKey) {
            project = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
                where: {
                    apiKey
                },
                select: {
                    id: true
                }
            });
            if (!project) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Invalid API key'
                }, {
                    status: 401
                });
            }
        } else if (authHeader && projectId) {
            const token = authHeader.replace('Bearer ', '');
            const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(token);
            if (!payload) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Unauthorized'
                }, {
                    status: 401
                });
            }
            // Check if user has access to project (owner or member)
            const hasAccess = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$team$2d$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canPerformAction"])(payload.userId, projectId, 'view');
            if (!hasAccess) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Project not found or access denied'
                }, {
                    status: 404
                });
            }
            // Verify project exists
            project = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
                where: {
                    id: projectId
                },
                select: {
                    id: true
                }
            });
            if (!project) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Project not found'
                }, {
                    status: 404
                });
            }
        } else {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Authentication required'
            }, {
                status: 401
            });
        }
        // Fetch SDK settings
        let settings = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].sdkSettings.findUnique({
            where: {
                projectId: project.id
            },
            select: {
                id: true,
                projectId: true,
                trackingMode: true,
                captureRequestBodies: true,
                captureResponseBodies: true,
                capturePrintStatements: true,
                sanitizeSensitiveData: true,
                sensitiveFieldPatterns: true,
                maxLogQueueSize: true,
                maxTraceQueueSize: true,
                flushIntervalSeconds: true,
                enableBatching: true,
                minLogLevel: true,
                verboseErrors: true
            }
        });
        // If no settings exist, create with defaults
        if (!settings) {
            settings = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].sdkSettings.create({
                data: {
                    projectId: project.id,
                    ...DEFAULT_SDK_SETTINGS
                },
                select: {
                    id: true,
                    projectId: true,
                    trackingMode: true,
                    captureRequestBodies: true,
                    captureResponseBodies: true,
                    capturePrintStatements: true,
                    sanitizeSensitiveData: true,
                    sensitiveFieldPatterns: true,
                    maxLogQueueSize: true,
                    maxTraceQueueSize: true,
                    flushIntervalSeconds: true,
                    enableBatching: true,
                    minLogLevel: true,
                    verboseErrors: true
                }
            });
        }
        // Also fetch API configs for per-endpoint settings
        const apiConfigs = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].apiConfig.findMany({
            where: {
                projectId: project.id,
                isEnabled: true
            },
            select: {
                endpoint: true,
                method: true,
                enableLogs: true,
                captureRequestBody: true,
                captureResponseBody: true,
                costPerRequest: true
            }
        });
        // Normalize 'disabled' to 'none' for UI consistency
        const trackingMode = settings.trackingMode || DEFAULT_SDK_SETTINGS.trackingMode;
        const normalizedTrackingMode = trackingMode === 'disabled' ? 'none' : trackingMode;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            settings: {
                // Tracking mode - normalized to 'none' if 'disabled'
                trackingMode: normalizedTrackingMode,
                // Security
                captureRequestBodies: settings.captureRequestBodies,
                captureResponseBodies: settings.captureResponseBodies,
                capturePrintStatements: settings.capturePrintStatements,
                sanitizeSensitiveData: settings.sanitizeSensitiveData,
                sensitiveFieldPatterns: settings.sensitiveFieldPatterns,
                // Performance
                maxLogQueueSize: settings.maxLogQueueSize,
                maxTraceQueueSize: settings.maxTraceQueueSize,
                flushIntervalSeconds: settings.flushIntervalSeconds,
                enableBatching: settings.enableBatching,
                // Log control
                minLogLevel: settings.minLogLevel,
                verboseErrors: settings.verboseErrors
            },
            apiConfigs
        });
    } catch (error) {
        console.error('SDK settings GET error:', error);
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
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(token);
        if (!payload) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const body = await request.json();
        const { projectId, ...updates } = body;
        if (!projectId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Project ID required'
            }, {
                status: 400
            });
        }
        // Verify project ownership
        const project = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findFirst({
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
        const selectFields = {
            id: true,
            projectId: true,
            trackingMode: true,
            captureRequestBodies: true,
            captureResponseBodies: true,
            capturePrintStatements: true,
            sanitizeSensitiveData: true,
            sensitiveFieldPatterns: true,
            maxLogQueueSize: true,
            maxTraceQueueSize: true,
            flushIntervalSeconds: true,
            enableBatching: true,
            minLogLevel: true,
            verboseErrors: true
        };
        // Check if settings exist
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].sdkSettings.findUnique({
            where: {
                projectId
            },
            select: {
                id: true
            }
        });
        let settings;
        if (existing) {
            // Update existing settings
            settings = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].sdkSettings.update({
                where: {
                    projectId
                },
                data: {
                    // Tracking mode
                    ...updates.trackingMode !== undefined && {
                        trackingMode: updates.trackingMode
                    },
                    // Security
                    ...updates.captureRequestBodies !== undefined && {
                        captureRequestBodies: updates.captureRequestBodies
                    },
                    ...updates.captureResponseBodies !== undefined && {
                        captureResponseBodies: updates.captureResponseBodies
                    },
                    ...updates.capturePrintStatements !== undefined && {
                        capturePrintStatements: updates.capturePrintStatements
                    },
                    ...updates.sanitizeSensitiveData !== undefined && {
                        sanitizeSensitiveData: updates.sanitizeSensitiveData
                    },
                    ...updates.sensitiveFieldPatterns !== undefined && {
                        sensitiveFieldPatterns: updates.sensitiveFieldPatterns
                    },
                    // Performance
                    ...updates.maxLogQueueSize !== undefined && {
                        maxLogQueueSize: updates.maxLogQueueSize
                    },
                    ...updates.maxTraceQueueSize !== undefined && {
                        maxTraceQueueSize: updates.maxTraceQueueSize
                    },
                    ...updates.flushIntervalSeconds !== undefined && {
                        flushIntervalSeconds: updates.flushIntervalSeconds
                    },
                    ...updates.enableBatching !== undefined && {
                        enableBatching: updates.enableBatching
                    },
                    // Log control
                    ...updates.minLogLevel !== undefined && {
                        minLogLevel: updates.minLogLevel
                    },
                    ...updates.verboseErrors !== undefined && {
                        verboseErrors: updates.verboseErrors
                    }
                },
                select: selectFields
            });
        } else {
            // Create new settings with defaults
            settings = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].sdkSettings.create({
                data: {
                    projectId,
                    trackingMode: updates.trackingMode ?? DEFAULT_SDK_SETTINGS.trackingMode,
                    captureRequestBodies: updates.captureRequestBodies ?? DEFAULT_SDK_SETTINGS.captureRequestBodies,
                    captureResponseBodies: updates.captureResponseBodies ?? DEFAULT_SDK_SETTINGS.captureResponseBodies,
                    capturePrintStatements: updates.capturePrintStatements ?? DEFAULT_SDK_SETTINGS.capturePrintStatements,
                    sanitizeSensitiveData: updates.sanitizeSensitiveData ?? DEFAULT_SDK_SETTINGS.sanitizeSensitiveData,
                    sensitiveFieldPatterns: updates.sensitiveFieldPatterns ?? DEFAULT_SDK_SETTINGS.sensitiveFieldPatterns,
                    maxLogQueueSize: updates.maxLogQueueSize ?? DEFAULT_SDK_SETTINGS.maxLogQueueSize,
                    maxTraceQueueSize: updates.maxTraceQueueSize ?? DEFAULT_SDK_SETTINGS.maxTraceQueueSize,
                    flushIntervalSeconds: updates.flushIntervalSeconds ?? DEFAULT_SDK_SETTINGS.flushIntervalSeconds,
                    enableBatching: updates.enableBatching ?? DEFAULT_SDK_SETTINGS.enableBatching,
                    minLogLevel: updates.minLogLevel ?? DEFAULT_SDK_SETTINGS.minLogLevel,
                    verboseErrors: updates.verboseErrors ?? DEFAULT_SDK_SETTINGS.verboseErrors
                },
                select: selectFields
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            settings
        });
    } catch (error) {
        console.error('SDK settings PUT error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d68e6899._.js.map