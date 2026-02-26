"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateScore = calculateScore;
const WEIGHTS = {
    security: 25,
    reliability: 20,
    config: 20,
    deployment: 15,
    observability: 10,
    compliance: 10,
};
const ERROR_PENALTY = 8;
const WARN_PENALTY = 3;
const DEAD_TOOL_PENALTY = 2;
function calculateScore(diagnostics, deadTools, projectInfo, durationMs, fileCount) {
    const categories = Object.keys(WEIGHTS);
    const dimensions = {};
    for (const cat of categories) {
        const weight = WEIGHTS[cat];
        const catDiagnostics = diagnostics.filter((d) => d.category === cat);
        let penalty = 0;
        for (const d of catDiagnostics) {
            penalty += d.severity === "error" ? ERROR_PENALTY : WARN_PENALTY;
        }
        // Dead tool penalty applied to reliability
        if (cat === "reliability") {
            penalty += deadTools.length * DEAD_TOOL_PENALTY;
        }
        const score = Math.max(0, weight - penalty);
        dimensions[cat] = { score, max: weight };
    }
    const totalScore = Object.values(dimensions).reduce((sum, d) => sum + d.score, 0);
    const score = Math.round(totalScore);
    let label;
    if (score >= 75)
        label = "Great";
    else if (score >= 50)
        label = "Needs work";
    else
        label = "Critical";
    return {
        score,
        label,
        dimensions,
        diagnostics,
        files: fileCount,
        deadTools,
        projectInfo,
        durationMs,
    };
}
//# sourceMappingURL=scorer.js.map