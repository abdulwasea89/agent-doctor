"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obs011 = void 0;
exports.obs011 = {
    id: "OBS-011",
    category: "observability",
    severity: "warn",
    title: "No LLM cost budget",
    check(ctx) {
        const budgetPattern = /cost.*budget|budget.*cost|spending.*limit|cost.*limit|max.*spend/i;
        let found = false;
        for (const [, content] of ctx.files) {
            if (budgetPattern.test(content)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "OBS-011",
                    severity: "warn",
                    category: "observability",
                    title: "No LLM cost budget",
                    remediation: "Set cost thresholds or budget alerts to prevent unexpected LLM spending.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=obs-011.js.map