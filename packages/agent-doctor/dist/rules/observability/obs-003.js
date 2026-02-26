"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obs003 = void 0;
exports.obs003 = {
    id: "OBS-003",
    category: "observability",
    severity: "warn",
    title: "No alerting on tool failures",
    check(ctx) {
        const alertPattern = /pagerduty|opsgenie|alertmanager|alert\.|notify\.|slack.*error|error.*slack/i;
        let found = false;
        for (const [, content] of ctx.files) {
            if (alertPattern.test(content)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "OBS-003",
                    severity: "warn",
                    category: "observability",
                    title: "No alerting on tool failures",
                    remediation: "Configure alerts (PagerDuty, Opsgenie, Slack) for tool failure rates.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=obs-003.js.map