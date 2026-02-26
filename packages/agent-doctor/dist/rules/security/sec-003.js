"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sec003 = void 0;
exports.sec003 = {
    id: "SEC-003",
    category: "security",
    severity: "error",
    title: "Destructive tool without confirmation",
    check(ctx) {
        const diagnostics = [];
        const destructivePattern = /\b(delete|remove|send|publish)\b/i;
        const safePattern = /\b(confirm|approval|approve)\b/i;
        for (const [file, content] of ctx.files) {
            const lines = content.split("\n");
            lines.forEach((line, i) => {
                if (destructivePattern.test(line) && !safePattern.test(line)) {
                    diagnostics.push({
                        ruleId: "SEC-003",
                        severity: "error",
                        category: "security",
                        title: "Destructive tool without confirmation",
                        file,
                        line: i + 1,
                        remediation: "Add a confirmation or approval step before executing destructive operations.",
                    });
                }
            });
        }
        return diagnostics;
    },
};
//# sourceMappingURL=sec-003.js.map