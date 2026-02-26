"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cfg011 = void 0;
exports.cfg011 = {
    id: "CFG-011",
    category: "config",
    severity: "warn",
    title: "No input schema on tools",
    check(ctx) {
        const diagnostics = [];
        const toolDefPattern = /DynamicTool|StructuredTool|@tool\b|\.tool\(/;
        const schemaPattern = /z\.object|BaseModel|inputSchema|parameters.*schema|zod\./i;
        for (const [file, content] of ctx.files) {
            if (!toolDefPattern.test(content))
                continue;
            if (!schemaPattern.test(content)) {
                diagnostics.push({
                    ruleId: "CFG-011",
                    severity: "warn",
                    category: "config",
                    title: "No input schema on tools",
                    file,
                    remediation: "Define input schemas for tools using Zod, Pydantic, or JSON Schema.",
                });
            }
        }
        return diagnostics;
    },
};
//# sourceMappingURL=cfg-011.js.map