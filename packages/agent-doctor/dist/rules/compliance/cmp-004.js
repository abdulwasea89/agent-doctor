"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmp004 = void 0;
exports.cmp004 = {
    id: "CMP-004",
    category: "compliance",
    severity: "warn",
    title: "No GDPR consent",
    check(ctx) {
        const gdprTrigger = /personal.data|user.data|GDPR|gdpr|EU.user|european/i;
        const consentPattern = /consent|opt.in|data.agreement|privacy.accept/i;
        let hasTrigger = false;
        let hasConsent = false;
        for (const [, content] of ctx.files) {
            if (gdprTrigger.test(content))
                hasTrigger = true;
            if (consentPattern.test(content))
                hasConsent = true;
        }
        if (hasTrigger && !hasConsent) {
            return [{
                    ruleId: "CMP-004",
                    severity: "warn",
                    category: "compliance",
                    title: "No GDPR consent",
                    remediation: "Implement consent collection and records for GDPR compliance.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=cmp-004.js.map