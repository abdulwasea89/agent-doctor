"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmp011 = void 0;
exports.cmp011 = {
    id: "CMP-011",
    category: "compliance",
    severity: "warn",
    title: "No AI incident response plan",
    check(ctx) {
        const incidentPattern = /incident.response|runbook|playbook|postmortem|on.call/i;
        let found = false;
        for (const [file, content] of ctx.files) {
            if (incidentPattern.test(content) || incidentPattern.test(file)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "CMP-011",
                    severity: "warn",
                    category: "compliance",
                    title: "No AI incident response plan",
                    remediation: "Create an incident response playbook for AI failures and hallucinations.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=cmp-011.js.map