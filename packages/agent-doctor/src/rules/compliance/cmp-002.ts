import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cmp002: Rule = {
  id: "CMP-002",
  category: "compliance",
  severity: "warn",
  title: "No data retention policy",
  check(ctx: RuleContext): Diagnostic[] {
    const retentionPattern = /retention|data.expiry|delete.*after|purge.*after|ttl/i;
    
    const hasPolicyFile = Array.from(ctx.files.keys()).some(f =>
      f.toLowerCase().includes("retention") ||
      f.toLowerCase().includes("data-policy") ||
      f.toLowerCase().includes("data-retention")
    );
    
    if (hasPolicyFile) {
      return [];
    }

    let found = false;
    for (const [, content] of ctx.files) {
      if (retentionPattern.test(content)) { found = true; break; }
    }

    if (!found) {
      return [{
        ruleId: "CMP-002",
        severity: "warn",
        category: "compliance",
        title: "No data retention policy",
        remediation: "Implement a data retention policy with TTL or scheduled deletion jobs.",
      }];
    }
    return [];
  },
};
