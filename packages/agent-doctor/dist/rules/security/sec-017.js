"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sec017 = void 0;
exports.sec017 = {
    id: "SEC-017",
    category: "security",
    severity: "error",
    title: "No SSRF protection",
    check(ctx) {
        const diagnostics = [];
        const urlFetchPattern = /fetch\(.*url|requests\.get\(|httpx\.get\(|axios\.get\(/;
        const ssrfPattern = /allowlist|allowedDomains|allowed_domains|isPrivateIP|ip.*check|domain.*whitelist/i;
        for (const [file, content] of ctx.files) {
            if (!urlFetchPattern.test(content))
                continue;
            if (!ssrfPattern.test(content)) {
                diagnostics.push({
                    ruleId: "SEC-017",
                    severity: "error",
                    category: "security",
                    title: "No SSRF protection",
                    file,
                    remediation: "Add IP range checks or domain allowlist before fetching user-supplied URLs.",
                });
            }
        }
        return diagnostics;
    },
};
//# sourceMappingURL=sec-017.js.map