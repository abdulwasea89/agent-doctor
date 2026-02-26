"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cfg004 = void 0;
exports.cfg004 = {
    id: "CFG-004",
    category: "config",
    severity: "error",
    title: "MCP schema invalid",
    check(ctx) {
        const diagnostics = [];
        if (!ctx.projectInfo.mcpCompliant)
            return diagnostics;
        for (const [file, content] of ctx.files) {
            if (!file.endsWith(".json"))
                continue;
            try {
                const data = JSON.parse(content);
                // Check for MCP tool schema structure
                if (data.tools && Array.isArray(data.tools)) {
                    const tools = data.tools;
                    for (const tool of tools) {
                        if (!tool.name || !tool.description || !tool.inputSchema) {
                            diagnostics.push({
                                ruleId: "CFG-004",
                                severity: "error",
                                category: "config",
                                title: "MCP schema invalid",
                                file,
                                remediation: "Ensure all MCP tools have name, description, and inputSchema fields.",
                            });
                            break;
                        }
                    }
                }
            }
            catch {
                // ignore non-JSON files
            }
        }
        return diagnostics;
    },
};
//# sourceMappingURL=cfg-004.js.map