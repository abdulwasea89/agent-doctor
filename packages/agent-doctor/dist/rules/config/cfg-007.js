"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cfg007 = void 0;
exports.cfg007 = {
    id: "CFG-007",
    category: "config",
    severity: "warn",
    title: "No system prompt",
    check(ctx) {
        const diagnostics = [];
        const agentPattern = /Agent\(|createAgent|new Agent|agent\s*=\s*/i;
        const systemPromptPattern = /system_prompt|systemPrompt|system\s*:/i;
        let hasAgent = false;
        let hasSystemPrompt = false;
        for (const [, content] of ctx.files) {
            if (agentPattern.test(content))
                hasAgent = true;
            if (systemPromptPattern.test(content))
                hasSystemPrompt = true;
        }
        if (hasAgent && !hasSystemPrompt) {
            diagnostics.push({
                ruleId: "CFG-007",
                severity: "warn",
                category: "config",
                title: "No system prompt",
                remediation: "Define a system prompt to set agent behavior, persona, and constraints.",
            });
        }
        return diagnostics;
    },
};
//# sourceMappingURL=cfg-007.js.map