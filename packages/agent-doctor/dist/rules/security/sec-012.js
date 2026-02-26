"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sec012 = void 0;
exports.sec012 = {
    id: "SEC-012",
    category: "security",
    severity: "warn",
    title: "No secrets rotation policy",
    check(ctx) {
        const diagnostics = [];
        const apiKeyPattern = /API_KEY|api_key|SECRET|OPENAI_API_KEY|ANTHROPIC_API_KEY/;
        const rotationPattern = /rotation|rotate|ttl|expir/i;
        for (const [file, content] of ctx.files) {
            if (!apiKeyPattern.test(content))
                continue;
            if (!rotationPattern.test(content)) {
                diagnostics.push({
                    ruleId: "SEC-012",
                    severity: "warn",
                    category: "security",
                    title: "No secrets rotation policy",
                    file,
                    remediation: "Implement a secrets rotation policy with TTL or automated rotation.",
                });
            }
        }
        return diagnostics;
    },
};
//# sourceMappingURL=sec-012.js.map