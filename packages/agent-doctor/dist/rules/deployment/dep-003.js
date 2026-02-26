"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dep003 = void 0;
exports.dep003 = {
    id: "DEP-003",
    category: "deployment",
    severity: "warn",
    title: "No rollback strategy",
    check(ctx) {
        const rollbackPattern = /rollback|blue.green|canary|zero.downtime/i;
        let found = false;
        for (const [, content] of ctx.files) {
            if (rollbackPattern.test(content)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "DEP-003",
                    severity: "warn",
                    category: "deployment",
                    title: "No rollback strategy",
                    remediation: "Document and implement a rollback strategy (blue-green, canary) for failed deployments.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=dep-003.js.map