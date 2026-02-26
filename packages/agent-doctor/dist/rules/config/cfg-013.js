"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cfg013 = void 0;
exports.cfg013 = {
    id: "CFG-013",
    category: "config",
    severity: "warn",
    title: "No agent version metadata",
    check(ctx) {
        const diagnostics = [];
        const versionPattern = /["']version["']\s*:/;
        const pkgContent = ctx.files.get("package.json");
        if (pkgContent && versionPattern.test(pkgContent))
            return diagnostics;
        const pyprojectContent = ctx.files.get("pyproject.toml");
        if (pyprojectContent && /^version\s*=/m.test(pyprojectContent))
            return diagnostics;
        diagnostics.push({
            ruleId: "CFG-013",
            severity: "warn",
            category: "config",
            title: "No agent version metadata",
            remediation: "Add a version field to your package.json or pyproject.toml to track agent versions.",
        });
        return diagnostics;
    },
};
//# sourceMappingURL=cfg-013.js.map