"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sec016 = void 0;
exports.sec016 = {
    id: "SEC-016",
    category: "security",
    severity: "warn",
    title: "System prompt extractable",
    check(ctx) {
        const diagnostics = [];
        const systemPromptPattern = /system_prompt|systemPrompt|system:\s*["'`]/;
        const safeguardPattern = /do not reveal|cannot share|must not repeat|confidential|keep.*secret/i;
        for (const [file, content] of ctx.files) {
            if (!systemPromptPattern.test(content))
                continue;
            if (!safeguardPattern.test(content)) {
                diagnostics.push({
                    ruleId: "SEC-016",
                    severity: "warn",
                    category: "security",
                    title: "System prompt extractable",
                    file,
                    remediation: "Add instructions in the system prompt to not reveal its contents.",
                });
            }
        }
        return diagnostics;
    },
};
//# sourceMappingURL=sec-016.js.map