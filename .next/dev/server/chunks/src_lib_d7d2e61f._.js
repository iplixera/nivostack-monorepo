module.exports = [
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
];

//# sourceMappingURL=src_lib_d7d2e61f._.js.map