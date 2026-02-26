"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dep006 = void 0;
exports.dep006 = {
    id: "DEP-006",
    category: "deployment",
    severity: "warn",
    title: "No dependency lockfile",
    check(ctx) {
        const hasLockfile = ctx.files.has("package-lock.json") ||
            ctx.files.has("yarn.lock") ||
            ctx.files.has("pnpm-lock.yaml") ||
            ctx.files.has("poetry.lock") ||
            Array.from(ctx.files.keys()).some(f => f === "requirements.txt");
        if (!hasLockfile) {
            return [{
                    ruleId: "DEP-006",
                    severity: "warn",
                    category: "deployment",
                    title: "No dependency lockfile",
                    remediation: "Commit a lockfile (package-lock.json, poetry.lock, etc.) for reproducible builds.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=dep-006.js.map