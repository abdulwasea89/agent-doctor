"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obs004 = void 0;
exports.obs004 = {
    id: "OBS-004",
    category: "observability",
    severity: "warn",
    title: "No error tracking",
    check(ctx) {
        const errorTrackingPattern = /sentry|datadog|rollbar|bugsnag|honeybadger|airbrake/i;
        let found = false;
        for (const [, content] of ctx.files) {
            if (errorTrackingPattern.test(content)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "OBS-004",
                    severity: "warn",
                    category: "observability",
                    title: "No error tracking",
                    remediation: "Integrate an error tracking service (Sentry, Datadog, Rollbar) to capture exceptions.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=obs-004.js.map