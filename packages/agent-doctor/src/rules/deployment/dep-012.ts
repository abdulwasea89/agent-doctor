import type { Rule, Diagnostic, RuleContext } from "../../types";

export const dep012: Rule = {
  id: "DEP-012",
  category: "deployment",
  severity: "warn",
  title: "No graceful shutdown",
  check(ctx: RuleContext): Diagnostic[] {
    const shutdownPattern = /signal\.signal|process\.on\(['"]SIGTERM|SIGTERM|graceful.*shutdown|shutdown.*handler/i;
    let found = false;

    for (const [, content] of ctx.files) {
      if (shutdownPattern.test(content)) { found = true; break; }
    }

    if (!found) {
      return [{
        ruleId: "DEP-012",
        severity: "warn",
        category: "deployment",
        title: "No graceful shutdown",
        remediation: "Handle SIGTERM to gracefully finish in-flight requests before shutting down.",
      }];
    }
    return [];
  },
};
