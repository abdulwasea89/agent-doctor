"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sec009 = void 0;
exports.sec009 = {
    id: "SEC-009",
    category: "security",
    severity: "warn",
    title: "Tool results not validated",
    check(ctx) {
        const diagnostics = [];
        const toolResultPattern = /tool_result|toolResult|tool\.run|invoke\(/;
        const validationPattern = /parse|validate|schema|zod|pydantic|\.safeParse/;
        for (const [file, content] of ctx.files) {
            if (!toolResultPattern.test(content))
                continue;
            if (!validationPattern.test(content)) {
                diagnostics.push({
                    ruleId: "SEC-009",
                    severity: "warn",
                    category: "security",
                    title: "Tool results not validated",
                    file,
                    remediation: "Validate tool output against a schema before using in subsequent steps.",
                });
            }
        }
        return diagnostics;
    },
};
//# sourceMappingURL=sec-009.js.map