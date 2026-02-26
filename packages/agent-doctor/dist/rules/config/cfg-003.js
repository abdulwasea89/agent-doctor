"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cfg003 = void 0;
exports.cfg003 = {
    id: "CFG-003",
    category: "config",
    severity: "warn",
    title: "Required env var missing",
    check(ctx) {
        const diagnostics = [];
        const envAccessPattern = /os\.environ\[|process\.env\./g;
        const validationPattern = /if\s*not\s+os\.environ|if\s*!\s*process\.env|dotenv\.config|required.*env|env.*required/i;
        for (const [file, content] of ctx.files) {
            if (!envAccessPattern.test(content)) {
                envAccessPattern.lastIndex = 0;
                continue;
            }
            envAccessPattern.lastIndex = 0;
            if (!validationPattern.test(content)) {
                diagnostics.push({
                    ruleId: "CFG-003",
                    severity: "warn",
                    category: "config",
                    title: "Required env var missing",
                    file,
                    remediation: "Validate required environment variables at startup and fail fast if missing.",
                });
            }
        }
        return diagnostics;
    },
};
//# sourceMappingURL=cfg-003.js.map