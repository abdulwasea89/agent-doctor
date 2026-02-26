"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sec013 = void 0;
exports.sec013 = {
    id: "SEC-013",
    category: "security",
    severity: "error",
    title: "Process runs as root",
    check(ctx) {
        const diagnostics = [];
        const dockerfileContent = ctx.files.get("Dockerfile");
        if (!dockerfileContent)
            return diagnostics;
        if (!dockerfileContent.includes("USER ") || /USER\s+root/i.test(dockerfileContent)) {
            diagnostics.push({
                ruleId: "SEC-013",
                severity: "error",
                category: "security",
                title: "Process runs as root",
                file: "Dockerfile",
                remediation: "Add a non-root USER directive in your Dockerfile (e.g., USER node).",
            });
        }
        return diagnostics;
    },
};
//# sourceMappingURL=sec-013.js.map