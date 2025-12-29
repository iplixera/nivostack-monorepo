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
];

//# sourceMappingURL=src_lib_3d4d3bc6._.js.map