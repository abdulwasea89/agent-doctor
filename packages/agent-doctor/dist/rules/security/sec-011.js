"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sec011 = void 0;
exports.sec011 = {
    id: "SEC-011",
    category: "security",
    severity: "warn",
    title: "Schema exposes internal details",
    check(ctx) {
        const diagnostics = [];
        const internalPattern = /\/home\/|\/var\/|localhost|127\.0\.0\.1|internal\.|\.internal|_table|_schema/;
        for (const [file, content] of ctx.files) {
            const lines = content.split("\n");
            lines.forEach((line, i) => {
                if (internalPattern.test(line) && /description|schema|tool/i.test(line)) {
                    diagnostics.push({
                        ruleId: "SEC-011",
                        severity: "warn",
                        category: "security",
                        title: "Schema exposes internal details",
                        file,
                        line: i + 1,
                        remediation: "Remove internal paths, hostnames, or table names from tool descriptions/schemas.",
                    });
                }
            });
        }
        return diagnostics;
    },
};
//# sourceMappingURL=sec-011.js.map