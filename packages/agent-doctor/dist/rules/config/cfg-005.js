"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cfg005 = void 0;
exports.cfg005 = {
    id: "CFG-005",
    category: "config",
    severity: "warn",
    title: "Temperature too high",
    check(ctx) {
        const diagnostics = [];
        const tempPattern = /temperature\s*[:=]\s*([\d.]+)/g;
        for (const [file, content] of ctx.files) {
            let match;
            while ((match = tempPattern.exec(content)) !== null) {
                const val = parseFloat(match[1]);
                if (val > 0.9) {
                    const lineNum = content.substring(0, match.index).split("\n").length;
                    diagnostics.push({
                        ruleId: "CFG-005",
                        severity: "warn",
                        category: "config",
                        title: "Temperature too high",
                        file,
                        line: lineNum,
                        remediation: `Temperature is set to ${val}. Values above 0.9 can produce unreliable outputs. Use ≤ 0.7 for production.`,
                    });
                }
            }
            tempPattern.lastIndex = 0;
        }
        return diagnostics;
    },
};
//# sourceMappingURL=cfg-005.js.map