"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dep002 = void 0;
exports.dep002 = {
    id: "DEP-002",
    category: "deployment",
    severity: "warn",
    title: "No CI/CD pipeline",
    check(ctx) {
        const hasCICD = Array.from(ctx.files.keys()).some(f => f.includes(".github/workflows") ||
            f.includes(".gitlab-ci.yml") ||
            f.includes("Jenkinsfile") ||
            f.includes(".circleci") ||
            f.includes("azure-pipelines"));
        if (!hasCICD) {
            return [{
                    ruleId: "DEP-002",
                    severity: "warn",
                    category: "deployment",
                    title: "No CI/CD pipeline",
                    remediation: "Set up a CI/CD pipeline (GitHub Actions, GitLab CI, etc.) to automate testing and deployment.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=dep-002.js.map