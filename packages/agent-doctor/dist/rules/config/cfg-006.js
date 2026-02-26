"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cfg006 = void 0;
exports.cfg006 = {
    id: "CFG-006",
    category: "config",
    severity: "warn",
    title: "No fallback model",
    check(ctx) {
        const diagnostics = [];
        const fallbackPattern = /fallback|fallbackModel|backup.*model|model.*fallback|router|ModelRouter/i;
        const modelPattern = /gpt-4|gpt-3|claude-|gemini-|llama-/i;
        let hasModel = false;
        let hasFallback = false;
        for (const [, content] of ctx.files) {
            if (modelPattern.test(content))
                hasModel = true;
            if (fallbackPattern.test(content))
                hasFallback = true;
        }
        if (hasModel && !hasFallback) {
            diagnostics.push({
                ruleId: "CFG-006",
                severity: "warn",
                category: "config",
                title: "No fallback model",
                remediation: "Configure a fallback model or router for resilience when primary model is unavailable.",
            });
        }
        return diagnostics;
    },
};
//# sourceMappingURL=cfg-006.js.map