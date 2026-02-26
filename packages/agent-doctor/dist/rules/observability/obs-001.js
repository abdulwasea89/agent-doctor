"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obs001 = void 0;
exports.obs001 = {
    id: "OBS-001",
    category: "observability",
    severity: "warn",
    title: "No structured logging",
    check(ctx) {
        const unstructuredPattern = /console\.log\(|print\(/;
        const structuredPattern = /winston|pino|bunyan|structlog|structuredLog|logger\.|logging\./;
        let hasUnstructured = false;
        let hasStructured = false;
        for (const [, content] of ctx.files) {
            if (unstructuredPattern.test(content))
                hasUnstructured = true;
            if (structuredPattern.test(content))
                hasStructured = true;
        }
        if (hasUnstructured && !hasStructured) {
            return [{
                    ruleId: "OBS-001",
                    severity: "warn",
                    category: "observability",
                    title: "No structured logging",
                    remediation: "Replace console.log/print with a structured logger (winston, pino, structlog).",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=obs-001.js.map