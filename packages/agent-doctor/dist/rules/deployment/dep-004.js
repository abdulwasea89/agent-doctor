"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dep004 = void 0;
exports.dep004 = {
    id: "DEP-004",
    category: "deployment",
    severity: "warn",
    title: "No health check endpoint",
    check(ctx) {
        const healthPattern = /\/health|\/ready|\/ping|\/livez|\/readyz/;
        let found = false;
        for (const [, content] of ctx.files) {
            if (healthPattern.test(content)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "DEP-004",
                    severity: "warn",
                    category: "deployment",
                    title: "No health check endpoint",
                    remediation: "Add /health and /ready endpoints for container orchestration health checks.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=dep-004.js.map