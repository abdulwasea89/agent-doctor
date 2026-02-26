"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dep001 = void 0;
exports.dep001 = {
    id: "DEP-001",
    category: "deployment",
    severity: "warn",
    title: "No Dockerfile",
    check(ctx) {
        const hasDocker = ctx.files.has("Dockerfile") ||
            ctx.files.has("docker-compose.yml") ||
            ctx.files.has("docker-compose.yaml");
        if (!hasDocker) {
            return [{
                    ruleId: "DEP-001",
                    severity: "warn",
                    category: "deployment",
                    title: "No Dockerfile",
                    remediation: "Add a Dockerfile to containerize your agent for consistent deployments.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=dep-001.js.map