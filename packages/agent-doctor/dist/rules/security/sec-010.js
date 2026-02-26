"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sec010 = void 0;
exports.sec010 = {
    id: "SEC-010",
    category: "security",
    severity: "warn",
    title: "No rate limiting",
    check(ctx) {
        const diagnostics = [];
        const httpPattern = /fetch\(|axios\.|requests\.|httpx\.|got\(/;
        const rateLimitPattern = /rateLimit|throttle|limiter|rate_limit/;
        for (const [file, content] of ctx.files) {
            if (!httpPattern.test(content))
                continue;
            if (!rateLimitPattern.test(content)) {
                diagnostics.push({
                    ruleId: "SEC-010",
                    severity: "warn",
                    category: "security",
                    title: "No rate limiting",
                    file,
                    remediation: "Add rate limiting to HTTP clients to prevent abuse and API exhaustion.",
                });
            }
        }
        return diagnostics;
    },
};
//# sourceMappingURL=sec-010.js.map