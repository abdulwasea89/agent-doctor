"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmp008 = void 0;
exports.cmp008 = {
    id: "CMP-008",
    category: "compliance",
    severity: "error",
    title: "No human oversight for high-stakes",
    check(ctx) {
        const highStakePattern = /payment|transaction|medical.decision|legal.advice|prescri|diagnos/i;
        const humanOversightPattern = /human.review|human.approval|escalate|human.in.the.loop|HITL/i;
        let hasHighStake = false;
        let hasOversight = false;
        for (const [, content] of ctx.files) {
            if (highStakePattern.test(content))
                hasHighStake = true;
            if (humanOversightPattern.test(content))
                hasOversight = true;
        }
        if (hasHighStake && !hasOversight) {
            return [{
                    ruleId: "CMP-008",
                    severity: "error",
                    category: "compliance",
                    title: "No human oversight for high-stakes",
                    remediation: "Add human-in-the-loop review for financial, medical, or legal decisions.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=cmp-008.js.map