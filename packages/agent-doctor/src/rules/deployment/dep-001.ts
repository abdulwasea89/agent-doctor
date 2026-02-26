import type { Rule, Diagnostic, RuleContext } from "../../types";

export const dep001: Rule = {
  id: "DEP-001",
  category: "deployment",
  severity: "warn",
  title: "No Dockerfile",
  check(ctx: RuleContext): Diagnostic[] {
    const hasDocker =
      ctx.files.has("Dockerfile") ||
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
