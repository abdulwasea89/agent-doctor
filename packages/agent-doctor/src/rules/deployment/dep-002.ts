import type { Rule, Diagnostic, RuleContext } from "../../types";

export const dep002: Rule = {
  id: "DEP-002",
  category: "deployment",
  severity: "warn",
  title: "No CI/CD pipeline",
  check(ctx: RuleContext): Diagnostic[] {
    const hasCICD = Array.from(ctx.files.keys()).some(f =>
      f.includes(".github/workflows") ||
      f.includes(".github/workflows/") ||
      f.includes(".gitlab-ci.yml") ||
      f.includes("Jenkinsfile") ||
      f.includes(".circleci") ||
      f.includes("azure-pipelines") ||
      f.endsWith(".yml") && f.includes("workflow") ||
      f.endsWith(".yaml") && f.includes("ci")
    );

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
