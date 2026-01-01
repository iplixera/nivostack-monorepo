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
"[project]/dashboard/src/lib/notifications.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Notification Utilities
 * 
 * Helper functions for creating and managing user notifications
 */ __turbopack_context__.s([
    "createInvitationNotification",
    ()=>createInvitationNotification,
    "createNotification",
    ()=>createNotification,
    "getUnreadNotificationCount",
    ()=>getUnreadNotificationCount,
    "markAllNotificationsAsRead",
    ()=>markAllNotificationsAsRead,
    "markNotificationAsRead",
    ()=>markNotificationAsRead
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/prisma.ts [app-route] (ecmascript)");
;
async function createNotification(params) {
    return await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].userNotification.create({
        data: {
            userId: params.userId,
            type: params.type,
            title: params.title,
            message: params.message,
            data: params.data || null,
            actionUrl: params.actionUrl || null
        }
    });
}
async function createInvitationNotification(userId, projectId, invitationId, projectName, inviterName, role, invitationToken) {
    return await createNotification({
        userId,
        type: 'invitation',
        title: `You've been invited to join ${projectName}`,
        message: `${inviterName} has invited you to join the "${projectName}" project as a ${role}.`,
        data: {
            projectId,
            invitationId,
            role,
            token: invitationToken
        },
        actionUrl: `/team?project=${projectId}`
    });
}
async function markNotificationAsRead(notificationId, userId) {
    return await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].userNotification.updateMany({
        where: {
            id: notificationId,
            userId
        },
        data: {
            read: true,
            readAt: new Date()
        }
    });
}
async function markAllNotificationsAsRead(userId) {
    return await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].userNotification.updateMany({
        where: {
            userId,
            read: false
        },
        data: {
            read: true,
            readAt: new Date()
        }
    });
}
async function getUnreadNotificationCount(userId) {
    return await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].userNotification.count({
        where: {
            userId,
            read: false
        }
    });
}
}),
"[project]/dashboard/src/app/api/projects/[id]/invitations/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.8_@babel+core@7.28.5_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$team$2d$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/team-access.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$notifications$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/notifications.ts [app-route] (ecmascript)");
;
;
;
;
;
async function GET(request, { params }) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthUser"])(request);
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const { id: projectId } = await params;
        // Check if user can view project (must be member)
        const canView = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$team$2d$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canPerformAction"])(user.id, projectId, 'view');
        if (!canView) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Forbidden'
            }, {
                status: 403
            });
        }
        // Get invitations
        const invitations = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectInvitation.findMany({
            where: {
                projectId
            },
            include: {
                inviter: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                invitedAt: 'desc'
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            invitations: invitations.map((inv)=>({
                    id: inv.id,
                    email: inv.email,
                    role: inv.role,
                    invitedBy: {
                        id: inv.inviter.id,
                        name: inv.inviter.name,
                        email: inv.inviter.email
                    },
                    invitedAt: inv.invitedAt.toISOString(),
                    expiresAt: inv.expiresAt.toISOString(),
                    status: inv.status,
                    emailSent: inv.emailSent,
                    emailSentAt: inv.emailSentAt?.toISOString() || null,
                    emailDelivered: inv.emailDelivered,
                    emailOpened: inv.emailOpened,
                    emailClicked: inv.emailClicked,
                    resendCount: inv.resendCount,
                    lastResentAt: inv.lastResentAt?.toISOString() || null,
                    lastResentBy: inv.lastResentBy || null
                }))
        });
    } catch (error) {
        console.error('Get invitations error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
async function POST(request, { params }) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthUser"])(request);
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const { id: projectId } = await params;
        const { email, role = 'member', message } = await request.json();
        if (!email) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Email is required'
            }, {
                status: 400
            });
        }
        // Validate role
        const validRoles = [
            'admin',
            'member',
            'viewer'
        ];
        if (!validRoles.includes(role)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
            }, {
                status: 400
            });
        }
        // Check if user can invite members
        const canInvite = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$team$2d$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canPerformAction"])(user.id, projectId, 'invite');
        if (!canInvite) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'You do not have permission to invite members'
            }, {
                status: 403
            });
        }
        // Check seat limits
        const seatCheck = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$team$2d$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkSeatLimit"])(projectId);
        if (!seatCheck.allowed) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Seat limit reached. Current: ${seatCheck.current}, Limit: ${seatCheck.limit}`,
                current: seatCheck.current,
                limit: seatCheck.limit
            }, {
                status: 403
            });
        }
        // Check if user is already a member
        const existingMember = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectMember.findFirst({
            where: {
                projectId,
                user: {
                    email
                }
            }
        });
        if (existingMember) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'User is already a member of this project'
            }, {
                status: 400
            });
        }
        // Check if there's a pending invitation for this email
        const existingInvitation = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectInvitation.findFirst({
            where: {
                projectId,
                email,
                status: 'pending'
            }
        });
        if (existingInvitation) {
            // Check if expired
            if (existingInvitation.expiresAt < new Date()) {
                // Update to expired
                await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectInvitation.update({
                    where: {
                        id: existingInvitation.id
                    },
                    data: {
                        status: 'expired'
                    }
                });
            } else {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'A pending invitation already exists for this email'
                }, {
                    status: 400
                });
            }
        }
        // Get invitation expiry days
        const expiryDays = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$team$2d$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getInvitationExpiryDays"])();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);
        // Generate invitation token
        const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        // Create invitation
        let invitation;
        try {
            invitation = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectInvitation.create({
                data: {
                    projectId,
                    email: email.toLowerCase(),
                    role,
                    token,
                    invitedBy: user.id,
                    expiresAt,
                    status: 'pending'
                },
                include: {
                    project: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });
        } catch (err) {
            console.error('Error creating invitation:', err);
            if (err.message?.includes('undefined') || err.message?.includes('create')) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Team invitations feature not available. Please ensure database migrations are complete.'
                }, {
                    status: 503
                });
            }
            throw err;
        }
        // Check if user exists (by email)
        let invitedUser = null;
        try {
            invitedUser = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
                where: {
                    email
                }
            });
        } catch (err) {
            console.warn('Could not check if user exists:', err);
        }
        // Create notification if user exists
        if (invitedUser) {
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$notifications$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createInvitationNotification"])(invitedUser.id, projectId, invitation.id, invitation.project.name, user.name || user.email, role, invitation.token // Pass token for direct acceptance
                );
            } catch (notifErr) {
                console.warn('Could not create notification:', notifErr);
            // Don't fail the invitation if notification creation fails
            }
        }
        // TODO: Phase 3 - Send email if email_enabled is true
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            invitation: {
                id: invitation.id,
                email: invitation.email,
                role: invitation.role,
                token: invitation.token,
                expiresAt: invitation.expiresAt.toISOString(),
                status: invitation.status
            }
        });
    } catch (error) {
        console.error('Create invitation error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__17a0a1f5._.js.map