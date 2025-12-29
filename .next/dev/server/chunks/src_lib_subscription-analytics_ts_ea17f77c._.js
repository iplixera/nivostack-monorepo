module.exports = [
"[project]/src/lib/subscription-analytics.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSubscriptionAnalytics",
    ()=>getSubscriptionAnalytics
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/subscription.ts [app-route] (ecmascript)");
;
;
async function getSubscriptionAnalytics() {
    // Get all active subscriptions with users and plans
    const subscriptions = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].subscription.findMany({
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
            const usage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUsageStats"])(sub.userId);
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
                users: segments.low.map((d)=>({
                        userId: d.userId,
                        email: d.email,
                        planName: d.planName,
                        usagePercentage: d.usage[meterKey]?.percentage || 0,
                        meters: {
                            devices: d.usage.devices,
                            apiTraces: d.usage.apiTraces,
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
                users: segments.medium.map((d)=>({
                        userId: d.userId,
                        email: d.email,
                        planName: d.planName,
                        usagePercentage: d.usage[meterKey]?.percentage || 0,
                        meters: {
                            devices: d.usage.devices,
                            apiTraces: d.usage.apiTraces,
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
                users: segments.high.map((d)=>({
                        userId: d.userId,
                        email: d.email,
                        planName: d.planName,
                        usagePercentage: d.usage[meterKey]?.percentage || 0,
                        meters: {
                            devices: d.usage.devices,
                            apiTraces: d.usage.apiTraces,
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
                users: segments.exceeded.map((d)=>({
                        userId: d.userId,
                        email: d.email,
                        planName: d.planName,
                        usagePercentage: d.usage[meterKey]?.percentage || 0,
                        meters: {
                            devices: d.usage.devices,
                            apiTraces: d.usage.apiTraces,
                            logs: d.usage.logs,
                            sessions: d.usage.sessions
                        }
                    }))
            }
        ];
    }
    // At-risk users (80%+ usage on any meter)
    const atRiskUsers = usageData.filter((d)=>{
        const meters = [
            d.usage.devices,
            d.usage.apiTraces,
            d.usage.logs,
            d.usage.sessions
        ];
        return meters.some((m)=>m && m.limit !== null && m.percentage >= 80 && m.percentage < 100);
    }).map((d)=>{
        const meters = {
            devices: d.usage.devices,
            apiTraces: d.usage.apiTraces,
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
        const meters = [
            d.usage.devices,
            d.usage.apiTraces,
            d.usage.logs,
            d.usage.sessions
        ];
        return meters.some((m)=>m && m.limit !== null && m.percentage >= 100);
    }).map((d)=>{
        const meters = {
            devices: d.usage.devices,
            apiTraces: d.usage.apiTraces,
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
        if (currentPlanIndex === -1 || currentPlanIndex === planHierarchy.length - 1) return;
        const meters = [
            d.usage.devices,
            d.usage.apiTraces,
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
    const totalUsagePercentages = usageData.map((d)=>{
        const meters = [
            d.usage.devices,
            d.usage.apiTraces,
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
            apiTraces: segmentByUsage('apiTraces'),
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
];

//# sourceMappingURL=src_lib_subscription-analytics_ts_ea17f77c._.js.map