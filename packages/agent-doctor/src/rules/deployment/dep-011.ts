import type { Rule, Diagnostic, RuleContext } from "../../types";

export const dep011: Rule = {
  id: "DEP-011",
  category: "deployment",
  severity: "warn",
  title: "Base image not pinned",
  check(ctx: RuleContext): Diagnostic[] {
    const dockerfileContent = ctx.files.get("Dockerfile");
    if (!dockerfileContent) return [];

    const fromPattern = /^FROM\s+(\S+)/m;
    const match = fromPattern.exec(dockerfileContent);
    if (match) {
      const image = match[1];
      if (image.endsWith(":latest") || !image.includes(":")) {
        return [{
          ruleId: "DEP-011",
          severity: "warn",
          category: "deployment",
          title: "Base image not pinned",
          file: "Dockerfile",
          remediation: `Pin the base image to a specific version (e.g., node:20.11.0-alpine) instead of "${image}".`,
        }];
      }
    }
    return [];
  },
};
