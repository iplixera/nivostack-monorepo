module.exports = [
"[project]/src/lib/business-config/experiments.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Experiment Assignment Engine
 * Handles consistent assignment of users/devices to experiment variants
 */ __turbopack_context__.s([
    "assignToVariant",
    ()=>assignToVariant,
    "calculateExperimentStats",
    ()=>calculateExperimentStats,
    "calculateStatisticalSignificance",
    ()=>calculateStatisticalSignificance
]);
function assignToVariant(experiment, context) {
    if (!experiment.variants || experiment.variants.length === 0) {
        return null;
    }
    // Normalize weights (ensure they sum to 100)
    const totalWeight = experiment.variants.reduce((sum, v)=>sum + v.weight, 0);
    const normalizedVariants = experiment.variants.map((v)=>({
            ...v,
            weight: v.weight / totalWeight * 100
        }));
    // Get identifier for consistent assignment
    const identifier = context.userId || context.deviceId || 'default';
    // Generate hash
    const hash = simpleHash(`${experiment.id}:${identifier}`);
    const percentage = hash % 10000 / 100 // 0-99.99
    ;
    // Assign based on cumulative weights
    let cumulative = 0;
    for(let i = 0; i < normalizedVariants.length; i++){
        cumulative += normalizedVariants[i].weight;
        if (percentage < cumulative) {
            return {
                variantIndex: i,
                variant: normalizedVariants[i]
            };
        }
    }
    // Fallback to last variant
    return {
        variantIndex: normalizedVariants.length - 1,
        variant: normalizedVariants[normalizedVariants.length - 1]
    };
}
/**
 * Simple hash function for consistent assignment
 */ function simpleHash(str) {
    let hash = 0;
    for(let i = 0; i < str.length; i++){
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}
function calculateExperimentStats(assignments, events) {
    const variantStats = {};
    // Count assignments per variant
    assignments.forEach((a)=>{
        if (!variantStats[a.variantIndex]) {
            variantStats[a.variantIndex] = {
                assignments: 0,
                conversions: 0,
                totalValue: 0
            };
        }
        variantStats[a.variantIndex].assignments++;
    });
    // Count conversions per variant
    events.forEach((e)=>{
        if (e.eventType === 'conversion' && variantStats[e.variantIndex]) {
            variantStats[e.variantIndex].conversions++;
            if (e.eventValue) {
                variantStats[e.variantIndex].totalValue += e.eventValue;
            }
        }
    });
    // Calculate rates
    const variantResults = Object.entries(variantStats).map(([index, stats])=>({
            variantIndex: parseInt(index),
            assignments: stats.assignments,
            conversions: stats.conversions,
            conversionRate: stats.assignments > 0 ? stats.conversions / stats.assignments : 0,
            totalValue: stats.totalValue,
            avgValue: stats.conversions > 0 ? stats.totalValue / stats.conversions : 0
        }));
    const totalAssignments = assignments.length;
    const totalConversions = events.filter((e)=>e.eventType === 'conversion').length;
    const overallConversionRate = totalAssignments > 0 ? totalConversions / totalAssignments : 0;
    return {
        variants: variantResults,
        totalAssignments,
        totalConversions,
        overallConversionRate
    };
}
function calculateStatisticalSignificance(variantA, variantB) {
    // Simplified chi-square test
    const totalAssignments = variantA.assignments + variantB.assignments;
    const totalConversions = variantA.conversions + variantB.conversions;
    const totalNonConversions = totalAssignments - totalConversions;
    if (totalAssignments === 0) {
        return {
            significant: false,
            pValue: 1,
            confidence: 0
        };
    }
    const expectedRate = totalConversions / totalAssignments;
    const expectedA = variantA.assignments * expectedRate;
    const expectedB = variantB.assignments * expectedRate;
    const expectedANon = variantA.assignments * (1 - expectedRate);
    const expectedBNon = variantB.assignments * (1 - expectedRate);
    // Chi-square statistic
    const chiSquare = Math.pow(variantA.conversions - expectedA, 2) / expectedA + Math.pow(variantB.conversions - expectedB, 2) / expectedB + Math.pow(variantA.assignments - variantA.conversions - expectedANon, 2) / expectedANon + Math.pow(variantB.assignments - variantB.conversions - expectedBNon, 2) / expectedBNon;
    // Degrees of freedom = 1 (2 variants - 1)
    // Critical value for 95% confidence = 3.84
    const criticalValue = 3.84;
    const significant = chiSquare > criticalValue;
    // Approximate p-value (simplified)
    const pValue = significant ? 0.05 : 0.5;
    const confidence = significant ? 95 : 50;
    return {
        significant,
        pValue,
        confidence
    };
}
}),
];

//# sourceMappingURL=src_lib_business-config_experiments_ts_cb4bd7e3._.js.map