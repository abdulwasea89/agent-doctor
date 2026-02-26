"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rel006 = void 0;
exports.rel006 = {
    id: "REL-006",
    category: "reliability",
    severity: "warn",
    title: "No fallback for failed tools",
    check(ctx) {
        const errorPattern = /catch\s*\(|except\s+Exception/;
        const fallbackPattern = /fallback|alternative|default.*tool|backup.*tool|use.*instead/i;
        let hasError = false;
        let hasFallback = false;
        for (const [, content] of ctx.files) {
            if (errorPattern.test(content))
                hasError = true;
            if (fallbackPattern.test(content))
                hasFallback = true;
        }
        if (hasError && !hasFallback) {
            return [{
                    ruleId: "REL-006",
                    severity: "warn",
                    category: "reliability",
                    title: "No fallback for failed tools",
                    remediation: "Implement fallback paths when primary tools fail.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=rel-006.js.map