"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rel003 = void 0;
exports.rel003 = {
    id: "REL-003",
    category: "reliability",
    severity: "error",
    title: "No timeout on tool calls",
    check(ctx) {
        const httpPattern = /fetch\(|axios\.|requests\.|httpx\./;
        const timeoutPattern = /timeout|signal.*AbortSignal|AbortController|time_limit/i;
        for (const [file, content] of ctx.files) {
            if (!httpPattern.test(content))
                continue;
            if (!timeoutPattern.test(content)) {
                return [{
                        ruleId: "REL-003",
                        severity: "error",
                        category: "reliability",
                        title: "No timeout on tool calls",
                        file,
                        remediation: "Add timeouts to HTTP calls and tool executions to prevent hanging.",
                    }];
            }
        }
        return [];
    },
};
//# sourceMappingURL=rel-003.js.map