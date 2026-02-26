"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obs007 = void 0;
exports.obs007 = {
    id: "OBS-007",
    category: "observability",
    severity: "warn",
    title: "No operational dashboard",
    check(ctx) {
        const dashboardPattern = /grafana|datadog|cloudwatch|kibana|dashboard/i;
        let found = false;
        for (const [, content] of ctx.files) {
            if (dashboardPattern.test(content)) {
                found = true;
                break;
            }
        }
        for (const file of ctx.files.keys()) {
            if (/dashboard|grafana/.test(file)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "OBS-007",
                    severity: "warn",
                    category: "observability",
                    title: "No operational dashboard",
                    remediation: "Set up a Grafana, Datadog, or CloudWatch dashboard to monitor agent metrics.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=obs-007.js.map