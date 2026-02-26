"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obs005 = void 0;
exports.obs005 = {
    id: "OBS-005",
    category: "observability",
    severity: "warn",
    title: "No LLM cost tracking",
    check(ctx) {
        const costPattern = /usage\.total_tokens|promptTokens|completionTokens|cost.*track|token.*usage|usage\.tokens/i;
        let found = false;
        for (const [, content] of ctx.files) {
            if (costPattern.test(content)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "OBS-005",
                    severity: "warn",
                    category: "observability",
                    title: "No LLM cost tracking",
                    remediation: "Log token usage from LLM responses to track and optimize costs.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=obs-005.js.map