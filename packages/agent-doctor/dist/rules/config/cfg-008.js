"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cfg008 = void 0;
exports.cfg008 = {
    id: "CFG-008",
    category: "config",
    severity: "error",
    title: "Duplicate tool names",
    check(ctx) {
        const diagnostics = [];
        const toolNamePattern = /name\s*[:=]\s*["']([^"']+)["']/g;
        const toolNames = new Map();
        for (const [file, content] of ctx.files) {
            let match;
            while ((match = toolNamePattern.exec(content)) !== null) {
                const name = match[1];
                if (!toolNames.has(name))
                    toolNames.set(name, []);
                toolNames.get(name).push(file);
            }
            toolNamePattern.lastIndex = 0;
        }
        for (const [name, files] of toolNames) {
            if (files.length > 1) {
                diagnostics.push({
                    ruleId: "CFG-008",
                    severity: "error",
                    category: "config",
                    title: "Duplicate tool names",
                    remediation: `Tool name "${name}" is registered in multiple files: ${files.join(", ")}. Use unique names.`,
                });
            }
        }
        return diagnostics;
    },
};
//# sourceMappingURL=cfg-008.js.map