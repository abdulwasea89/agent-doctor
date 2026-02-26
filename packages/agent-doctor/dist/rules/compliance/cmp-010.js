"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmp010 = void 0;
exports.cmp010 = {
    id: "CMP-010",
    category: "compliance",
    severity: "warn",
    title: "No bias testing",
    check(ctx) {
        const biasPattern = /bias.test|fairness|demographic.parity|equalized.odds|disparate.impact/i;
        let found = false;
        for (const [, content] of ctx.files) {
            if (biasPattern.test(content)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "CMP-010",
                    severity: "warn",
                    category: "compliance",
                    title: "No bias testing",
                    remediation: "Add bias and fairness evaluation tests for your agent's outputs.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=cmp-010.js.map