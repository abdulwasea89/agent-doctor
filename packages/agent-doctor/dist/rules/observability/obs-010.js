"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obs010 = void 0;
exports.obs010 = {
    id: "OBS-010",
    category: "observability",
    severity: "warn",
    title: "No SLO/SLA defined",
    check(ctx) {
        const sloPattern = /SLO|SLA|service.level|uptime.*%|latency.*p99|error.rate/i;
        let found = false;
        for (const [, content] of ctx.files) {
            if (sloPattern.test(content)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "OBS-010",
                    severity: "warn",
                    category: "observability",
                    title: "No SLO/SLA defined",
                    remediation: "Define SLOs (latency p99, error rate, uptime) for your agent service.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=obs-010.js.map