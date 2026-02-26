import type { Rule, Diagnostic, RuleContext } from "../../types";

export const rel012: Rule = {
  id: "REL-012",
  category: "reliability",
  severity: "warn",
  title: "Memory backend without persistence",
  check(ctx: RuleContext): Diagnostic[] {
    if (ctx.projectInfo.memoryBackend !== "redis") return [];

    const persistencePattern = /appendonly|AOF|RDB|save\s+\d|redis\.conf/i;
    let found = false;

    for (const [, content] of ctx.files) {
      if (persistencePattern.test(content)) { found = true; break; }
    }

    if (!found) {
      return [{
        ruleId: "REL-012",
        severity: "warn",
        category: "reliability",
        title: "Memory backend without persistence",
        remediation: "Enable Redis AOF or RDB persistence to survive restarts.",
      }];
    }
    return [];
  },
};
