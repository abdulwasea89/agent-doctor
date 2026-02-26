"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cfg010 = void 0;
exports.cfg010 = {
    id: "CFG-010",
    category: "config",
    severity: "warn",
    title: "No context window management",
    check(ctx) {
        const diagnostics = [];
        const llmPattern = /openai\.|anthropic\.|ChatOpenAI|createCompletion/;
        const contextMgmtPattern = /trim|summarize|sliding.*window|context.*limit|truncate|prune.*message/i;
        let hasLLM = false;
        let hasContextMgmt = false;
        for (const [, content] of ctx.files) {
            if (llmPattern.test(content))
                hasLLM = true;
            if (contextMgmtPattern.test(content))
                hasContextMgmt = true;
        }
        if (hasLLM && !hasContextMgmt) {
            diagnostics.push({
                ruleId: "CFG-010",
                severity: "warn",
                category: "config",
                title: "No context window management",
                remediation: "Implement context trimming or summarization to handle long conversations.",
            });
        }
        return diagnostics;
    },
};
//# sourceMappingURL=cfg-010.js.map