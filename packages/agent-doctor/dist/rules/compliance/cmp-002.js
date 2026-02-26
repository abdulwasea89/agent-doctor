"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmp002 = void 0;
exports.cmp002 = {
    id: "CMP-002",
    category: "compliance",
    severity: "warn",
    title: "No data retention policy",
    check(ctx) {
        const retentionPattern = /retention|data.expiry|delete.*after|purge.*after|ttl/i;
        let found = false;
        for (const [, content] of ctx.files) {
            if (retentionPattern.test(content)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "CMP-002",
                    severity: "warn",
                    category: "compliance",
                    title: "No data retention policy",
                    remediation: "Implement a data retention policy with TTL or scheduled deletion jobs.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=cmp-002.js.map