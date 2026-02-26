"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sec007 = void 0;
exports.sec007 = {
    id: "SEC-007",
    category: "security",
    severity: "warn",
    title: "Unverified third-party tool",
    check(ctx) {
        const diagnostics = [];
        const pkgContent = ctx.files.get("package.json");
        if (!pkgContent)
            return diagnostics;
        try {
            const pkg = JSON.parse(pkgContent);
            const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
            const unpinned = Object.entries(allDeps).filter(([, v]) => /^[\^~]/.test(v) || v === "latest" || v === "*");
            if (unpinned.length > 0) {
                diagnostics.push({
                    ruleId: "SEC-007",
                    severity: "warn",
                    category: "security",
                    title: "Unverified third-party tool",
                    file: "package.json",
                    remediation: `${unpinned.length} dependencies use floating version ranges. Pin exact versions to prevent supply-chain attacks.`,
                });
            }
        }
        catch {
            // ignore parse errors
        }
        return diagnostics;
    },
};
//# sourceMappingURL=sec-007.js.map