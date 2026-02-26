"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obs009 = void 0;
exports.obs009 = {
    id: "OBS-009",
    category: "observability",
    severity: "warn",
    title: "Memory ops not traced",
    check(ctx) {
        if (ctx.projectInfo.memoryBackend === "none")
            return [];
        const memoryOpPattern = /memory\.read|memory\.write|\.get\(|\.set\(|\.store\(/;
        const loggingPattern = /logger\.|log\.|trace\.|span\./;
        for (const [file, content] of ctx.files) {
            if (!memoryOpPattern.test(content))
                continue;
            if (!loggingPattern.test(content)) {
                return [{
                        ruleId: "OBS-009",
                        severity: "warn",
                        category: "observability",
                        title: "Memory ops not traced",
                        file,
                        remediation: "Add logging/tracing around memory read/write operations.",
                    }];
            }
        }
        return [];
    },
};
//# sourceMappingURL=obs-009.js.map