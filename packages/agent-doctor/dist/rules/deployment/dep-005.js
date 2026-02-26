"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dep005 = void 0;
exports.dep005 = {
    id: "DEP-005",
    category: "deployment",
    severity: "warn",
    title: "Dev and prod config not separated",
    check(ctx) {
        const envSeparationPattern = /NODE_ENV|DEPLOY_ENV|APP_ENV|\.env\.prod|\.env\.dev|config\/prod|config\/dev/;
        let found = false;
        for (const [, content] of ctx.files) {
            if (envSeparationPattern.test(content)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "DEP-005",
                    severity: "warn",
                    category: "deployment",
                    title: "Dev and prod config not separated",
                    remediation: "Use environment-specific config files or DEPLOY_ENV checks to separate dev/prod settings.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=dep-005.js.map