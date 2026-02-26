"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rel001 = void 0;
exports.rel001 = {
    id: "REL-001",
    category: "reliability",
    severity: "error",
    title: "No max_iterations limit",
    check(ctx) {
        const agentPattern = /AgentExecutor|createAgent|new Agent|\.run\(/;
        const iterPattern = /max_iterations|maxIterations|max_steps|maxSteps/;
        let hasAgent = false;
        let hasLimit = false;
        for (const [, content] of ctx.files) {
            if (agentPattern.test(content))
                hasAgent = true;
            if (iterPattern.test(content))
                hasLimit = true;
        }
        if (hasAgent && !hasLimit) {
            return [{
                    ruleId: "REL-001",
                    severity: "error",
                    category: "reliability",
                    title: "No max_iterations limit",
                    remediation: "Set max_iterations on your agent executor to prevent infinite loops.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=rel-001.js.map