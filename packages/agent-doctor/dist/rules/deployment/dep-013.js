"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dep013 = void 0;
exports.dep013 = {
    id: "DEP-013",
    category: "deployment",
    severity: "warn",
    title: "No multi-AZ / HA",
    check(ctx) {
        const haPattern = /replicas\s*:\s*[2-9]|multi.az|availability.zone|HighAvailability|replication/i;
        let found = false;
        for (const [file, content] of ctx.files) {
            if (!file.endsWith(".yaml") && !file.endsWith(".yml"))
                continue;
            if (haPattern.test(content)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "DEP-013",
                    severity: "warn",
                    category: "deployment",
                    title: "No multi-AZ / HA",
                    remediation: "Configure multiple replicas and multi-AZ deployment for high availability.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=dep-013.js.map