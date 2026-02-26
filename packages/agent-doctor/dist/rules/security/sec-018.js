"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sec018 = void 0;
exports.sec018 = {
    id: "SEC-018",
    category: "security",
    severity: "error",
    title: "Output not sanitized before rendering",
    check(ctx) {
        const diagnostics = [];
        const htmlRenderPattern = /innerHTML|dangerouslySetInnerHTML|\.html\(|render.*html/i;
        const sanitizePattern = /sanitize|DOMPurify|xss|escape|encode/i;
        for (const [file, content] of ctx.files) {
            if (!htmlRenderPattern.test(content))
                continue;
            if (!sanitizePattern.test(content)) {
                diagnostics.push({
                    ruleId: "SEC-018",
                    severity: "error",
                    category: "security",
                    title: "Output not sanitized before rendering",
                    file,
                    remediation: "Sanitize HTML output before rendering (e.g., use DOMPurify or similar).",
                });
            }
        }
        return diagnostics;
    },
};
//# sourceMappingURL=sec-018.js.map