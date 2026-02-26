"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rel010 = void 0;
exports.rel010 = {
    id: "REL-010",
    category: "reliability",
    severity: "warn",
    title: "Long tasks run synchronously",
    check(ctx) {
        const diagnostics = [];
        const syncLongOpPattern = /time\.sleep\(\d{2,}|sleep\(\d{2,}|\.wait\(\d{5,}/;
        const asyncPattern = /async\s+def|async\s+function|await\s+|celery|rq\.|queue\./;
        for (const [file, content] of ctx.files) {
            if (!syncLongOpPattern.test(content))
                continue;
            if (!asyncPattern.test(content)) {
                diagnostics.push({
                    ruleId: "REL-010",
                    severity: "warn",
                    category: "reliability",
                    title: "Long tasks run synchronously",
                    file,
                    remediation: "Move long-running operations to async queues (Celery, BullMQ, etc.).",
                });
            }
        }
        return diagnostics;
    },
};
//# sourceMappingURL=rel-010.js.map