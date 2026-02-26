"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rel005 = void 0;
exports.rel005 = {
    id: "REL-005",
    category: "reliability",
    severity: "warn",
    title: "No retry logic",
    check(ctx) {
        const retryPattern = /retry|tenacity|backoff|exponential.*backoff|p-retry|async-retry/i;
        let found = false;
        for (const [, content] of ctx.files) {
            if (retryPattern.test(content)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "REL-005",
                    severity: "warn",
                    category: "reliability",
                    title: "No retry logic",
                    remediation: "Add retry logic with exponential backoff for transient failures.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=rel-005.js.map