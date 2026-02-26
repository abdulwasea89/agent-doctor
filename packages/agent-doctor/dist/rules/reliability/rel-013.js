"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rel013 = void 0;
exports.rel013 = {
    id: "REL-013",
    category: "reliability",
    severity: "warn",
    title: "Single instance, no redundancy",
    check(ctx) {
        const replicaPattern = /replicas\s*:\s*(\d+)/g;
        let hasMultipleReplicas = false;
        for (const [file, content] of ctx.files) {
            if (!file.endsWith(".yaml") && !file.endsWith(".yml"))
                continue;
            let match;
            while ((match = replicaPattern.exec(content)) !== null) {
                if (parseInt(match[1]) > 1) {
                    hasMultipleReplicas = true;
                    break;
                }
            }
            replicaPattern.lastIndex = 0;
            if (hasMultipleReplicas)
                break;
        }
        if (!hasMultipleReplicas) {
            return [{
                    ruleId: "REL-013",
                    severity: "warn",
                    category: "reliability",
                    title: "Single instance, no redundancy",
                    remediation: "Configure at least 2 replicas for production availability.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=rel-013.js.map