import type { Rule, Diagnostic, RuleContext } from "../../types";

export const dep007: Rule = {
  id: "DEP-007",
  category: "deployment",
  severity: "error",
  title: "Container runs as root",
  check(ctx: RuleContext): Diagnostic[] {
    const dockerfileContent = ctx.files.get("Dockerfile");
    if (!dockerfileContent) return [];

    if (!dockerfileContent.includes("USER ") || /USER\s+root/i.test(dockerfileContent)) {
      return [{
        ruleId: "DEP-007",
        severity: "error",
        category: "deployment",
        title: "Container runs as root",
        file: "Dockerfile",
        remediation: "Add a non-root USER in Dockerfile to avoid running as root.",
      }];
    }
    return [];
  },
};
