"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sec004 = void 0;
exports.sec004 = {
    id: "SEC-004",
    category: "security",
    severity: "warn",
    title: "No audit logging on tool calls",
    check(ctx) {
        const diagnostics = [];
        const toolCallPattern = /\.tool\(|invoke_tool|run_tool|call_tool/;
        const loggingPattern = /logger\.|log\.|audit|logging/;
        for (const [file, content] of ctx.files) {
            if (!toolCallPattern.test(content))
                continue;
            if (!loggingPattern.test(content)) {
                diagnostics.push({
                    ruleId: "SEC-004",
                    severity: "warn",
                    category: "security",
                    title: "No audit logging on tool calls",
                    file,
                    remediation: "Add audit logging around all tool invocations to track usage.",
                });
            }
        }
        return diagnostics;
    },
};
//# sourceMappingURL=sec-004.js.map