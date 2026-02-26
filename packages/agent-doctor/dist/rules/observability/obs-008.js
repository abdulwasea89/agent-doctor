"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obs008 = void 0;
exports.obs008 = {
    id: "OBS-008",
    category: "observability",
    severity: "warn",
    title: "Log level not configurable",
    check(ctx) {
        const logPattern = /console\.log|logger\.|logging\./;
        const logLevelPattern = /LOG_LEVEL|log_level|setLevel|logLevel/i;
        let hasLogging = false;
        let hasLogLevel = false;
        for (const [, content] of ctx.files) {
            if (logPattern.test(content))
                hasLogging = true;
            if (logLevelPattern.test(content))
                hasLogLevel = true;
        }
        if (hasLogging && !hasLogLevel) {
            return [{
                    ruleId: "OBS-008",
                    severity: "warn",
                    category: "observability",
                    title: "Log level not configurable",
                    remediation: "Use LOG_LEVEL environment variable to control logging verbosity.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=obs-008.js.map