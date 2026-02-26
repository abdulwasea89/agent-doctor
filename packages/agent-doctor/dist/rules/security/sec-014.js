"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sec014 = void 0;
exports.sec014 = {
    id: "SEC-014",
    category: "security",
    severity: "warn",
    title: "No input length enforcement",
    check(ctx) {
        const diagnostics = [];
        const inputPattern = /user_input|message|prompt|input/i;
        const lengthPattern = /max_length|maxLength|maxTokens|max_tokens|\.length\s*[<>]/;
        for (const [file, content] of ctx.files) {
            if (!inputPattern.test(content))
                continue;
            if (!lengthPattern.test(content)) {
                diagnostics.push({
                    ruleId: "SEC-014",
                    severity: "warn",
                    category: "security",
                    title: "No input length enforcement",
                    file,
                    remediation: "Enforce max length on agent inputs to prevent prompt flooding attacks.",
                });
            }
        }
        return diagnostics;
    },
};
//# sourceMappingURL=sec-014.js.map