"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dep008 = void 0;
exports.dep008 = {
    id: "DEP-008",
    category: "deployment",
    severity: "warn",
    title: "No resource limits",
    check(ctx) {
        const composeOrK8s = Array.from(ctx.files.keys()).some(f => f.includes("docker-compose") || f.endsWith(".yaml") || f.endsWith(".yml"));
        if (!composeOrK8s)
            return [];
        const resourcePattern = /resources.*limits|limits.*cpu|limits.*memory|mem_limit/i;
        let found = false;
        for (const [file, content] of ctx.files) {
            if (!file.endsWith(".yaml") && !file.endsWith(".yml"))
                continue;
            if (resourcePattern.test(content)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "DEP-008",
                    severity: "warn",
                    category: "deployment",
                    title: "No resource limits",
                    remediation: "Set CPU and memory limits in your Kubernetes/docker-compose config.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=dep-008.js.map