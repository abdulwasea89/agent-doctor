"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obs002 = void 0;
exports.obs002 = {
    id: "OBS-002",
    category: "observability",
    severity: "warn",
    title: "No distributed tracing",
    check(ctx) {
        const tracingPattern = /opentelemetry|langfuse|langsmith|jaeger|zipkin|datadog.*trace|@opentelemetry/i;
        let found = false;
        for (const [, content] of ctx.files) {
            if (tracingPattern.test(content)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "OBS-002",
                    severity: "warn",
                    category: "observability",
                    title: "No distributed tracing",
                    remediation: "Add OpenTelemetry or Langfuse/Langsmith for distributed tracing of agent calls.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=obs-002.js.map